import type { Db } from 'mongodb'
import type { ConnectionConfig } from '../types'
import { MongoClient } from 'mongodb'
import { getDatabaseName } from '../config/loader'
import { debug, error, info } from '../utils/logger'

/**
 * Connection result
 */
export interface ConnectionResult {
  client: MongoClient
  db: Db
  dbName: string
}

/**
 * Connect to MongoDB
 */
export async function connect(config: ConnectionConfig, label: string): Promise<ConnectionResult> {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      debug(`${label}: Attempting connection (${attempt}/${maxRetries})...`)

      const client = new MongoClient(config.uri, config.options)
      await client.connect()

      // Test connection
      await client.db('admin').command({ ping: 1 })

      const dbName = getDatabaseName(config)
      const db = client.db(dbName)

      info(`${label}: Connected to ${dbName}`)
      return { client, db, dbName }
    }
    catch (err) {
      lastError = err as Error
      error(`${label}: Connection failed (${attempt}/${maxRetries}): ${lastError.message}`)

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = 1000 * 2 ** (attempt - 1)
        debug(`${label}: Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`${label}: Unable to connect to database - ${lastError?.message}`)
}

/**
 * Close connection
 */
export async function disconnect(client: MongoClient, label: string): Promise<void> {
  try {
    await client.close()
    debug(`${label}: Connection closed`)
  }
  catch (err) {
    error(`${label}: Error closing connection: ${(err as Error).message}`)
  }
}
