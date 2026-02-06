import type { MongoClientOptions } from 'mongodb'

/**
 * 数据库连接配置
 */
export interface ConnectionConfig {
  /** MongoDB 连接 URI */
  uri: string
  /** 数据库名称（可选，如果 URI 中已包含则不需要） */
  database?: string
  /** MongoDB 连接选项 */
  options?: MongoClientOptions
}

/**
 * 迁移选项
 */
export interface MigrationOptions {
  /** 批量插入大小 */
  batchSize: number
  /** 迁移前是否清空目标集合 */
  dropTarget: boolean
  /** 仅显示迁移计划，不执行 */
  dryRun: boolean
  /** 详细输出模式 */
  verbose: boolean
}

/**
 * 完整配置
 */
export interface Config {
  /** 源数据库配置 */
  source: ConnectionConfig
  /** 目标数据库配置 */
  target: ConnectionConfig
  /** 要迁移的集合列表（为空则迁移所有） */
  collections: string[]
  /** 要排除的集合列表 */
  exclude: string[]
  /** 迁移选项 */
  options: MigrationOptions
}

/**
 * CLI 参数
 */
export interface CliOptions {
  source?: string
  target?: string
  collections?: string
  exclude?: string
  batchSize?: number
  dropTarget?: boolean
  dryRun?: boolean
  config?: string
  verbose?: boolean
}

/**
 * 集合迁移结果
 */
export interface CollectionSyncResult {
  /** 集合名称 */
  collection: string
  /** 是否成功 */
  success: boolean
  /** 迁移的文档数量 */
  documentCount: number
  /** 耗时（毫秒） */
  duration: number
  /** 错误信息（如果失败） */
  error?: string
}

/**
 * 迁移总结果
 */
export interface MigrationResult {
  /** 是否成功 */
  success: boolean
  /** 源数据库名称 */
  sourceDatabase: string
  /** 目标数据库名称 */
  targetDatabase: string
  /** 各集合迁移结果 */
  collections: CollectionSyncResult[]
  /** 总耗时（毫秒） */
  totalDuration: number
  /** 总文档数 */
  totalDocuments: number
}

/**
 * 默认配置值
 */
export const DEFAULT_OPTIONS: MigrationOptions = {
  batchSize: 1000,
  dropTarget: false,
  dryRun: false,
  verbose: false,
}
