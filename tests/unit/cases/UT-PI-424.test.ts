/**
 * Case ID: UT-PI-424  ·  STATUS: real
 *
 * 责任：分支 L296 `!outcome`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-424.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-424 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the outcome", async () => {  // takes the true and the false side of the negation on the outcome
    // 步骤 1a：全新 operation ⇒ !outcome 为真 ⇒ 走 drive
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      const first = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      expect(first.status).toBe("completed");
      expect(stub.calls.length).toBeGreaterThan(0);
      const callsAfterFirst = stub.calls.length;

      // 步骤 1b：同一 session 再跑 ⇒ outcome 已存在 ⇒ !outcome 为假（复用，不再驱动）
      const second = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      expect(second.status).toBe("completed");
      // 步骤 3：断言 —— 取假侧：没有第二次模型请求
      expect(stub.calls.length).toBe(callsAfterFirst);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
