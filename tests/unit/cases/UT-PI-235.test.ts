/**
 * Case ID: UT-PI-235  ·  STATUS: real
 *
 * 责任：分支 L109 `options?.filters ?? {}`（??；mem0-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-235.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, type Mem0SearchOptions } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-235 · search · 状态分支 × 合法迁移", () => {
  it("falls back to an empty filter object when filters is nullish", async () => {  // falls back to an empty filter object when filters is nullish
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：?? 左操作数取真（nullish）→ 用空对象
      await adapter.search("q", "u", { max_results: 5, filters: undefined });
      expect(bodyOf(ff.calls[0]!).filters).toEqual({ user_id: "u" });
      await adapter.search("q", "u", { max_results: 5, filters: null } as unknown as Mem0SearchOptions);
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "u" });

      // 步骤 3：?? 左操作数取假——调用方给的 filters 生效
      await adapter.search("q", "u", { max_results: 5, filters: { agent_id: "a1" } });
      expect(bodyOf(ff.calls[2]!).filters).toEqual({ user_id: "u", agent_id: "a1" });
      expect(ff.calls.length).toBe(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
