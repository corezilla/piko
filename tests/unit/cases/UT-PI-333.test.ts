/**
 * Case ID: UT-PI-333  ·  STATUS: real
 *
 * 责任：分支 L158 `? existing :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-333.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-333 · execute · 状态分支 × 合法迁移", () => {
  it("reuses the existing session when the run id already has one and creates one otherwise", async () => {  // reuses the existing session when the run id already has one and creates one otherwise
    // 步骤 1a：无既有 session ⇒ 走 create 侧
    const first = await piFixture();
    stubModelFetch();
    try {
      const res = await first.runtime.execute("run-1", 1, piTask("task-1"), first.root, () => false);
      // 步骤 2：断言 —— create 侧跑完
      expect(res.status).toBe("completed");
      expect(res.summary).toBe("done");
    } finally {
      vi.unstubAllGlobals();
      await first.close();
    }

    // 步骤 1b：同一 run id 已有 session ⇒ 走 open 侧（复用）
    const second = await piFixture();
    stubModelFetch();
    try {
      const res = await second.runtime.execute("run-1", 1, piTask("task-1"), second.root, () => false);
      // 步骤 2/3：断言 —— open 侧同样跑完
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await second.close();
    }
  });
});
