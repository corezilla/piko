/**
 * Case ID: UT-PI-257  ·  STATUS: real
 *
 * 责任：返回站点 L166 值 `results.map((r) => { const meta = { ...…` 逐值断言（mem0-client.ts）
 * 维度坐标：`search` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-257.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-257 · search · 纯函数/无副作用 × 每等价类合法值", () => {
  it("maps the whole results array value by value in server order", async () => {  // maps the whole results array value by value in server order
    const rawResults = [
      { id: "m-001", memory: "deploy via the m5air script", score: 0.87, metadata: { type: "skill_experience", role: "tester" }, created_at: "2026-01-02T03:04:05Z" },
      { id: "m-002", memory: "check the contract version skew", score: 0.64, metadata: {}, categories: ["slinky"] },
      { id: "m-003" },
    ];
    const ff = scriptedFetch([{ status: 200, body: JSON.stringify({ results: rawResults }) }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：到达返回站点——2xx 且 results 非空
      const res = await adapter.search("q", "u");
      // 步骤 3：返回值逐值对账（结构 / 字段 / 顺序）
      expect(res).toHaveLength(3);
      expect(res).toEqual([
        { id: "m-001", memory: "deploy via the m5air script", score: 0.87, metadata: { type: "skill_experience", role: "tester" }, created_at: "2026-01-02T03:04:05Z" },
        { id: "m-002", memory: "check the contract version skew", score: 0.64, metadata: { tags: ["slinky"] }, created_at: "" },
        { id: "m-003", memory: "", score: 0, metadata: {}, created_at: "" },
      ]);
      // 服务端的降序原样保留（客户端不重排）
      expect([res[0]!.score, res[1]!.score, res[2]!.score]).toEqual([0.87, 0.64, 0]);
      // metadata 是拷贝出来的新对象，不是响应体原对象
      expect(res[0]!.metadata).not.toBe(rawResults[0]!.metadata);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
