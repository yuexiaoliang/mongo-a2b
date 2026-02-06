import type { Db, Document } from 'mongodb'
import type { CollectionSyncResult, MigrationOptions } from '../types'
import { debug, info, warn } from '../utils/logger'
import { createProgress } from '../utils/progress'

/**
 * Sync a single collection
 */
export async function syncCollection(
  sourceDb: Db,
  targetDb: Db,
  collectionName: string,
  options: MigrationOptions,
): Promise<CollectionSyncResult> {
  const startTime = Date.now()
  let documentCount = 0

  try {
    const sourceCollection = sourceDb.collection(collectionName)
    const targetCollection = targetDb.collection(collectionName)

    // Get source collection document count
    const totalDocs = await sourceCollection.countDocuments()

    if (totalDocs === 0) {
      info(`${collectionName}: Empty collection, skipping`)
      return {
        collection: collectionName,
        success: true,
        documentCount: 0,
        duration: Date.now() - startTime,
      }
    }

    // Dry run mode
    if (options.dryRun) {
      info(`${collectionName}: [DRY-RUN] Would migrate ${totalDocs} documents`)
      return {
        collection: collectionName,
        success: true,
        documentCount: totalDocs,
        duration: Date.now() - startTime,
      }
    }

    // Drop target collection
    if (options.dropTarget) {
      debug(`${collectionName}: Dropping target collection...`)
      await targetCollection.deleteMany({})
    }

    // Copy indexes
    await copyIndexes(sourceCollection, targetCollection, collectionName)

    // Create progress tracker
    const progress = createProgress(collectionName, totalDocs)

    // Batch read and write
    const cursor = sourceCollection.find({})
    let batch: Document[] = []

    for await (const doc of cursor) {
      batch.push(doc)
      documentCount++

      if (batch.length >= options.batchSize) {
        await targetCollection.insertMany(batch, { ordered: false })
        progress.update(documentCount)
        batch = []
      }
    }

    // Process remaining documents
    if (batch.length > 0) {
      await targetCollection.insertMany(batch, { ordered: false })
    }

    progress.finish()

    return {
      collection: collectionName,
      success: true,
      documentCount,
      duration: Date.now() - startTime,
    }
  }
  catch (err) {
    const error = err as Error
    return {
      collection: collectionName,
      success: false,
      documentCount,
      duration: Date.now() - startTime,
      error: error.message,
    }
  }
}

/**
 * Copy collection indexes
 */
async function copyIndexes(
  sourceCollection: ReturnType<Db['collection']>,
  targetCollection: ReturnType<Db['collection']>,
  collectionName: string,
): Promise<void> {
  try {
    const indexes = await sourceCollection.listIndexes().toArray()

    for (const index of indexes) {
      // Skip _id index
      if (index.name === '_id_') {
        continue
      }

      try {
        const { key, ...options } = index
        delete (options as Record<string, unknown>).v
        delete (options as Record<string, unknown>).ns

        await targetCollection.createIndex(key, options)
        debug(`${collectionName}: Created index ${index.name}`)
      }
      catch (indexErr) {
        warn(`${collectionName}: Failed to create index ${index.name}: ${(indexErr as Error).message}`)
      }
    }
  }
  catch (err) {
    warn(`${collectionName}: Failed to get indexes: ${(err as Error).message}`)
  }
}
