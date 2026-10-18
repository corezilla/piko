# 实验 04：Pi tool 接口验证

## 假设

Pi 上游的 `createReadTool` 等工具工厂返回的 `AgentHarnessTool<TContext, TParams, TDetails>` 对象，可以被 Piko 复用模式来创建自定义工具（如 `mem0_lookup` / `mem0_record`），挂到 `AgentHarness.create` 的 `tools` 参数里。

## 步骤

1. 读 Pi 上游 `upstream/pi/packages/agent/src/harness/tools/` 下的源码，确认 tool interface
2. 写一个 minimal custom tool `mock_lookup`（mock 返回，不调真实 Mem0），按 Pi tool 形态构造
3. 看 `AgentHarness.create` 的 `tools` 参数签名是否接受任意 `AgentHarnessTool`
4. 决定 Piko 侧 `src/skill-tools.ts` 的实现模板

## 验证方法

- 不实际调 AgentHarness（需要 LLM 调用，太重）
- 只做静态构造 + TypeScript 编译验证
- 如果有 Pi 的单元测试例子，照着写一个 minimal tool

## 不验证什么

- Tool 实际被 LLM 调用的效果（要 V0.1 跑起来才知道）
- Tool 的 streaming / update callback（V0.1 用不上）

## 结论

✅ **实验成功** — `mockLookupTool` 通过 `tsc --noEmit` 验证，零错误。

### 确认的接口契约

`AgentHarnessTool<TContext, TParameters, TDetails>` 形态：

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | `string` | 工具名（agent 用来 invoke），V0.1 用 `mem0_lookup` / `mem0_record` |
| `label` | `string` | 人类可读标签 |
| `description` | `string` | agent 看到的工具说明（**对调用率影响很大**，要写得清楚） |
| `parameters` | `TSchema` (TypeBox) | 参数 schema，用 `Type.Object(...)` 构造 |
| `execute` | `(toolCallId, params, onUpdate, toolContext, invocation, context) => Promise<{ content, details? }>` | 实际执行 |

### `src/skill-tools.ts` 实现模板

```typescript
import { Type } from "typebox";
import type { AgentHarnessTool } from "<piko>/upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "<piko>/upstream/pi/packages/agent/src/harness/tools/tool-context.ts";

const lookupSchema = Type.Object({
  query: Type.String({ description: "..." }),
  max_results: Type.Optional(Type.Number({ default: 5 })),
});

export const mem0LookupTool: AgentHarnessTool<
  ExecutionToolContext,
  typeof lookupSchema,
  MyDetails | undefined
> = {
  name: "mem0_lookup",
  label: "Mem0 lookup",
  description: "Search past skill experience for the current role in this project.",
  parameters: lookupSchema,
  async execute(toolCallId, params, onUpdate, toolContext, invocation, context) {
    // 1. Piko 侧构造 user_id = `${role}:${project}` — agent 不可控
    // 2. 调 mem0Client.search(...)
    // 3. 返回 { content: [{type:"text", text: JSON}], details }
  },
};
```

### 影响设计

- ✅ V0.1 spec §6 集成点里的 `src/skill-tools.ts` 路径不变
- ✅ user_id 在 Piko 侧构造的方案可行（agent 看不到 user_id，构造在 toolContext 里）
- ✅ TypeBox schema 已经是 Piko 的现有依赖，无新依赖
- ⚠️ `description` 字段要仔细写——agent 是否调用工具很大程度看这个。要在 system prompt 里也强化提示

### 后续

- 等实验 1（Mem0 API smoke）确认 Mem0 接口签名后，把 mock 部分替换成真实 mem0Client.search/add
- V0.1 spec §4.2 的工具定义可以基于本实验验证的形状补全