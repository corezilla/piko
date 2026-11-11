/**
 * Case ID: UT-PI-154  ·  STATUS: real
 *
 * 责任：分支 L267 `data.event_id ?? ""`（??；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-154.md（脚本的唯一依据）
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

describe("UT-PI-154 · add · 状态分支 × 合法迁移", () => {
  it("uses event_id when present and substitutes an empty string when absent", async () => {  // uses event_id when present and substitutes an empty string when absent
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ status: "DONE" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧（?? 左侧非空）——响应带 event_id
      // 步骤 2：调用 add 并断言——eventId 非空，转轮询并返回抽出的 id
      const withEvent = await adapter.add(validMessages("the fact"), "tester:piko");
      expect(withEvent).toEqual({ ids: ["mem-1"] });
      expect(stub.searchCalls.length).toBe(1);

      // 步骤 3：取假侧（?? 右侧兜底 ""）——响应不带 event_id
      // 步骤 4：再次调用 add 并断言——eventId 为空串，不轮询，ids 为空
      const withoutEvent = await adapter.add(validMessages("the fact"), "tester:piko");
      expect(withoutEvent).toEqual({ ids: [] });
      expect(stub.searchCalls.length).toBe(1);
      expect(stub.addCalls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
