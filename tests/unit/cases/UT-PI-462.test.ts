/**
 * Case ID: UT-PI-462  ·  STATUS: real
 *
 * 责任：返回站点 L301 值 `{status:"failed",summary:toolFailure,fa…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-462.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-462 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the failed tool result with the tool failure summary", async () => {  // returns the failed tool result with the tool failure summary
    // 步骤 1：路径越界 ⇒ 走 L301 的 toolFailure 返回站点
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    let n = 0;
    stubModelFetch(() => {
      n += 1;
      return n === 1
        ? sseResponse(toolCallSse("read", { path: "../escape.txt" }))
        : sseResponse(textResponseSse("fallback text"));
    });
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 返回值逐值对账
      expect(res).toEqual({
        status: "failed",
        summary: "path escapes workspace",
        failure: {
          code: "ToolFailure",
          cause_class: "Tool",
          message: "path escapes workspace",
        },
        executions: [],
      });
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
