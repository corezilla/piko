/**
 * Case ID: UT-PI-314  ·  STATUS: real
 *
 * 责任：参数 `runId: string` 的 `空` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-314.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-314 · execute · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty run id and still completes the operation", async () => {  // accepts an empty run id and still completes the operation
    // 步骤 1：空串 runId
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 当前实况：runId 不做校验，空串也能跑完
      expect(res.status).toBe("completed");
      expect(res.summary).toBe("done");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
