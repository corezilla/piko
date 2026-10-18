# 实验结论汇总（写回设计）

日期：2026-10-18
本汇总对应 V0.1 spec `docs/20_system_design/mechanisms/piko-skill-memory.md`

## 实验 04 完成：Pi tool 接口

**结论**：`AgentHarnessTool<TContext, TParameters, TDetails>` 形态可用。`mockLookupTool` 通过 `tsc --noEmit` 验证零错误。

**对 V0.1 spec 的影响**：

1. ✅ §4.2 `mem0_lookup` / `mem0_record` 工具签名可以按这个形态实现
2. ✅ §6.1 `user_id` 在 Piko 侧构造方案可行（toolContext 里，agent 不可控）
3. ✅ TypeBox schema 已经是 Piko 现有依赖，无新依赖
4. ⚠️ 工具的 `description` 字段对 agent 调用率影响很大，system prompt 也要强化提示

**更新点（spec §4.2 实施细节补完）**：

```typescript
import { Type, type Static } from "typebox";
import type { AgentHarnessTool } from "<piko>/upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "<piko>/upstream/pi/packages/agent/src/harness/tools/tool-context.ts";

const lookupSchema = Type.Object({
  query: Type.String({ description: "Natural language search query for past experience" }),
  max_results: Type.Optional(Type.Number({ default: 5 })),
});
type LookupParams = Static<typeof lookupSchema>;

export const mem0LookupTool: AgentHarnessTool<
  ExecutionToolContext,
  typeof lookupSchema,
  LookupDetails | undefined
> = {
  name: "mem0_lookup",
  label: "Mem0 lookup",
  description: "Search past skill experience for the current role in this project. Use this when you want to know what has been learned before — e.g., test pitfalls, code conventions, project-specific quirks. Returns up to 5 relevant experiences.",
  parameters: lookupSchema,
  async execute(toolCallId, params, onUpdate, toolContext, invocation, context) {
    // Piko 侧构造 user_id（agent 不可控）：
    const role = toolContext.env.identity?.role;  // 假设 toolContext 含 identity
    const projectName = ...;
    const userId = `${role}:${projectName}`;
    
    const results = await mem0Client.search(params.query, userId, params.max_results);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
      details: { count: results.length },
    };
  },
};
```

## 实验 01/02/03/06 阻塞：Mem0 沙箱限制

**结论**：本沙箱无法装 Mem0、无法访问 Mem0 API 文档。Mem0 集成侧的实验**全部推迟到 V0.1 真实环境**。

**对 V0.1 spec 的影响**：

1. **§6.1 user_id 构造方案仍然按计划**——但**必须**在 V0.1 day-1 验证：
   - tester:piko 写入的 memory，developer:piko 能不能 search 到
   - 如果不能，per-role 隔离成立，V0.1 继续
   - 如果能，**V0.1 立项否决**，因为核心假设失败
2. **§4.1 Mem0Adapter 接口签名基于公开文档**——实施时按实验 01 README 里的请求/响应 shape 写，**不要假设**任何字段一定保留/可用
3. **§10 风险表加一条**："per-role 隔离假设在沙箱未验证，V0.1 上线前必须验"

## 沙箱限制对整体计划的影响

| 工作 | 是否可在本沙箱做 | 备注 |
|---|---|---|
| 实验 04（Pi tool） | ✅ 已做 | 关键路径已验证 |
| 实验 01-03, 06（Mem0） | ❌ 不能 | 推迟到 V0.1 环境 |
| 实验 05（prompt） | ❌ 不能（成本高） | 推迟到 V0.1 后用 trace |
| V0 baseline 脚本 | ✅ 可做 | 用 Piko TaskStore 数据，不依赖 Mem0 |
| Module Design 撰写 | ✅ 可做 | 不依赖 Mem0 |
| ISD 撰写 | ✅ 可做 | 不依赖 Mem0 |
| Interface contract | ✅ 可做 | identity schema 改动，不依赖 Mem0 |
| validate-design | ✅ 可做 | 标准 STD 流程 |
| V0.1 实施 | ❌ 不能 | 需 Mem0 + 真实环境 |

## V0.1 spec 要更新的内容

基于本汇总：

1. §6 集成点：补充实验 04 的工具实现模板
2. §10 风险表：加 "per-role 隔离沙箱未验证，V0.1 day-1 必验" 一行
3. §13 下一步：明确 V0.1 day-1 验证清单（5 个 Mem0 不确定项）
4. 决策记录：加一行 2026-10-18 "实验 04 验证 Pi tool 形态可行；Mem0 实验沙箱阻塞推迟"

下一步：把这些更新写进 V0.1 spec。