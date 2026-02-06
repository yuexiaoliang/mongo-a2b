# mongo-a2b

[![npm version](https://img.shields.io/npm/v/mongo-a2b.svg)](https://www.npmjs.com/package/mongo-a2b)
[![license](https://img.shields.io/npm/l/mongo-a2b.svg)](https://github.com/yuexiaoliang/mongo-a2b/blob/main/LICENSE)

MongoDB migration tool - Sync data from source database to target database.

[中文文档](./README.zh-CN.md)

## Features

- Full database migration support
- Command line and config file support
- Batch processing for large datasets
- Index copying
- Dry run mode
- Progress display

## Installation

```bash
npm install -g mongo-a2b
# or
pnpm add -g mongo-a2b
# or
npx mongo-a2b
```

## Usage

### Command Line

```bash
# Basic usage
mongo-a2b --source mongodb://localhost:27017/sourcedb --target mongodb://localhost:27017/targetdb

# With config file
mongo-a2b --config mongo-a2b.config.json

# Migrate specific collections
mongo-a2b -s mongodb://localhost:27017/sourcedb -t mongodb://localhost:27017/targetdb --collections users,orders

# Dry run (show plan without executing)
mongo-a2b --config mongo-a2b.config.json --dry-run

# Drop target collections before migration
mongo-a2b --config mongo-a2b.config.json --drop-target
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--source <uri>` | `-s` | Source database connection URI | - |
| `--target <uri>` | `-t` | Target database connection URI | - |
| `--config <path>` | `-c` | Config file path | - |
| `--collections <list>` | - | Collections to migrate (comma-separated) | All |
| `--exclude <list>` | - | Collections to exclude (comma-separated) | - |
| `--batch-size <number>` | - | Batch insert size | 1000 |
| `--drop-target` | - | Drop target collections before migration | false |
| `--dry-run` | - | Show migration plan without executing | false |
| `--verbose` | `-v` | Verbose output mode | false |

### Config File

Create a `mongo-a2b.config.json` or `mongo-a2b.config.yaml` file:

**JSON format:**

```json
{
  "source": "mongodb://localhost:27017/sourcedb",
  "target": "mongodb://localhost:27017/targetdb",
  "collections": ["users", "orders"],
  "exclude": ["temp", "logs"],
  "options": {
    "batchSize": 1000,
    "dropTarget": false,
    "dryRun": false,
    "verbose": true
  }
}
```

**YAML format:**

```yaml
source: mongodb://localhost:27017/sourcedb
target: mongodb://localhost:27017/targetdb

collections:
  - users
  - orders

exclude:
  - temp
  - logs

options:
  batchSize: 1000
  dropTarget: false
  dryRun: false
  verbose: true
```

**Advanced config with connection options:**

```json
{
  "source": {
    "uri": "mongodb://user:pass@localhost:27017",
    "database": "sourcedb",
    "options": {
      "authSource": "admin"
    }
  },
  "target": {
    "uri": "mongodb://user:pass@localhost:27017",
    "database": "targetdb"
  }
}
```

## How It Works

1. Connect to source and target MongoDB databases
2. List all collections from source database
3. Filter collections based on `collections` and `exclude` options
4. For each collection:
   - Copy indexes from source to target
   - Read documents in batches using cursor
   - Insert documents to target using `insertMany`
5. Display migration summary

## Requirements

- Node.js >= 18
- MongoDB 4.0+

## License

[MIT](./LICENSE) License © 2026 [岳晓亮](https://github.com/yuexiaoliang)
