/**
 * Case ID: UT-PI-457  ·  STATUS: real
 *
 * 责任：返回站点 L260 值 `{block:{reason:toolFailure,terminate:tr…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-457.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-457 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the block decision from the tool gate when the path authorization fails", async () => {  // returns the block decision from the tool gate when the path authorization fails
    // 步骤 1：路径越界 ⇒ before_tool 返回 block 决定
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
      // 步骤 3：断言 —— block 的 reason 逐值进入 ToolFailure 的消息
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ToolFailure");
      expect(res.failure?.message).toBe("path escapes workspace");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
