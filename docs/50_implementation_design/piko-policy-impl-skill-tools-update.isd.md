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

---

## 8. 函数规格（详细）

> Policy update **不引入新函数**。本节详细描述被修改的现有函数 `validateToolRegistry` 的新行为 + 新数据结构字段。

### 8.1 `validateToolRegistry(tools)`（V0.1 行为变化）

**签名**（不变）：
```typescript
export function validateToolRegistry(tools: ToolRegistry): void
```

**V0.1 行为变化**：通过 `knownTools` Set 接受 `mem0_lookup` 和 `mem0_record`。

**校验流程**（来自原 `config.ts:26-46`）：

| 步骤 | 检查 | V0.1 错误消息 |
|---|---|---|
| 1 | 每个 `recovery_contracts` 的 `implementation_ref` 在 supported set | "unregistered recovery implementation: X" |
| 2 | 每个 profile 的每个工具名在 `knownTools` set | "unregistered tool implementation: X"（**V0.1 新覆盖 `mem0_lookup` / `mem0_record`**）|
| 3 | 工具 `recovery_contract_ref` 引用的 contract 存在 | "tool X has unbound recovery contract" |
| 4 | `replay: "safe"` 的非 read_only 工具有 `recovery_contract_ref` | "unsafe replay declaration: X" |
| 5 | `builtin:workspace-atomic-write` 只用于 `write`/`edit` | "workspace atomic recovery is not applicable to tool X" |
| 6 | `replay: "safe"` 的非 read_only 工具的 contract 是 `builtin:workspace-atomic-write` | "recovery implementation X is not available for local tool Y" |

**V0.1 新增校验**：**无新增校验**。`mem0_lookup` / `mem0_record` 的 `effect: "external"` + `replay: "never"` 自动通过所有现有检查（步骤 1、4、5、6 都不触发，因为它们针对 `recovery_contract` 或 `replay: "safe"`）。

**校验时机**：
- `loadConfig` 时调用一次（`config.ts:87`）
- 启动失败 → 进程非零退出

**异常**：`Error`（消息含具体哪个工具 / 哪条规则）

**线程安全**：N/A。

### 8.2 数据结构字段详情

**`ToolPolicy` 新增字段**（V0.1 schema 已支持，无需改 schema）：

| 字段 | 类型 | V0.1 mem0_lookup 用值 | V0.1 mem0_record 用值 |
|---|---|---|---|
| `effect` | `"read_only" \| "workspace_write" \| "process" \| "network" \| "external"` | `"external"` | `"external"` |
| `replay` | `"never" \| "safe"` | `"never"` | `"never"` |
| `recovery_contract_ref` | `string` \| undefined | `undefined` | `undefined` |
| `permissions.read_paths` | `string[]` \| undefined | `undefined`（external 不用）| `undefined` |
| `permissions.write_paths` | `string[]` \| undefined | `undefined` | `undefined` |
| `permissions.executables` | `string[]` \| undefined | `undefined` | `undefined` |
| `permissions.network_hosts` | `string[]` \| undefined | `["api.mem0.ai"]`（V0.1 hard-code）| `["api.mem0.ai"]`（V0.1 hard-code）|

**V0.1 自托管变体**：用户在 `RuntimeConfig.identity.memory.base_url` 写 `"https://my-mem0.local:8000"`，需要**手动**把 `network_hosts` 改成 `["my-mem0.local:8000"]`。V0.1 文档必须强调这一点。V1.x 改为根据 config 动态生成 `network_hosts`。

**`knownTools` Set**（V0.1 后）：
```typescript
const knownTools = new Set([
  "read", "write", "edit", "bash",
  "mem0_lookup", "mem0_record",  // V0.1 新增
]);
```

**`tool-profiles.json` 的 `tools` map 字段**（V0.1 新增 2 个 key）：

| key | effect | replay | permissions |
|---|---|---|---|
| `mem0_lookup` | `"external"` | `"never"` | `{ network_hosts: ["api.mem0.ai"] }` |
| `mem0_record` | `"external"` | `"never"` | `{ network_hosts: ["api.mem0.ai"] }` |

**两个 profile 都加**（`workspace-standard` 和 `workspace-exec`）。

### 8.3 修改边界

**不动**：
- `RecoveryContract` 类型（skill tools 不需要 recovery_contract_ref，因 `replay: "never"`）
- `validateToolRegistry` 的整体校验逻辑（V0.1 不加新分支）
- `BoundToolProfile` 类型
- `ToolRegistry` 类型

**改**：
- `knownTools` Set（§2.1）
- `tool-profiles.json` 两个 profile 的 `tools` map（§3.1, §3.2）

**新增**：无。