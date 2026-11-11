/**
 * Case ID: UT-PI-338  ·  STATUS: real
 *
 * 责任：分支 L177 `if (this.config.identity?.doc_search && this.…`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-338.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piTools, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-338 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the doc search dependency check", async () => {  // takes the true side of the doc search dependency check
    // 步骤 1：identity.doc_search 配了 + key 给了 ⇒ graphrag 工具进清单
    const fx = await piFixture({
      config: piConfig({ identity: piIdentity({ doc_search: { base_url: "https://graphrag.internal" } }) }),
      graphragApiKey: "graphrag-key",
      registry: piTools({
        "workspace-standard": {
          graphrag_search: { effect: "read_only", replay: "safe" },
        } as never,
      }),
    });
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完，工具清单含 graphrag_search
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).toContain("graphrag_search");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
