<!--
DRAFT — STD cover not generated.
Real env: regenerate with new-design --template contracts.specification (or interfaces.control — confirm).
-->

# Piko 接口契约：Skill Tools Identity Schema V0.1

> **⚠️ DRAFT — STD cover 未生成**。本文件标 V0.1 skill-tools 集成对 `RuntimeConfig.identity` schema 的精确改动。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-skill-tools-identity-contract` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Template ID | `contracts.specification` |
| Last Modified Date | `2026-10-18` |

---

## 1. 契约范围

本契约定义 `RuntimeConfig.identity` 字段的 JSON Schema 扩展（V0.1），用于 V0.1 skill-tools 集成。

涉及文件：
- `interfaces/schemas/piko-runtime-config-v0.3.schema.json`（修改）
- `src/types.ts`（TypeScript `MemoryConfig` + `RuntimeConfig.identity` 类型）

## 2. 现有 schema 状态

**当前** `piko-runtime-config-v0.3.schema.json`：
- `required` 列表里**没有** `identity`
- `properties` 里**没有** `identity` 定义
- 即使 `src/types.ts` 接受 `identity?`，schema validator 会拒（fail at startup）

**变更**：加 `identity` 为 optional 字段。

## 3. 新字段 schema

### 3.1 `identity` 顶层字段

```json
{
  "identity": {
    "type": "object",
    "additionalProperties": false,
    "required": ["role", "name", "memory"],
    "properties": {
      "role": {
        "type": "string",
        "pattern": "^[a-z_][a-z0-9_]{0,63}$",
        "description": "Role of this Piko instance (e.g. 'tester', 'developer', 'pm'). Used for skill experience per-role isolation."
      },
      "name": {
        "type": "string",
        "pattern": "^[A-Za-z0-9._:-]{1,128}$",
        "description": "Human-readable identity (e.g. 'alice:tester')."
      },
      "memory": {
        "type": "object",
        "additionalProperties": false,
        "required": ["provider", "api_key_secret_ref"],
        "properties": {
          "provider": {
            "const": "mem0",
            "description": "V0.1: hard-code 'mem0'. Future versions may support other backends."
          },
          "api_key_secret_ref": {
            "$ref": "#/$defs/secretRef",
            "description": "Secret ref for Mem0 API key. Use env:XXX or file:XXX. Resolved at startup via config.resolveSecret."
          },
          "base_url": {
            "type": "string",
            "format": "uri",
            "description": "Mem0 base URL. Omit for Cloud (default https://api.mem0.ai). Required for self-hosted."
          },
          "user_id_template": {
            "type": "string",
            "default": "${role}:${project_name}",
            "description": "Template for Mem0 user_id. V0.1 only supports ${role} and ${project_name}."
          }
        }
      }
    }
  }
}
```

### 3.2 顶层改动

**`required` 列表**：
```diff
   "required": [
     "instance_id",
     "listen",
     "api_auth",
     "task_store",
     "pi",
     "agent",
     "workspace",
     "tools",
     "matrix",
     "llmtier",
     "queue",
     "retention",
     "observability",
     "transfer"
-  ]
+  ],
+  "//": "identity is optional (only needed for V0.1 skill-tools)"
```

`identity` 不加进 `required`（向后兼容，未配 skill-tools 的实例不强制要 identity）。

**`properties` 顶层**：加 `identity` 字段（见 §3.1）。

## 4. TypeScript 类型（src/types.ts）

### 4.1 `MemoryConfig`

```typescript
export type MemoryConfig = {
  /** V0.1: hard-code "mem0" */
  provider: "mem0";
  /** Secret ref: env:XXX or file:XXX; resolved via config.resolveSecret */
  api_key_secret_ref: string;
  /** Self-hosted base URL; omitted = Cloud (https://api.mem0.ai) */
  base_url?: string;
  /** User ID template; default "${role}:${project_name}" */
  user_id_template?: string;
};
```

### 4.2 `RuntimeConfig.identity`

```typescript
identity?: {
  /** Role of this Piko instance */
  role: string;
  /** Human-readable identity */
  name: string;
  /** V0.1: external memory backend config */
  memory: MemoryConfig;
};
```

**删除**：原 `memory_root`、`graphrag`、`gitnexus` 字段。

## 5. 向后兼容

- `identity` 是 optional，未配的实例照常工作（无 skill-tools）
- 删除 `memory_root` 是 **breaking change**（V0.3 schema bump 配套）

如果需要兼容旧配置：
- 过渡期保留 `memory_root` 字段（标记 deprecated），运行时 warning
- V1.x 删除

**V0.1 决策**：直接删，不做兼容期（V0.3 还没 release，无生产用户）。

## 6. 验证

### 6.1 schema 验证

修改 schema 后，跑：

```bash
# 用 Ajv 校验 sample config
node -e "
const Ajv = require('/sessions/amazing-stoic-goldberg/mnt/piko/node_modules/ajv/dist/2020').default;
const ajv = new Ajv({allErrors:true, strict:false});
const schema = require('/Users/ben/work/piko/interfaces/schemas/piko-runtime-config-v0.3.schema.json');
const sample = {
  // ... 现有必填字段
  identity: {
    role: 'tester',
    name: 'alice:tester',
    memory: {
      provider: 'mem0',
      api_key_secret_ref: 'env:MEMO0_API_KEY',
    },
  },
};
console.log(ajv.validate(schema, sample) ? 'OK' : ajv.errorsText(ajv.errors));
"
```

### 6.2 启动测试

Piko bootstrap 加载 config 时应该：
- 无 `identity`：启动 OK，无 skill-tools
- 有 `identity` 但 `memory.api_key_secret_ref` 解析失败：S5 阶段 fail（resolveSecret 抛）
- 有 `identity.memory`：S7 阶段不验 Mem0 可达（V0.1 lazy）；运行时调时才验

## 7. 与其他契约的关系

| 契约 | 关系 |
|---|---|
| `piko-agent-runtime-contract-v0.3.md` | 父契约，本契约是它的扩展 |
| `piko-v0.3-field-usage.md` | 需更新加 `identity` 字段使用说明 |

## 8. 风险

| 风险 | 缓解 |
|---|---|
| Schema 改错启动失败 | Ajv 测试覆盖；CI 集成 |
| `api_key_secret_ref` 拼错导致解析失败 | 启动 fail-fast（resolveSecret 抛错信息清晰）|
| `user_id_template` 包含未支持变量 | V0.1 只解 `${role}` / `${project_name}`，其他原样输出（静默错）→ V1.x 加白名单校验 |

---

## 附录 A：完整新 schema 片段（直接 paste）

```json
{
  "identity": {
    "type": "object",
    "additionalProperties": false,
    "required": ["role", "name", "memory"],
    "properties": {
      "role": {
        "type": "string",
        "pattern": "^[a-z_][a-z0-9_]{0,63}$"
      },
      "name": {
        "type": "string",
        "pattern": "^[A-Za-z0-9._:-]{1,128}$"
      },
      "memory": {
        "type": "object",
        "additionalProperties": false,
        "required": ["provider", "api_key_secret_ref"],
        "properties": {
          "provider": {"const": "mem0"},
          "api_key_secret_ref": {"$ref": "#/$defs/secretRef"},
          "base_url": {"type": "string", "format": "uri"},
          "user_id_template": {"type": "string"}
        }
      }
    }
  }
}
```

加到 `properties` 顶层 + `additionalProperties: false` 仍生效（identity 自己约束 additionalProperties: false）。