import type { Config, MigrationResult } from '../types'
import pc from 'picocolors'
import { box, info, error as logError, setVerbose, success, warn } from '../utils/logger'
import { formatDuration } from '../utils/progress'
import { connect, disconnect } from './connection'
import { syncCollection } from './sync'

/**
 * Execute data migration
 */
export async function migrate(config: Config): Promise<MigrationResult> {
  const startTime = Date.now()

  // Set verbose logging mode
  setVerbose(config.options.verbose)

  // Show migration info
  info('Starting data migration...')
  info(`Batch size: ${config.options.batchSize}`)
  if (config.options.dropTarget) {
    warn('dropTarget enabled, target collections will be cleared')
  }
  if (config.options.dryRun) {
    warn('Dry run mode, no data will be written')
  }

  let sourceConnection = null
  let targetConnection = null

  try {
    // Connect to databases
    sourceConnection = await connect(config.source, 'Source')
    targetConnection = await connect(config.target, 'Target')

    const { db: sourceDb, dbName: sourceDbName } = sourceConnection
    const { db: targetDb, dbName: targetDbName } = targetConnection

    // Get collections to migrate
    const allCollections = await sourceDb.listCollections().toArray()
    let collectionNames = allCollections
      .filter(c => c.type === 'collection')
      .map(c => c.name)

    // Filter collections
    if (config.collections.length > 0) {
      collectionNames = collectionNames.filter(name => config.collections.includes(name))
    }
    if (config.exclude.length > 0) {
      collectionNames = collectionNames.filter(name => !config.exclude.includes(name))
    }

    if (collectionNames.length === 0) {
      warn('No collections found to migrate')
      return {
        success: true,
        sourceDatabase: sourceDbName,
        targetDatabase: targetDbName,
        collections: [],
        totalDuration: Date.now() - startTime,
        totalDocuments: 0,
      }
    }

    info(`Migrating ${collectionNames.length} collections: ${collectionNames.join(', ')}`)

    // Migrate each collection
    const results = []
    for (const collectionName of collectionNames) {
      const result = await syncCollection(sourceDb, targetDb, collectionName, config.options)
      results.push(result)

      if (!result.success) {
        logError(`${collectionName}: Migration failed - ${result.error}`)
      }
    }

    // Calculate statistics
    const totalDuration = Date.now() - startTime
    const totalDocuments = results.reduce((sum, r) => sum + r.documentCount, 0)
    const failedCount = results.filter(r => !r.success).length
    const allSuccess = failedCount === 0

    // Show summary
    const summary = [
      `${pc.bold('Migration Complete')}`,
      `Source: ${pc.cyan(sourceDbName)}`,
      `Target: ${pc.cyan(targetDbName)}`,
      `Collections: ${collectionNames.length}`,
      `Documents: ${pc.yellow(String(totalDocuments))}`,
      `Duration: ${pc.green(formatDuration(totalDuration))}`,
      failedCount > 0 ? `${pc.red(`Failed: ${failedCount} collections`)}` : '',
    ].filter(Boolean).join('\n')

    box(summary)

    if (allSuccess) {
      success('All collections migrated successfully!')
    }
    else {
      warn(`${failedCount} collections failed to migrate`)
    }

    return {
      success: allSuccess,
      sourceDatabase: sourceDbName,
      targetDatabase: targetDbName,
      collections: results,
      totalDuration,
      totalDocuments,
    }
  }
  finally {
    // Close connections
    if (sourceConnection) {
      await disconnect(sourceConnection.client, 'Source')
    }
    if (targetConnection) {
      await disconnect(targetConnection.client, 'Target')
    }
  }
}
