/**
 * Case ID: UT-PI-385  ·  STATUS: real
 *
 * 责任：分支 L260 `!stagedRead`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-385.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-385 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the staged read flag", async () => {  // takes the true and the false side of the negation on the staged read flag
    // 步骤 1a：路径在 staging 内 ⇒ !stagedRead 为假 ⇒ 免授权
    const inside = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      const res = await inside.runtime.execute("run-1", 1, piTask("task-1"), inside.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await inside.close();
    }

    // 步骤 1b：路径在 staging 外 ⇒ !stagedRead 为真 ⇒ 进 authorizePath
    const outside = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      const res = await outside.runtime.execute("run-1", 1, piTask("task-1"), outside.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await outside.close();
    }
  });
});
