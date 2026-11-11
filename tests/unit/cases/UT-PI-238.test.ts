/**
 * Case ID: UT-PI-238  ·  STATUS: real
 *
 * 责任：分支 L116 `loop (Object.entries(translatedFilters))`（loop；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-238.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-238 · search · 状态分支 × 合法迁移", () => {
  it("rewrites flat metadata filters inside the translation loop only when one matches", async () => {  // rewrites flat metadata filters inside the translation loop only when one matches
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：取真侧——循环命中一个 metadata. 前缀的键
      await adapter.search("q", "u", { filters: { "metadata.type": "skill_experience" } });
      expect(bodyOf(ff.calls[0]!).filters).toEqual({ user_id: "u", metadata: { type: "skill_experience" } });

      // 步骤 3：取假侧——循环里没有任何 metadata. 前缀的键，filters 原样透传
      await adapter.search("q", "u", { filters: { agent_id: "a1", user_id: "other" } });
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "other", agent_id: "a1" });
      expect(Object.keys(bodyOf(ff.calls[1]!).filters as Record<string, unknown>)).not.toContain("metadata");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
