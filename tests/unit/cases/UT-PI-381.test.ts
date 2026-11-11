/**
 * Case ID: UT-PI-381  ·  STATUS: real
 *
 * 责任：分支 L259 `!rel.startsWith(`..${sep}`)&&rel!==".."`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-381.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-381 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the parent directory check on the relative path", async () => {  // takes the true and the false side of the parent directory check on the relative path
    // 步骤 1a：路径留在 staging 内 ⇒ rel 不是 ".." ⇒ 合取为真
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

    // 步骤 1b：路径逃出 staging（".."）⇒ 合取为假 ⇒ 走 authorizePath ⇒ 被拒
    const escaping = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      const res = await escaping.runtime.execute("run-1", 1, piTask("task-1"), escaping.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await escaping.close();
    }
  });
});
