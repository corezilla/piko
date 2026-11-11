/**
 * Case ID: UT-PI-155  ·  STATUS: real
 *
 * 责任：分支 L268 `if (eventId)`（if；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-155.md（脚本的唯一依据）
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

describe("UT-PI-155 · add · 状态分支 × 合法迁移", () => {
  it("polls only when an event_id came back", async () => {  // polls only when an event_id came back
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ status: "PENDING" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——event_id 非空字符串，if (eventId) 命中
      // 步骤 2：调用 add 并断言取真侧结果——块内动作是转 pollForExtractedMemory，
      // 其入参逐值可观测：query 是首条 message 内容的前 80 字符
      const polled = await adapter.add(validMessages("the fact body"), "tester:piko");
      expect(polled).toEqual({ ids: ["mem-1"] });
      expect(stub.searchCalls.length).toBe(1);
      const searchCall = stub.searchCalls[0]!;
      expect(searchCall.url).toBe(`${MEM0_BASE}${SEARCH_PATH}`);
      expect(searchCall.body.query).toBe("the fact body");
      expect(searchCall.body.filters).toEqual({ user_id: "tester:piko" });
      expect(searchCall.body.top_k).toBe(5);

      // 步骤 3：取假侧——响应里没有 event_id，if (eventId) 不命中
      // 步骤 4：再次调用 add 并断言取假侧结果——一次 search 都没有
      const notPolled = await adapter.add(validMessages("the fact body"), "tester:piko");
      expect(notPolled).toEqual({ ids: [] });
      expect(stub.searchCalls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
