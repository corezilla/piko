/**
 * Case ID: UT-PI-447  ·  STATUS: real
 *
 * 责任：throw L296 `reject`（守卫 `if (!driven.ok)`；pi-runtime.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-447.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-447 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("propagates the rejection of a failed drive", async () => {  // propagates the rejection of a failed drive
    // 步骤 1：正常驱动 ⇒ driven.ok 为真 ⇒ 不抛错
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 驱动成功，没有错误上抛
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
