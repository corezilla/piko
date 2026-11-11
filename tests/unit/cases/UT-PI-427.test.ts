/**
 * Case ID: UT-PI-427  ·  STATUS: real
 *
 * 责任：分支 L297 `if (activeTurn)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-427.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-427 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the active turn check for a task with no discussion turn", async () => {  // takes the false side of the active turn check for a task with no discussion turn
    // 步骤 1：非 discussion 任务 ⇒ 没有 active turn
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧：不触发 discussion 回复回调
      expect(res.status).toBe("completed");
      expect(fx.facts.some((f) => f.kind === "turn")).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
