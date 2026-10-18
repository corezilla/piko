// 实验 04：minimal custom tool，证明 Piko 可以按 Pi 的形态创建自定义工具
// 这不是正式代码 — 只为验证接口形状能 type-check

import { Type, type Static } from "typebox";
import type { AgentHarnessTool } from "../../../upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "../../../upstream/pi/packages/agent/src/harness/tools/tool-context.ts";

// 1. 用 TypeBox 定义 schema（Pi 工具的参数 schema 标准做法）
const mockLookupSchema = Type.Object({
  query: Type.String({ description: "Search query" }),
  max_results: Type.Optional(Type.Number({ default: 5 })),
});

type MockLookupParams = Static<typeof mockLookupSchema>;

// 2. 构造 AgentHarnessTool 形态的对象
//    关键字段：name / label / description / parameters / execute
//    execute 返回 { content: TextContent[], details? }

interface MockLookupDetails {
  ids: string[];
  count: number;
}

export const mockLookupTool: AgentHarnessTool<
  ExecutionToolContext,
  typeof mockLookupSchema,
  MockLookupDetails | undefined
> = {
  name: "mem0_lookup",
  label: "Mem0 lookup",
  description:
    "Search past skill experience for the current role in the current project. " +
    "Use this when you want to know what has been learned before " +
    "(e.g., test pitfalls, code conventions, project-specific quirks).",
  parameters: mockLookupSchema,
  async execute(
    _toolCallId,
    params,
    _onUpdate,
    _toolContext,
    _invocation,
    _context,
  ) {
    // Mock：不调 Mem0，返回固定结果
    const result: MockLookupDetails = {
      ids: ["mem-1", "mem-2"],
      count: 2,
    };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
      details: result,
    };
  },
};

// 编译通过 = 实验成功
// 运行：`tsc --noEmit mock-tool.ts` 从 Piko 根目录（用 Piko 的 tsconfig）