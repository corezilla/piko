/**
 * Case ID: UT-PI-323  ·  STATUS: real
 *
 * 责任：参数 `workspace: string` 的 `空` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-323.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-323 · execute · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty workspace path and completes the operation", async () => {  // accepts an empty workspace path and completes the operation
    // 步骤 1：空串 workspace
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), "", () => false);
      // 步骤 3：断言 —— 当前实况：workspace 不做非空校验
      expect(res.status).toBe("completed");
      expect(res.summary).toBe("done");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
