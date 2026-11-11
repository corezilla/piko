/**
 * Case ID: UT-PI-364  ·  STATUS: real
 *
 * 责任：分支 L248 `? payloadSentAt :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-364.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-364 · execute · 状态分支 × 合法迁移", () => {
  it("records a latency for the provider call when the payload was sent", async () => {  // records a latency for the provider call when the payload was sent
    // 步骤 1：正常跑一轮 ⇒ payloadSentAt 被 before_payload 置上
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— latency_ms 有值（不是 null）
      expect(res.status).toBe("completed");
      const call = fx.facts.find((f) => f.kind === "providerCall");
      expect(call).toBeDefined();
      expect(typeof (call as { latency_ms: unknown }).latency_ms).toBe("number");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
