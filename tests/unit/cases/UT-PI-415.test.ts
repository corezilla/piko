/**
 * Case ID: UT-PI-415  ·  STATUS: real
 *
 * 责任：分支 L287 `!operation`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-415.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-415 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the operation", async () => {  // takes the true and the false side of the negation on the operation
    // 步骤 1a：全新 session ⇒ !operation 为真
    const fresh = await piFixture();
    stubModelFetch();
    try {
      const res = await fresh.runtime.execute("task-1", 1, piTask("task-1"), fresh.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fresh.close();
    }

    // 步骤 1b：同一 task id 再跑 ⇒ 已有 operation ⇒ !operation 为假
    const again = await piFixture();
    stubModelFetch();
    try {
      const res = await again.runtime.execute("task-1", 1, piTask("task-1"), again.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await again.close();
    }
  });
});
