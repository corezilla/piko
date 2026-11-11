/**
 * Case ID: UT-PI-197  ·  STATUS: real
 *
 * 责任：返回站点 L314 值 `sorted[0].id` 逐值断言（mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-197.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import {
  ADD_PATH,
  MEM0_BASE,
  MEM0_KEY,
  Mem0FetchStub,
  SEARCH_PATH,
  drainPoll,
  hit,
  json,
  reject,
  text,
  validMessages,
} from "./support/a2-mem0-fix.js";

describe("UT-PI-197 · pollForExtractedMemory · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the id of the most recently created hit", async () => {  // returns the id of the most recently created hit
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(
      SEARCH_PATH,
      json({
        results: [
          hit("mem-mid", "2026-03-03T00:00:00Z"),
          hit("mem-new", "2026-06-06T00:00:00Z"),
          hit("mem-old", "2026-01-01T00:00:00Z"),
        ],
      }),
    );
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：构造使返回站点被到达的输入——一轮就命中多条，created_at 各不相同
      // 步骤 2：调用 pollForExtractedMemory
      const result = await adapter.pollForExtractedMemory("tester:piko", "q");

      // 步骤 3：断言返回值逐值对账——排序按 created_at 倒序，取第一条的 id
      expect(typeof result).toBe("string");
      expect(result).toBe("mem-new");

      // 步骤 3：断言无未声明副作用——一轮命中即返回，不再多轮
      expect(stub.searchCalls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
