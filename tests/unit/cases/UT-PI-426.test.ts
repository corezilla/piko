/**
 * Case ID: UT-PI-426  ·  STATUS: real
 *
 * 责任：分支 L296 `if (driven.value.kind==="waiting")`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-426.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-426 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the waiting check when the drive returns an outcome", async () => {  // takes the false side of the waiting check when the drive returns an outcome
    // 步骤 1：驱动直接返回 outcome（不是 waiting）⇒ if 取假
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧：一次驱动就拿到终态，没有重入
      expect(res.status).toBe("completed");
      expect(stub.calls).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
