/**
 * Case ID: UT-PI-350  ·  STATUS: real
 *
 * 责任：分支 L214 `? this.config.identity :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-350.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-350 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the identity ternary in the prompt construction", async () => {  // takes the true and the false side of the identity ternary in the prompt construction
    // 步骤 1a：identity 存在 ⇒ 取真侧，系统提示带上身份块
    const withIdentity = await piFixture({
      config: piConfig({ identity: { role: "developer", name: "alice:developer" } }),
    });
    const stubA = stubModelFetch();
    try {
      await withIdentity.runtime.execute("run-1", 1, piTask("task-1"), withIdentity.root, () => false);
      const body = stubA.calls[0]?.body as { input?: { content?: unknown }[] } | undefined;
      const prompt = JSON.stringify(body?.input ?? []);
      expect(prompt).toContain("developer");
      expect(prompt).toContain("alice:developer");
    } finally {
      vi.unstubAllGlobals();
      await withIdentity.close();
    }

    // 步骤 1b：identity 不存在 ⇒ 取假侧，只有基础提示
    const withoutIdentity = await piFixture();
    const stubB = stubModelFetch();
    try {
      await withoutIdentity.runtime.execute("run-1", 1, piTask("task-1"), withoutIdentity.root, () => false);
      const body = stubB.calls[0]?.body as { input?: { content?: unknown }[] } | undefined;
      const prompt = JSON.stringify(body?.input ?? []);
      expect(prompt).toContain("You are Piko, executing one durable task.");
      expect(prompt).not.toContain("alice:developer");
    } finally {
      vi.unstubAllGlobals();
      await withoutIdentity.close();
    }
  });
});
