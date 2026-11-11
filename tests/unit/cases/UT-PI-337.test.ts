/**
 * Case ID: UT-PI-337  ·  STATUS: real
 *
 * 责任：分支 L164 `this.config.identity?.memory`（?.；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-337.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-337 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true and the false side of the optional chaining on identity for the skill tools", async () => {  // takes the true and the false side of the optional chaining on identity for the skill tools
    // 步骤 1a：identity 存在 ⇒ 可选链取真，mem0 工具进清单
    const withIdentity = await piFixture({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: "mem0-key",
      registry: piTools({
        "workspace-standard": {
          mem0_lookup: { effect: "read_only", replay: "safe" },
          mem0_record: { effect: "read_only", replay: "safe" },
        } as never,
      }),
    });
    const stubA = stubModelFetch();
    try {
      await withIdentity.runtime.execute("run-1", 1, piTask("task-1"), withIdentity.root, () => false);
      const body = stubA.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).toContain("mem0_lookup");
    } finally {
      vi.unstubAllGlobals();
      await withIdentity.close();
    }

    // 步骤 1b：identity 不存在 ⇒ 可选链短路，无 mem0 工具
    const withoutIdentity = await piFixture();
    const stubB = stubModelFetch();
    try {
      await withoutIdentity.runtime.execute("run-1", 1, piTask("task-1"), withoutIdentity.root, () => false);
      const body = stubB.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).not.toContain("mem0_lookup");
    } finally {
      vi.unstubAllGlobals();
      await withoutIdentity.close();
    }
  });
});
