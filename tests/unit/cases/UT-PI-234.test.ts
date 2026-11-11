/**
 * Case ID: UT-PI-234  ·  STATUS: real
 *
 * 责任：分支 L99 `options?.max_results`（?.；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-234.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, type Mem0SearchOptions } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-234 · search · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional options chain only when options is nullish", async () => {  // short-circuits the optional options chain only when options is nullish
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：?. 不短路——options 是有效对象，max_results 被读到
      await adapter.search("q", "u", { max_results: 3, filters: {} });
      expect(bodyOf(ff.calls[0]!).top_k).toBe(3);

      // 步骤 3：?. 短路——options 是 undefined / null，取 undefined 再由 ?? 兜到 5
      await adapter.search("q", "u", undefined);
      expect(bodyOf(ff.calls[1]!).top_k).toBe(5);
      await adapter.search("q", "u", null as unknown as Mem0SearchOptions);
      expect(bodyOf(ff.calls[2]!).top_k).toBe(5);
      expect(ff.calls.length).toBe(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
