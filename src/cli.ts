#!/usr/bin/env node
import type { CliOptions } from './types'
import process from 'node:process'
import { program } from 'commander'
import { version } from '../package.json'
import { mergeConfig } from './config/loader'
import { migrate } from './core/migrator'
import { error as logError } from './utils/logger'

program
  .name('mongo-a2b')
  .description('MongoDB migration tool - Sync data from source database to target database')
  .version(version)

program
  .option('-s, --source <uri>', 'Source database connection URI')
  .option('-t, --target <uri>', 'Target database connection URI')
  .option('-c, --config <path>', 'Config file path')
  .option('--collections <list>', 'Collections to migrate (comma-separated)')
  .option('--exclude <list>', 'Collections to exclude (comma-separated)')
  .option('--batch-size <number>', 'Batch insert size', (val) => {
    const num = Number.parseInt(val, 10)
    if (Number.isNaN(num) || num <= 0) {
      throw new Error('batch-size must be a positive integer')
    }
    return num
  })
  .option('--drop-target', 'Drop target collections before migration')
  .option('--dry-run', 'Show migration plan without executing')
  .option('-v, --verbose', 'Verbose output mode')

program.parse()

// Show help if no arguments provided
if (process.argv.length <= 2) {
  program.help()
}

async function main(): Promise<void> {
  const opts = program.opts<CliOptions>()

  try {
    // 合并配置
    const config = mergeConfig(opts)

    // 执行迁移
    const result = await migrate(config)

    // 根据结果设置退出码
    process.exit(result.success ? 0 : 1)
  }
  catch (err) {
    logError((err as Error).message)
    process.exit(1)
  }
}

main()
