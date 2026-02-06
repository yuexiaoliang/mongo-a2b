import type { CliOptions, Config, ConnectionConfig, MigrationOptions } from '../types'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { parse as parseYaml } from 'yaml'
import { DEFAULT_OPTIONS } from '../types'
import { configFileSchema } from './schema'

/**
 * Default config file names
 */
const CONFIG_FILES = [
  'mongo-a2b.config.json',
  'mongo-a2b.config.yaml',
  'mongo-a2b.config.yml',
]

/**
 * Find config file
 */
export function findConfigFile(cwd: string = process.cwd()): string | null {
  for (const file of CONFIG_FILES) {
    const path = resolve(cwd, file)
    if (existsSync(path)) {
      return path
    }
  }
  return null
}

/**
 * Load config file
 */
export function loadConfigFile(filePath: string): unknown {
  const content = readFileSync(filePath, 'utf-8')

  if (filePath.endsWith('.json')) {
    return JSON.parse(content)
  }

  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return parseYaml(content)
  }

  throw new Error(`Unsupported config file format: ${filePath}`)
}

/**
 * Normalize connection config from string to object
 */
function normalizeConnectionConfig(input: string | ConnectionConfig): ConnectionConfig {
  if (typeof input === 'string') {
    return { uri: input }
  }
  return input
}

/**
 * Get database name from config or URI
 */
export function getDatabaseName(config: ConnectionConfig): string {
  if (config.database) {
    return config.database
  }

  // Extract database name from URI
  try {
    const url = new URL(config.uri)
    const dbName = url.pathname.slice(1).split('?')[0]
    if (dbName) {
      return dbName
    }
  }
  catch {
    // URI format may be non-standard, ignore error
  }

  throw new Error('Cannot determine database name. Please specify it in URI or use the database config option')
}

/**
 * Merge CLI options and config file
 */
export function mergeConfig(cliOptions: CliOptions): Config {
  let fileConfig: Record<string, unknown> = {}

  // Load config file
  if (cliOptions.config) {
    if (!existsSync(cliOptions.config)) {
      throw new Error(`Config file not found: ${cliOptions.config}`)
    }
    fileConfig = loadConfigFile(cliOptions.config) as Record<string, unknown>
  }
  else {
    // Try to find default config file
    const defaultConfig = findConfigFile()
    if (defaultConfig) {
      fileConfig = loadConfigFile(defaultConfig) as Record<string, unknown>
    }
  }

  // Validate config file format
  const parsedFileConfig = configFileSchema.parse(fileConfig)

  // Build source config
  let sourceConfig: ConnectionConfig
  if (cliOptions.source) {
    sourceConfig = { uri: cliOptions.source }
  }
  else if (parsedFileConfig.source) {
    sourceConfig = normalizeConnectionConfig(parsedFileConfig.source)
  }
  else {
    throw new Error('Missing source database config (--source or source in config file)')
  }

  // Build target config
  let targetConfig: ConnectionConfig
  if (cliOptions.target) {
    targetConfig = { uri: cliOptions.target }
  }
  else if (parsedFileConfig.target) {
    targetConfig = normalizeConnectionConfig(parsedFileConfig.target)
  }
  else {
    throw new Error('Missing target database config (--target or target in config file)')
  }

  // Parse collections and exclude
  const collections = cliOptions.collections
    ? cliOptions.collections.split(',').map(s => s.trim()).filter(Boolean)
    : parsedFileConfig.collections || []

  const exclude = cliOptions.exclude
    ? cliOptions.exclude.split(',').map(s => s.trim()).filter(Boolean)
    : parsedFileConfig.exclude || []

  // Merge options (CLI takes priority)
  const options: MigrationOptions = {
    batchSize: cliOptions.batchSize ?? parsedFileConfig.options?.batchSize ?? DEFAULT_OPTIONS.batchSize,
    dropTarget: cliOptions.dropTarget ?? parsedFileConfig.options?.dropTarget ?? DEFAULT_OPTIONS.dropTarget,
    dryRun: cliOptions.dryRun ?? parsedFileConfig.options?.dryRun ?? DEFAULT_OPTIONS.dryRun,
    verbose: cliOptions.verbose ?? parsedFileConfig.options?.verbose ?? DEFAULT_OPTIONS.verbose,
  }

  return {
    source: sourceConfig,
    target: targetConfig,
    collections,
    exclude,
    options,
  }
}
