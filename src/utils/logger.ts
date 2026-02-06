import { consola, createConsola } from 'consola'

let verboseMode = false

/**
 * 设置日志详细模式
 */
export function setVerbose(verbose: boolean): void {
  verboseMode = verbose
}

/**
 * 创建日志实例
 */
export const logger = createConsola({
  level: 4,
})

/**
 * 普通信息输出
 */
export function info(message: string, ...args: unknown[]): void {
  logger.info(message, ...args)
}

/**
 * 成功信息输出
 */
export function success(message: string, ...args: unknown[]): void {
  logger.success(message, ...args)
}

/**
 * 警告信息输出
 */
export function warn(message: string, ...args: unknown[]): void {
  logger.warn(message, ...args)
}

/**
 * 错误信息输出
 */
export function error(message: string, ...args: unknown[]): void {
  logger.error(message, ...args)
}

/**
 * 调试信息输出（仅在 verbose 模式下）
 */
export function debug(message: string, ...args: unknown[]): void {
  if (verboseMode) {
    logger.debug(message, ...args)
  }
}

/**
 * 开始一个操作
 */
export function start(message: string): void {
  logger.start(message)
}

/**
 * 显示一个框
 */
export function box(message: string): void {
  consola.box(message)
}

export default {
  info,
  success,
  warn,
  error,
  debug,
  start,
  box,
  setVerbose,
}
