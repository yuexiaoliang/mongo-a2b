import pc from 'picocolors'
import { logger } from './logger'

/**
 * Progress tracker
 */
export interface ProgressTracker {
  /** Update progress */
  update: (current: number) => void
  /** Finish */
  finish: () => void
}

/**
 * Create progress tracker
 */
export function createProgress(collection: string, total: number): ProgressTracker {
  const startTime = Date.now()
  let lastLogTime = 0

  return {
    update(current: number) {
      const now = Date.now()
      // Log progress every 2 seconds
      if (now - lastLogTime > 2000) {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0
        const elapsed = (now - startTime) / 1000
        const speed = elapsed > 0 ? Math.round(current / elapsed) : 0

        logger.info(
          `${pc.cyan(collection)}: ${pc.yellow(`${current}/${total}`)} (${percent}%) - ${speed} docs/s`,
        )
        lastLogTime = now
      }
    },

    finish() {
      const elapsed = (Date.now() - startTime) / 1000
      logger.success(
        `${pc.cyan(collection)}: Done in ${pc.yellow(`${elapsed.toFixed(2)}s`)}`,
      )
    },
  }
}

/**
 * Format duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }

  const seconds = ms / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}
