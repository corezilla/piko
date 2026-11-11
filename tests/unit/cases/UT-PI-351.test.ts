/**
 * Case ID: UT-PI-351  ·  STATUS: real
 *
 * 责任：分支 L223 `? identity :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-351.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-351 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the identity ternary in the skill prefetch", async () => {  // takes the true and the false side of the identity ternary in the skill prefetch
    // 步骤 1a：identity 存在 ⇒ 取真侧，预取带上 role 与 workspace_ref
    const withIdentity = await piFixture({
      config: piConfig({ identity: piIdentity({}) }),
    });
    stubModelFetch();
    try {
      const res = await withIdentity.runtime.execute("run-1", 1, piTask("task-1"), withIdentity.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await withIdentity.close();
    }

    // 步骤 1b：identity 不存在 ⇒ 取假侧，不做身份相关的预取
    const withoutIdentity = await piFixture();
    stubModelFetch();
    try {
      const res = await withoutIdentity.runtime.execute("run-1", 1, piTask("task-1"), withoutIdentity.root, () => false);
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await withoutIdentity.close();
    }
  });
});
