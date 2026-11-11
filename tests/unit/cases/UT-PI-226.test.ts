/**
 * Case ID: UT-PI-226  ·  STATUS: real
 *
 * 责任：参数 `options: Mem0SearchOptions` 的 `每等价类合法值` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-226.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-226 · search · 纯函数/无副作用 × 每等价类合法值", () => {
  it("maps every legal options equivalent class onto the v3 request body", async () => {  // maps every legal options equivalent class onto the v3 request body
    const ff = scriptedFetch([{ status: 200, body: "{}" }, { status: 200, body: "{}" }, { status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：options 的等价类——max_results 与 filters 同时给
      await adapter.search("q", "u", { max_results: 10, filters: { "metadata.type": "skill_experience" } });
      // 步骤 3：请求体逐值对账——metadata.type 被折进 filters.metadata
      expect(bodyOf(ff.calls[0]!)).toEqual({
        query: "q",
        filters: { user_id: "u", metadata: { type: "skill_experience" } },
        top_k: 10,
      });

      // 等价类——只给 max_results
      await adapter.search("q", "u", { max_results: 3 });
      expect(bodyOf(ff.calls[1]!)).toEqual({ query: "q", filters: { user_id: "u" }, top_k: 3 });

      // 等价类——只给 filters（普通 key 原样透传）
      await adapter.search("q", "u", { filters: { agent_id: "a1" } });
      expect(bodyOf(ff.calls[2]!)).toEqual({ query: "q", filters: { user_id: "u", agent_id: "a1" }, top_k: 5 });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
