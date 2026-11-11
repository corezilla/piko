/**
 * Case ID: UT-PI-192  ·  STATUS: real
 *
 * 责任：分支 L314 `if (sorted[0]?.id)`（if；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-192.md（脚本的唯一依据）
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

describe("UT-PI-192 · pollForExtractedMemory · 状态分支 × 合法迁移", () => {
  it("skips a hit without an id and keeps polling until one carries an id", async () => {  // skips a hit without an id and keeps polling until one carries an id
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().on(
      SEARCH_PATH,
      json({ results: [{ memory: "no id", score: 1, metadata: {}, created_at: "2026-01-01T00:00:00Z" }] }),
      json({ results: [hit("mem-2", "2026-02-02T00:00:00Z")] }),
    );
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——命中带非空 id
      // 步骤 2：调用 pollForExtractedMemory 并断言取真侧结果
      const pending = adapter.pollForExtractedMemory("tester:piko", "q");
      const result = await drainPoll(pending);

      // 步骤 3：断言——第一轮的命中 id 为空串，if (sorted[0]?.id) 不成立，
      // 被跳过；第二轮命中才被返回。轮询次数与耗时逐值对账
      expect(result).toBe("mem-2");
      expect(stub.searchCalls.length).toBe(2);
      expect(Date.now()).toBe(700);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
