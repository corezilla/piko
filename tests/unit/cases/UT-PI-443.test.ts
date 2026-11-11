/**
 * Case ID: UT-PI-443  ·  STATUS: real
 *
 * 责任：分支 L322 `? unavailable :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-443.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-443 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the unavailable ternary in the failure classification", async () => {  // takes the true and the false side of the unavailable ternary in the failure classification
    // 步骤 1a：502 ⇒ 取真侧 ⇒ ModelUnavailable / Dependency
    const unavailable = await piFixture();
    stubModelFetch(() => new Response("upstream (502) bad gateway", { status: 502 }));
    try {
      const res = await unavailable.runtime.execute("task-1", 1, piTask("task-1"), unavailable.root, () => false);
      expect(res.failure?.code).toBe("ModelUnavailable");
      expect(res.failure?.cause_class).toBe("Dependency");
    } finally {
      vi.unstubAllGlobals();
      await unavailable.close();
    }

    // 步骤 1b：400 ⇒ 取假侧 ⇒ ModelResponseInvalid / ModelProtocol
    const protocol = await piFixture();
    stubModelFetch(() => new Response("bad request payload", { status: 400 }));
    try {
      const res = await protocol.runtime.execute("task-1", 1, piTask("task-1"), protocol.root, () => false);
      expect(res.failure?.code).toBe("ModelResponseInvalid");
      expect(res.failure?.cause_class).toBe("ModelProtocol");
    } finally {
      vi.unstubAllGlobals();
      await protocol.close();
    }
  });
});
