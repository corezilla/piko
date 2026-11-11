/**
 * Case ID: UT-PI-458  ·  STATUS: real
 *
 * 责任：返回站点 L269 值 `{block:{reason:toolFailure,terminate:tr…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-458.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-458 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the block decision from the tool gate when the executable is not allowed", async () => {  // returns the block decision from the tool gate when the executable is not allowed
    // 步骤 1：命令不在允许列表 ⇒ before_tool 返回 block 决定
    const fx = await piFixture({
      registry: piTools({
        "workspace-standard": { bash: { effect: "read_only", replay: "safe", permissions: { executables: ["ls"] } } } as never,
      }),
    });
    let n = 0;
    stubModelFetch(() => {
      n += 1;
      return n === 1
        ? sseResponse(toolCallSse("bash", { command: "rm -rf /" }))
        : sseResponse(textResponseSse("fallback text"));
    });
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— block 的 reason 逐值进入 ToolFailure 的消息
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ToolFailure");
      expect(res.failure?.message).toBe("executable not allowed: rm (allowed: ls)");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
