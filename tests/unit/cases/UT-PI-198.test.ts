/**
 * Case ID: UT-PI-198  ·  STATUS: real
 *
 * 责任：返回站点 L321 值 `null` 逐值断言（mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-198.md（脚本的唯一依据）
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

describe("UT-PI-198 · pollForExtractedMemory · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns null when the deadline expires without a hit", async () => {  // returns null when the deadline expires without a hit
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] }));
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：构造使返回站点被到达的输入——search 一直空手而归，直到 10 秒死线
      // 步骤 2：调用 pollForExtractedMemory
      const pending = adapter.pollForExtractedMemory("tester:piko", "q");
      const result = await drainPoll(pending);

      // 步骤 3：断言返回值逐值对账——严格是 null（不是 undefined、不是空串）
      expect(result).toBeNull();
      expect(result).toBe(null);

      // 步骤 3：断言轮询次数与耗时逐值对账——死线 10 秒，每 700ms 一轮
      expect(stub.searchCalls.length).toBe(15);
      expect(Date.now()).toBe(10500);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
