/**
 * Case ID: UT-PI-422  ·  STATUS: real
 *
 * 责任：分支 L294 `loop ()`（loop；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-422.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-422 · execute · 状态分支 × 合法迁移", () => {
  it("runs the drive loop to completion and returns a single terminal result", async () => {  // runs the drive loop to completion and returns a single terminal result
    // 步骤 1：正常跑一轮 ⇒ 循环在 outcome 完成后退出
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 循环只跑了一轮就收尾（一次 reserveModel + 一次 providerCall）
      expect(res.status).toBe("completed");
      expect(fx.facts.filter((f) => f.kind === "reserveModel")).toHaveLength(1);
      expect(fx.facts.filter((f) => f.kind === "providerCall")).toHaveLength(1);
      expect(stub.calls).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
