/**
 * Case ID: UT-PI-335  ·  STATUS: real
 *
 * 责任：分支 L164 `if (this.config.identity?.memory && this.mem0…`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-335.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piTools, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-335 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the memory dependency check when identity memory is configured", async () => {  // takes the true side of the memory dependency check when identity memory is configured
    // 步骤 1：identity.memory 配了 + key 给了 ⇒ mem0Adapter 存在 ⇒ skillDeps 被建
    const fx = await piFixture({
      config: piConfig({
        identity: piIdentity({ memory: {} }),
      }),
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
      // 步骤 3：断言 —— 取真侧跑完，模型请求带上了两个 mem0 工具
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).toContain("mem0_lookup");
      expect((body?.tools ?? []).map((t) => t.name)).toContain("mem0_record");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
