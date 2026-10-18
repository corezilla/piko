<!--
DRAFT — STD cover not generated.
Update to piko-policy-impl.isd.md for V0.1 skill-tools.
-->

# Piko 实现规格：policy — V0.1 Skill Tools 更新

> **⚠️ DRAFT — STD cover 未生成 + 是 update**。原 ISD 完整，本文件标 V0.1 集成的精确改动。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-policy-impl-skill-tools-update` |
| Document Version | `0.1.0-draft` |
| Last Modified Date | `2026-10-18` |

---

## 1. 改动文件清单

| 文件 | 改动类型 | 行数预估 |
|---|---|---|
| `src/config.ts` | 修改（`knownTools` Set 扩 2 项）| ~2 行 |
| `config/tool-profiles.json` | 修改（两个 profile 各加 2 个工具条目）| ~20 行 |

无新文件。

## 2. `src/config.ts` 改动

### 2.1 `knownTools` Set 扩展

**位置**：`src/config.ts:28`

**当前**：
```typescript
const knownTools = new Set(["read", "write", "edit", "bash"]);
```

**改动**：
```typescript
const knownTools = new Set([
  "read", "write", "edit", "bash",
  // V0.1: skill experience tools (mem0 backend)
  "mem0_lookup", "mem0_record",
]);
```

## 3. `config/tool-profiles.json` 改动

### 3.1 `workspace-standard` profile 加 skill tools

**位置**：`config/tool-profiles.json` 第 10-36 行

**当前**：
```json
{
  "workspace-standard": {
    "tools": {
      "read":  { "effect": "read_only", "replay": "safe", "permissions": {"read_paths": []} },
      "write": { "effect": "workspace_write", "replay": "safe", "recovery_contract_ref": "workspace-atomic-write", "permissions": {"write_paths": []} },
      "edit":  { "effect": "workspace_write", "replay": "safe", "recovery_contract_ref": "workspace-atomic-write", "permissions": {"write_paths": []} }
    }
  }
}
```

**改动**：在 `edit` 之后加 `mem0_lookup` / `mem0_record`：

```json
{
  "workspace-standard": {
    "tools": {
      "read": {
        "effect": "read_only",
        "replay": "safe",
        "permissions": { "read_paths": [] }
      },
      "write": {
        "effect": "workspace_write",
        "replay": "safe",
        "recovery_contract_ref": "workspace-atomic-write",
        "permissions": { "write_paths": [] }
      },
      "edit": {
        "effect": "workspace_write",
        "replay": "safe",
        "recovery_contract_ref": "workspace-atomic-write",
        "permissions": { "write_paths": [] }
      },
      "mem0_lookup": {
        "effect": "external",
        "replay": "never",
        "permissions": {
          "network_hosts": ["api.mem0.ai"]
        }
      },
      "mem0_record": {
        "effect": "external",
        "replay": "never",
        "permissions": {
          "network_hosts": ["api.mem0.ai"]
        }
      }
    }
  }
}
```

### 3.2 `workspace-exec` profile 加 skill tools

**位置**：`config/tool-profiles.json` 第 37-78 行

**改动**：在 `bash` 条目之后加 `mem0_lookup` / `mem0_record`（同 §3.1 内容）。

## 4. 验证

### 4.1 schema 校验

```bash
# 用 Piko 的 schema 校验 tool-profiles.json
# Piko bootstrap 会跑 validateToolRegistry(config.ts:26)
/sessions/amazing-stoic-goldberg/mnt/piko/node_modules/.bin/tsc --noEmit
# 启动测试
node -e "
const c = require('/Users/ben/work/piko/config/tool-profiles.json');
const Ajv = require('/sessions/amazing-stoic-goldberg/mnt/piko/node_modules/ajv').default;
const ajv = new Ajv({allErrors:true,strict:false});
const schema = require('/Users/ben/work/piko/interfaces/schemas/piko-tool-profile-v0.3.schema.json');
console.log(ajv.validate(schema, c) ? 'OK' : ajv.errorsText(ajv.errors));
"
```

### 4.2 启动测试

修改后启动 Piko（如果配置了 `identity.memory`），应该：
- `knownTools` Set 含 `mem0_lookup` / `mem0_record`，不抛 `unregistered tool implementation`
- 工具 profile 校验通过

## 5. 不动的部分

- `RecoveryContract` 列表（skill tools 不需要 recovery contract，因 `replay: never`）
- `validateToolRegistry` 的校验逻辑
- Secret 解析路径

## 6. 自托管 URL 处理（V0.1 hard-code）

`network_hosts` 列表 V0.1 hard-code `api.mem0.ai`（Cloud 默认）。

**自托管用户的处理**（V0.1 不优雅但可用）：
- 如果用户配置 `RuntimeConfig.identity.memory.base_url = "https://my-mem0.local:8000"`，需要把 tool-profiles.json 的 `network_hosts` 也改成 `["my-mem0.local:8000"]`
- 这是手工同步，**V1.x 改进**：根据 config 动态生成 network_hosts

V0.1 文档明确这一点：**自托管用户必须同时改 `tool-profiles.json` 的 network_hosts**。

## 7. 风险

| 风险 | 缓解 |
|---|---|
| 忘改 `knownTools` Set | 启动校验会立刻抛 |
| `network_hosts` 跟实际 URL 不匹配 | 启动校验 + 文档说明 |
| `effect: "external"` 选错（vs `network`）| schema 已合法；本设计明确用 `external` |