/**
 * Case ID: UT-PI-245  ·  STATUS: real
 *
 * 责任：分支 L167 `r.metadata ?? {}`（??；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-245.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-245 · search · 状态分支 × 合法迁移", () => {
  it("keeps a result metadata object and defaults to an empty one", async () => {  // keeps a result metadata object and defaults to an empty one
    const ff = scriptedFetch([
      { status: 200, body: JSON.stringify({ results: [{ id: "m1", metadata: { type: "skill_experience", role: "tester" } }] }) },
      { status: 200, body: JSON.stringify({ results: [{ id: "m2" }] }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——r.metadata 存在，被拷进结果
      const withMeta = await adapter.search("q", "u");
      expect(withMeta[0]!.metadata).toEqual({ type: "skill_experience", role: "tester" });

      // 步骤 3：取假侧——r.metadata 缺省 → ?? 兜到 {}
      const bare = await adapter.search("q", "u");
      expect(bare[0]!.metadata).toEqual({});
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
