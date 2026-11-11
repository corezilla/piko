/**
 * Case ID: UT-PI-246  ·  STATUS: real
 *
 * 责任：分支 L168 `if (r.categories && r.categories.length > 0)`（if；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-246.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-246 · search · 状态分支 × 合法迁移", () => {
  it("synthesizes metadata tags from non-empty categories only", async () => {  // synthesizes metadata tags from non-empty categories only
    const ff = scriptedFetch([
      { status: 200, body: JSON.stringify({ results: [{ id: "m1", categories: ["alpha", "beta"] }] }) },
      { status: 200, body: JSON.stringify({ results: [{ id: "m2", categories: [] }] }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——categories.length > 0（越界一侧＝1 条）
      const tagged = await adapter.search("q", "u");
      expect(tagged[0]!.metadata).toEqual({ tags: ["alpha", "beta"] });

      // 步骤 3：取假侧——categories 是空数组（不越界一侧＝0 条）→ 不合成 tags
      const bare = await adapter.search("q", "u");
      expect(bare[0]!.metadata).toEqual({});
      expect(Object.keys(bare[0]!.metadata)).not.toContain("tags");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
