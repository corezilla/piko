/**
 * Case ID: UT-PI-189  ·  STATUS: real
 *
 * 责任：分支 L307 `if (hits.length > 0)`（if；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-189.md（脚本的唯一依据）
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

describe("UT-PI-189 · pollForExtractedMemory · 状态分支 × 合法迁移", () => {
  it("skips the sort when a round finds nothing and polls again", async () => {  // skips the sort when a round finds nothing and polls again
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().on(
      SEARCH_PATH,
      json({ results: [hit("mem-1")] }),
    );
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——第一轮 hits.length = 1
      // 步骤 2：调用 pollForExtractedMemory 并断言取真侧结果
      const found = await adapter.pollForExtractedMemory("tester:piko", "q");
      expect(found).toBe("mem-1");
      expect(stub.searchCalls.length).toBe(1);
      expect(Date.now()).toBe(0);

      // 步骤 3：取假侧——hits.length = 0，块被跳过，睡 700ms 后再轮一轮
      // 步骤 4：再次调用并断言取假侧结果——轮询次数与耗时逐值对账
      const stub2 = new Mem0FetchStub().on(
        SEARCH_PATH,
        json({ results: [] }),
        json({ results: [hit("mem-2")] }),
      );
      vi.stubGlobal("fetch", stub2.fetch);
      const pending = adapter.pollForExtractedMemory("tester:piko", "q");
      const result = await drainPoll(pending);
      expect(result).toBe("mem-2");
      expect(stub2.searchCalls.length).toBe(2);
      expect(Date.now()).toBe(700);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
