/**
 * Case ID: UT-PI-258  ·  STATUS: real
 *
 * 责任：返回站点 L171 值 `{ id: r.id ?? "", memory: r.memory ?? "…` 逐值断言（mem0-client.ts）
 * 维度坐标：`search` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-258.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, headersOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-258 · search · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns each mapped hit with the exact five-field shape", async () => {  // returns each mapped hit with the exact five-field shape
    const ff = scriptedFetch([
      { status: 200, body: JSON.stringify({ results: [{ id: "m-001", memory: "fact text", score: 0.87, metadata: { type: "skill_experience" }, created_at: "2026-01-02T03:04:05Z" }] }) },
    ]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：到达返回站点
      const res = await adapter.search("q", "u");
      // 步骤 3：映射对象逐值对账——字段、顺序（id/memory/score/metadata/created_at）
      expect(res[0]!).toEqual({ id: "m-001", memory: "fact text", score: 0.87, metadata: { type: "skill_experience" }, created_at: "2026-01-02T03:04:05Z" });
      expect(Object.keys(res[0]!)).toEqual(["id", "memory", "score", "metadata", "created_at"]);
      // 无未声明副作用：一次请求、v3 端点、Token 头、请求体缺省值
      expect(ff.calls).toHaveLength(1);
      expect(ff.calls[0]!.url).toBe("https://mem0.test/v3/memories/search/");
      expect(ff.calls[0]!.init?.method).toBe("POST");
      expect(headersOf(ff.calls[0]!).Authorization).toBe("Token key");
      expect(headersOf(ff.calls[0]!)["Content-Type"]).toBe("application/json");
      expect(bodyOf(ff.calls[0]!)).toEqual({ query: "q", filters: { user_id: "u" }, top_k: 5 });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
