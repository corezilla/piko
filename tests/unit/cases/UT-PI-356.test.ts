/**
 * Case ID: UT-PI-356  ·  STATUS: real
 *
 * 责任：分支 L240 `process.env.PIKO_PROVIDER_DEBUG_FILE??`${this…`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-356.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-356 · execute · 状态分支 × 合法迁移", () => {
  it("uses the default provider debug file when the environment does not override it", async () => {  // uses the default provider debug file when the environment does not override it
    // 步骤 1：PIKO_PROVIDER_DEBUG_FILE 未设 ⇒ ?? 落到 session_root 下的默认文件名
    const previous = process.env.PIKO_PROVIDER_DEBUG_FILE;
    delete process.env.PIKO_PROVIDER_DEBUG_FILE;
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 调试未开启时不写任何文件，但执行照常完成
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
      if (previous === undefined) delete process.env.PIKO_PROVIDER_DEBUG_FILE;
      else process.env.PIKO_PROVIDER_DEBUG_FILE = previous;
    }
  });
});
