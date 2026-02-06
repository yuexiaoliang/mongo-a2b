import { z } from 'zod'

/**
 * Connection config schema
 */
export const connectionConfigSchema = z.object({
  uri: z.string().min(1, 'Connection URI cannot be empty'),
  database: z.string().optional(),
  options: z.record(z.unknown()).optional(),
})

/**
 * Migration options schema
 */
export const migrationOptionsSchema = z.object({
  batchSize: z.number().int().positive().default(1000),
  dropTarget: z.boolean().default(false),
  dryRun: z.boolean().default(false),
  verbose: z.boolean().default(false),
})

/**
 * Config file schema (supports simplified format)
 */
export const configFileSchema = z.object({
  source: z.union([
    z.string(), // Simplified format: just URI
    connectionConfigSchema,
  ]).optional(),
  target: z.union([
    z.string(),
    connectionConfigSchema,
  ]).optional(),
  collections: z.array(z.string()).optional().default([]),
  exclude: z.array(z.string()).optional().default([]),
  options: migrationOptionsSchema.partial().optional().default({}),
})

/**
 * Full config schema
 */
export const configSchema = z.object({
  source: connectionConfigSchema,
  target: connectionConfigSchema,
  collections: z.array(z.string()).default([]),
  exclude: z.array(z.string()).default([]),
  options: migrationOptionsSchema,
})

export type ConfigFileInput = z.input<typeof configFileSchema>
export type ConfigOutput = z.output<typeof configSchema>
