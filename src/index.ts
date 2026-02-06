export { mergeConfig } from './config/loader'

// 核心功能导出
export { migrate } from './core/migrator'
// 类型导出
export type {
  CliOptions,
  CollectionSyncResult,
  Config,
  ConnectionConfig,
  MigrationOptions,
  MigrationResult,
} from './types'
export { DEFAULT_OPTIONS } from './types'
