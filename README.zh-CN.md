# mongo-a2b

[![npm version](https://img.shields.io/npm/v/mongo-a2b.svg)](https://www.npmjs.com/package/mongo-a2b)
[![license](https://img.shields.io/npm/l/mongo-a2b.svg)](https://github.com/yuexiaoliang/mongo-a2b/blob/main/LICENSE)

MongoDB 数据迁移工具 - 将数据从源数据库同步到目标数据库。

[English](./README.md)

## 特性

- 支持全量数据库迁移
- 支持命令行和配置文件两种使用方式
- 批量处理大数据集
- 自动复制索引
- 干运行模式
- 进度显示

## 安装

```bash
npm install -g mongo-a2b
# 或者
pnpm add -g mongo-a2b
# 或者
npx mongo-a2b
```

## 使用方法

### 命令行

```bash
# 基本用法
mongo-a2b --source mongodb://localhost:27017/sourcedb --target mongodb://localhost:27017/targetdb

# 使用配置文件
mongo-a2b --config mongo-a2b.config.json

# 迁移指定集合
mongo-a2b -s mongodb://localhost:27017/sourcedb -t mongodb://localhost:27017/targetdb --collections users,orders

# 干运行（仅显示计划，不执行）
mongo-a2b --config mongo-a2b.config.json --dry-run

# 迁移前清空目标集合
mongo-a2b --config mongo-a2b.config.json --drop-target
```

### 参数说明

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--source <uri>` | `-s` | 源数据库连接 URI | - |
| `--target <uri>` | `-t` | 目标数据库连接 URI | - |
| `--config <path>` | `-c` | 配置文件路径 | - |
| `--collections <list>` | - | 要迁移的集合（逗号分隔） | 全部 |
| `--exclude <list>` | - | 要排除的集合（逗号分隔） | - |
| `--batch-size <number>` | - | 批量插入大小 | 1000 |
| `--drop-target` | - | 迁移前清空目标集合 | false |
| `--dry-run` | - | 仅显示迁移计划，不执行 | false |
| `--verbose` | `-v` | 详细输出模式 | false |

### 配置文件

创建 `mongo-a2b.config.json` 或 `mongo-a2b.config.yaml` 文件：

**JSON 格式：**

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

**YAML 格式：**

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

**高级配置（包含连接选项）：**

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

## 工作原理

1. 连接到源数据库和目标数据库
2. 获取源数据库的所有集合列表
3. 根据 `collections` 和 `exclude` 参数过滤集合
4. 对每个集合：
   - 复制源集合的索引到目标集合
   - 使用游标分批读取文档
   - 使用 `insertMany` 批量插入到目标集合
5. 显示迁移摘要

## 系统要求

- Node.js >= 18
- MongoDB 4.0+

## 许可证

[MIT](./LICENSE) License © 2026 [岳晓亮](https://github.com/yuexiaoliang)
