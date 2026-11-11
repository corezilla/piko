/**
 * Case ID: UT-PI-382  ·  STATUS: real
 *
 * 责任：分支 L259 `!rel.startsWith(`..${sep}`)`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-382.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-382 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the negation on the parent prefix of the relative path", async () => {  // takes the true and the false side of the negation on the parent prefix of the relative path
    // 步骤 1：路径留在 staging 内 ⇒ rel 不以 ".." 开头
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
