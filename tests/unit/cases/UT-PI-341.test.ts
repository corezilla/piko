/**
 * Case ID: UT-PI-341  ·  STATUS: real
 *
 * 责任：分支 L189 `if (skillDeps)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-341.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-341 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the skill dependency check and registers the two memory tools", async () => {  // takes the true side of the skill dependency check and registers the two memory tools
    // 步骤 1：skillDeps 建出 ⇒ 工具清单里有 mem0_lookup 与 mem0_record
    const fx = await piFixture({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", memory: { provider: "mem0", api_key_secret_ref: "env:MEM0_API_KEY" } } }),
      mem0ApiKey: "mem0-key",
      registry: piTools({
        "workspace-standard": {
          mem0_lookup: { effect: "read_only", replay: "safe" },
          mem0_record: { effect: "read_only", replay: "safe" },
        } as never,
      }),
    });
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      const names = (body?.tools ?? []).map((t) => t.name);
      expect(names).toContain("mem0_lookup");
      expect(names).toContain("mem0_record");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
