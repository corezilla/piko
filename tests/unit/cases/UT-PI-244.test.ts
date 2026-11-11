/**
 * Case ID: UT-PI-244  ·  STATUS: real
 *
 * 责任：分支 L162 `data.results ?? []`（??；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-244.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-244 · search · 状态分支 × 合法迁移", () => {
  it("uses the results array when present and an empty array when absent", async () => {  // uses the results array when present and an empty array when absent
    const ff = scriptedFetch([
      { status: 200, body: JSON.stringify({ results: [{ id: "m1", memory: "fact", score: 0.5 }] }) },
      { status: 200, body: "{}" },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——data.results 非 nullish，数组被逐条映射
      const hits = await adapter.search("q", "u");
      expect(hits).toEqual([{ id: "m1", memory: "fact", score: 0.5, metadata: {}, created_at: "" }]);

      // 步骤 3：取假侧——data.results 缺省 → ?? 兜到 []，不抛
      const none = await adapter.search("q", "u");
      expect(none).toEqual([]);
      expect(none).toHaveLength(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
