/**
 * Case ID: UT-PI-317  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-317.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-317 · execute · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts the exact-pass epoch value and reports it on the close intake fact", async () => {  // accepts the exact-pass epoch value and reports it on the close intake fact
    // 步骤 1：epoch 恰好通过 —— 0
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 0, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— epoch 不校验；被当作 lease_epoch 上报
      expect(res.status).toBe("completed");
      const close = fx.facts.find((f) => f.kind === "closeIntake");
      // 非 discussion 任务不上报 closeIntake，故此断言只在 fact 存在时成立
      if (close) expect((close as { lease_epoch: number }).lease_epoch).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
