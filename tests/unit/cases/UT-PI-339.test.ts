/**
 * Case ID: UT-PI-339  ·  STATUS: real
 *
 * 责任：分支 L177 `this.config.identity?.doc_search && this.grap…`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-339.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-339 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the doc search and adapter conjunction", async () => {  // takes the true side of the doc search and adapter conjunction
    // 步骤 1a：doc_search 真 且 adapter 真 ⇒ graphrag_search 进清单
    const withDoc = await piFixture({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.internal" } } }),
      graphragApiKey: "graphrag-key",
      registry: piTools({
        "workspace-standard": {
          graphrag_search: { effect: "read_only", replay: "safe" },
        } as never,
      }),
    });
    const stubA = stubModelFetch();
    try {
      await withDoc.runtime.execute("run-1", 1, piTask("task-1"), withDoc.root, () => false);
      const body = stubA.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).toContain("graphrag_search");
    } finally {
      vi.unstubAllGlobals();
      await withDoc.close();
    }

    // 步骤 1b：doc_search 假 ⇒ 合取为假
    const withoutDoc = await piFixture();
    const stubB = stubModelFetch();
    try {
      await withoutDoc.runtime.execute("run-1", 1, piTask("task-1"), withoutDoc.root, () => false);
      const body = stubB.calls[0]?.body as { tools?: { name?: string }[] } | undefined;
      expect((body?.tools ?? []).map((t) => t.name)).not.toContain("graphrag_search");
    } finally {
      vi.unstubAllGlobals();
      await withoutDoc.close();
    }
  });
});
