/**
 * Case ID: UT-PI-336  ·  STATUS: real
 *
 * 责任：分支 L164 `this.config.identity?.memory && this.mem0Adap…`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-336.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-336 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the memory and adapter conjunction", async () => {  // takes the true side of the memory and adapter conjunction
    // 步骤 1a：identity.memory 真 且 adapter 真 ⇒ skillDeps 建出，两个 mem0 工具进清单
    const withMemory = await piFixture({
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
      const res = await withMemory.runtime.execute("run-1", 1, piTask("task-1"), withMemory.root, () => false);
      expect(res.status).toBe("completed");
      const body = stubA.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      const names = (body?.tools ?? []).map((t) => t.name);
      expect(names).toContain("mem0_lookup");
      expect(names).toContain("mem0_record");
    } finally {
      vi.unstubAllGlobals();
      await withMemory.close();
    }

    // 步骤 1b：identity 没有 memory ⇒ 合取为假 ⇒ 工具清单里没有 mem0_*
    const withoutMemory = await piFixture();
    const stubB = stubModelFetch();
    try {
      const res = await withoutMemory.runtime.execute("run-1", 1, piTask("task-1"), withoutMemory.root, () => false);
      expect(res.status).toBe("completed");
      const body = stubB.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      const names = (body?.tools ?? []).map((t) => t.name);
      expect(names).not.toContain("mem0_lookup");
      expect(names).not.toContain("mem0_record");
    } finally {
      vi.unstubAllGlobals();
      await withoutMemory.close();
    }
  });
});
