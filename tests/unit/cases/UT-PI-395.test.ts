/**
 * Case ID: UT-PI-395  ·  STATUS: real
 *
 * 责任：分支 L269 `? error instanceof Error :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-395.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-395 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the error instance check when the executable assertion throws", async () => {  // takes the true side of the error instance check when the executable assertion throws
    // 步骤 1：可执行文件校验抛的是 Error 实例
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
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：错误消息原样被取用
      expect(res.status).toBe("failed");
      expect(res.failure?.message).toMatch(/executable not allowed/);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
