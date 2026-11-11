/**
 * Case ID: UT-PI-236  ·  STATUS: real
 *
 * 责任：分支 L109 `options?.filters`（?.；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-236.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, type Mem0SearchOptions } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-236 · search · 状态分支 × 合法迁移", () => {
  it("short-circuits the options filters chain only when options is nullish", async () => {  // short-circuits the options filters chain only when options is nullish
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：?. 不短路——options 有效，filters 被读到并透传
      await adapter.search("q", "u", { max_results: 5, filters: { agent_id: "a1" } });
      expect(bodyOf(ff.calls[0]!).filters).toEqual({ user_id: "u", agent_id: "a1" });

      // options 有效但没有 filters 键 → options?.filters 得 undefined → ?? 兜到 {}
      await adapter.search("q", "u", { max_results: 5 });
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "u" });

      // 步骤 3：?. 短路——options 是 undefined / null
      await adapter.search("q", "u", undefined);
      expect(bodyOf(ff.calls[2]!).filters).toEqual({ user_id: "u" });
      await adapter.search("q", "u", null as unknown as Mem0SearchOptions);
      expect(bodyOf(ff.calls[3]!).filters).toEqual({ user_id: "u" });
      expect(ff.calls.length).toBe(4);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
