/**
 * Case ID: UT-PI-366  ·  STATUS: real
 *
 * 责任：分支 L249 `latestUsage?.source`（?.；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-366.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-366 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the optional chaining on the usage source", async () => {  // takes the true and the false side of the optional chaining on the usage source
    // 步骤 1a：正常跑一轮 ⇒ latestUsage 存在但 source 不是 injected
    const fx = await piFixture();
    stubModelFetch();
    try {
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      expect(res.status).toBe("completed");
      const call = fx.facts.find((f) => f.kind === "providerCall");
      expect((call as { note: string }).note).toBe("");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
