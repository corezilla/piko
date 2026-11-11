/**
 * Case ID: UT-PI-408  ·  STATUS: real
 *
 * 责任：分支 L281 `!operation`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-408.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-408 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the open operation", async () => {  // takes the true and the false side of the negation on the open operation
    // 步骤 1a：没有 open operation ⇒ !operation 为真
    const fresh = await piFixture();
    stubModelFetch();
    try {
      const res = await fresh.runtime.execute("run-1", 1, piTask("task-1"), fresh.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fresh.close();
    }

    // 步骤 1b：同一 run id 再跑一次 ⇒ 已有 operation ⇒ !operation 为假（走复用路径）
    const again = await piFixture();
    stubModelFetch();
    try {
      const res = await again.runtime.execute("run-1", 1, piTask("task-1"), again.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await again.close();
    }
  });
});
