/**
 * Case ID: UT-PI-354  ·  STATUS: real
 *
 * 责任：分支 L224 `this.config.identity?.doc_search`（?.；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-354.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-354 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the optional chaining on the doc search config", async () => {  // takes the false side of the optional chaining on the doc search config
    // 步骤 1：identity 完全没有 doc_search ⇒ 可选链短路
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧跑完
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
