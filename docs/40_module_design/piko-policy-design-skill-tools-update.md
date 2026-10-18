<!--
DRAFT — STD cover not generated.
Update to piko-policy-design.md for V0.1 skill-tools integration.
Real env: regenerate full doc with new-design, incorporating these changes.
-->

# Piko 模块设计：policy — V0.1 Skill Tools 更新

> **⚠️ DRAFT — STD cover 未生成 + 是 update 而非完整 design**。原 `piko-policy-design.md`（1341 行）覆盖 M002 全貌。本文件只标 V0.1 skill-tools 集成的**精确变更点**。

| 文档字段 | 值（占位） |
|---|---|
| Document ID | `piko-policy-skill-tools-update` |
| Document Version | `0.1.0-draft` |
| Status | `Draft` |
| Project | `piko` |
| Supersedes | （局部）policy-design §X knownTools、§Y tool-profiles.json |
| Last Modified Date | `2026-10-18` |

---

## 1. 变更目标

V0.1 skill-tools 需要在 policy（M002）模块里加两个新工具声明：

1. `mem0_lookup` 和 `mem0_record` 加进 `config.ts:28` 的 `knownTools` Set
2. 两个工具条目加进 `config/tool-profiles.json` 的两个 profile（`workspace-standard` 和 `workspace-exec`）

## 2. knownTools Set 扩展

**当前实现**（`src/config.ts:28`）：
```typescript
const knownTools = new Set(["read", "write", "edit", "bash"]);
```

**变更后**：
```typescript
const knownTools = new Set([
  "read", "write", "edit", "bash",
  // V0.1: skill experience tools (mem0 backend)
  "mem0_lookup", "mem0_record",
]);
```

**为什么**：policy 启动时校验 `tool-profiles.json` 里声明的工具是否都已注册。如果 `mem0_lookup` 没在 `knownTools`，启动会抛 `unregistered tool implementation: mem0_lookup`。

## 3. tool-profiles.json 扩展

**当前 `workspace-standard` profile**：
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

**变更后**：
```json
{
  "workspace-standard": {
    "tools": {
      "read":  { "effect": "read_only", "replay": "safe", "permissions": {"read_paths": []} },
      "write": { "effect": "workspace_write", "replay": "safe", "recovery_contract_ref": "workspace-atomic-write", "permissions": {"write_paths": []} },
      "edit":  { "effect": "workspace_write", "replay": "safe", "recovery_contract_ref": "workspace-atomic-write", "permissions": {"write_paths": []} },
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

**说明**：

- `effect: "external"`：piko-tool-profile-v0.3 schema 已包含 `external` 选项（验证过）
- `replay: "never"`：Mem0 是有副作用（写）且不可幂等的 API
- `permissions.network_hosts`：限制 `mem0_lookup` / `mem0_record` 只能调 `api.mem0.ai`（自托管场景 base_url 会不同，配置驱动，policy 校验时按配置生成）

**自托管场景**：`network_hosts` 列表在启动时根据 `RuntimeConfig.identity.memory.base_url` 动态计算。V0.1 hard-code `api.mem0.ai`，V1.x 加动态注入。

**workspace-exec profile 同步加同样的两个工具**。

## 4. 校验逻辑保持

现有 policy 的校验逻辑（`validateToolRegistry`）会自动校验新工具：

- `knownTools` 包含新工具 ✓
- `effect` 是合法枚举 ✓（`external` 已支持）
- `replay` 是合法枚举 ✓
- `permissions` 字段合法（`network_hosts` 已支持）

无新校验规则。

## 5. 与现有模块的关系

| 模块 | 关系 |
|---|---|
| `piko-mem0-client` | 不直接依赖（policy 不调 HTTP） |
| `piko-skill-tools` | 不直接依赖 |
| `piko-pi-adapter`（更新）| 消费本模块产出的工具表 |

## 6. 受影响的 §X（原 design 章节）

合并回主 design 时：

| 主 design 章节 | 变更 |
|---|---|
| §X `knownTools` 定义 | 按 §2 扩展 |
| §Y `tool-profiles.json` 校验流程 | 按 §3 引用 |
| §Z recovery_contract 矩阵 | 不变（mem0_lookup / mem0_record 不需要 recovery contract，因为 `replay: never`） |

## 7. 风险

| 风险 | 缓解 |
|---|---|
| `network_hosts` 跟实际部署 URL 不匹配 | V0.1 hard-code `api.mem0.ai`；自托管用户在 issue 里报告，V1.x 改动态 |
| 忘改 `knownTools` Set | 启动校验会抛，立刻发现 |
| 工具 effect 选错（误用 `network`） | `external` 跟 `network` 在 schema 都是有效枚举，但语义不同——`external` 是访问外部服务，`network` 是任意网络。本设计明确用 `external` |

---

## 附录：实施清单

```bash
# 1. src/config.ts
# 在 knownTools Set 加 mem0_lookup, mem0_record

# 2. config/tool-profiles.json
# workspace-standard profile 加 mem0_lookup, mem0_record 条目
# workspace-exec profile 加 mem0_lookup, mem0_record 条目

# 3. 自托管用户（V1.x 才做）
# base_url 动态生成 network_hosts
```