/**
 * Case ID: UT-PI-342  ·  STATUS: real
 *
 * 责任：分支 L193 `if (docSearchDeps)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-342.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-342 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the doc search dependency check and registers the search tool", async () => {  // takes the true side of the doc search dependency check and registers the search tool
    // 步骤 1：docSearchDeps 建出 ⇒ 工具清单里有 graphrag_search
    const fx = await piFixture({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.internal" } } }),
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
      // 步骤 3：断言
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).toContain("graphrag_search");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
