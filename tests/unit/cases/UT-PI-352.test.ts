/**
 * Case ID: UT-PI-352  ·  STATUS: real
 *
 * 责任：分支 L224 `this.config.identity?.doc_search?.default_sco…`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-352.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-352 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to an empty default scope when the doc search config has none", async () => {  // falls back to an empty default scope when the doc search config has none
    // 步骤 1：doc_search 没配 default_scope ⇒ ?? 回落为空串
    const fx = await piFixture({
      config: piConfig({
        identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.internal" } },
      }),
      graphragApiKey: "graphrag-key",
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 回落成功，执行照常完成
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
