/**
 * Case ID: UT-PI-233  ·  STATUS: real
 *
 * 责任：分支 L99 `options?.max_results ?? 5`（??；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-233.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, type Mem0SearchOptions } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-233 · search · 状态分支 × 合法迁移", () => {
  it("falls back to top_k 5 when max_results is nullish", async () => {  // falls back to top_k 5 when max_results is nullish
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：?? 左操作数取真（nullish）→ 走缺省 5
      await adapter.search("q", "u", { max_results: undefined, filters: {} });
      expect(bodyOf(ff.calls[0]!).top_k).toBe(5);
      await adapter.search("q", "u", { max_results: null, filters: {} } as unknown as Mem0SearchOptions);
      expect(bodyOf(ff.calls[1]!).top_k).toBe(5);

      // 步骤 3：?? 左操作数取假（非 nullish）→ 用调用方的值
      await adapter.search("q", "u", { max_results: 7, filters: {} });
      expect(bodyOf(ff.calls[2]!).top_k).toBe(7);
      expect(ff.calls.length).toBe(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
