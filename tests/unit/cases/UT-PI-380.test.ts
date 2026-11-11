/**
 * Case ID: UT-PI-380  ·  STATUS: real
 *
 * 责任：分支 L259 `!rel.startsWith(`..${sep}`)&&rel!==".."&&!rel…`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-380.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-380 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the conjunction that keeps a relative path inside the staging root", async () => {  // takes the true side of the conjunction that keeps a relative path inside the staging root
    // 步骤 1：read 的 path 落在 staging_root 内 ⇒ rel 不以 ".." 开头 ⇒ 合取为真
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 执行跑完（路径在 staging 内 ⇒ 免授权）
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
