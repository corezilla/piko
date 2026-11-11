/**
 * Case ID: UT-PI-318  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `+1 拒绝` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-318.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-318 · execute · 数值/长度上限参数 × +1 拒绝", () => {
  it("accepts the epoch value one above the baseline without rejecting it", async () => {  // accepts the epoch value one above the baseline without rejecting it
    // 步骤 1：epoch = 1（基线 +1）
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 当前实况：epoch 无上界校验（+1 不被拒绝）
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
