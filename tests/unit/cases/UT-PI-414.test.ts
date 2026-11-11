/**
 * Case ID: UT-PI-414  ·  STATUS: real
 *
 * 责任：分支 L287 `if (!operation)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-414.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-414 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the no operation branch", async () => {  // takes the true side of the no operation branch
    // 步骤 1：没有 queued turn ⇒ 直接走 !operation 分支
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：接受 initial operation 并跑完
      expect(res.status).toBe("completed");
      const reserve = fx.facts.find((f) => f.kind === "reserveModel");
      expect((reserve as { operation: string }).operation).toBe("task-1:initial");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
