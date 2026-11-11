/**
 * Case ID: UT-PI-237  ·  STATUS: real
 *
 * 责任：分支 L111 `if (translatedFilters["metadata.tags"] !== un…`（if；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-237.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-237 · search · 状态分支 × 合法迁移", () => {
  it("translates a metadata.tags filter into a categories contains filter", async () => {  // translates a metadata.tags filter into a categories contains filter
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——filters 带 metadata.tags
      await adapter.search("q", "u", { filters: { "metadata.tags": "alpha" } });
      // 步骤 3：filters.metadata.tags 被翻译成 categories.contains，原键被删掉
      expect(bodyOf(ff.calls[0]!).filters).toEqual({ user_id: "u", categories: { contains: "alpha" } });
      expect(Object.keys(bodyOf(ff.calls[0]!).filters as Record<string, unknown>)).not.toContain("metadata.tags");

      // 步骤 4：取假侧——filters 不带 metadata.tags → 不产生 categories
      await adapter.search("q", "u", { filters: { agent_id: "a1" } });
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "u", agent_id: "a1" });
      expect(Object.keys(bodyOf(ff.calls[1]!).filters as Record<string, unknown>)).not.toContain("categories");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
