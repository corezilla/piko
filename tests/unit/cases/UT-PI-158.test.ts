/**
 * Case ID: UT-PI-158  ·  STATUS: real
 *
 * 责任：分支 L273 `memoryId ?? eventId`（??；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-158.md（脚本的唯一依据）
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

describe("UT-PI-158 · add · 状态分支 × 合法迁移", () => {
  it("returns the polled memory id and falls back to the event id on timeout", async () => {  // returns the polled memory id and falls back to the event id on timeout
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ event_id: "evt-2" }))
      .on(SEARCH_PATH, json({ results: [hit("mem-1")] }), json({ results: [] }));
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧（?? 左侧非空）——轮询在死线内抽到 memory id
      // 步骤 2：调用 add 并断言——ids[0] 是抽到的 memory id，不是 event id
      const found = await adapter.add(validMessages(), "tester:piko");
      expect(found).toEqual({ ids: ["mem-1"] });
      expect(found.ids[0]).not.toBe("evt-1");

      // 步骤 3：取假侧（?? 右侧兜底）——轮询一直空手而归，10 秒死线到期返回 null
      // 步骤 4：再次调用 add 并断言——ids[0] 回退成 event id
      const pending = adapter.add(validMessages(), "tester:piko");
      const result = await drainPoll(pending);
      expect(result).toEqual({ ids: ["evt-2"] });
      expect(stub.searchCalls.length).toBe(16);
      expect(Date.now()).toBe(10500);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
