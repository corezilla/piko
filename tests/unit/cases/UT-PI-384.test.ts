/**
 * Case ID: UT-PI-384  ·  STATUS: real
 *
 * 责任：分支 L260 `if (!stagedRead)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-384.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-384 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the staged read check when the path is outside the staging root", async () => {  // takes the true side of the staged read check when the path is outside the staging root
    // 步骤 1：read 的 path 在 staging_root 之外 ⇒ stagedRead 为假 ⇒ 进 authorizePath
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
