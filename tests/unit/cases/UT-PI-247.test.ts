/**
 * Case ID: UT-PI-247  ·  STATUS: real
 *
 * 责任：分支 L168 `r.categories && r.categories.length > 0`（&&；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-247.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-247 · search · 状态分支 × 合法迁移", () => {
  it("requires a truthy categories array with positive length for tags", async () => {  // requires a truthy categories array with positive length for tags
    const ff = scriptedFetch([
      { status: 200, body: JSON.stringify({ results: [{ id: "m1", categories: ["alpha"] }, { id: "m2" }] }) },
      { status: 200, body: JSON.stringify({ results: [{ id: "m3", categories: [] }] }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——categories 真值且 length > 0
      const hits = await adapter.search("q", "u");
      expect(hits[0]!.metadata).toEqual({ tags: ["alpha"] });
      // 步骤 3：取假侧之一——categories 缺省（第一个操作数为假）
      expect(hits[1]!.metadata).toEqual({});

      // 取假侧之二——categories 是空数组（第一个操作数为真、第二个为假）
      const empty = await adapter.search("q", "u");
      expect(empty[0]!.metadata).toEqual({});
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
