/**
 * Case ID: UT-PI-372  ·  STATUS: real
 *
 * 责任：分支 L255 `if (!policy)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-372.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-372 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the tool policy check for an enabled tool", async () => {  // takes the true side of the tool policy check for an enabled tool
    // 步骤 1：profile 声明了 read ⇒ policy 存在 ⇒ 不被 "tool … is not enabled" 拒绝
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完，没有 ToolFailure
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
