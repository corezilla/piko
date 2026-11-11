/**
 * Case ID: UT-PI-137  ·  STATUS: real
 *
 * 责任：参数 `user_id: string` 的 `超长` 类（mem0-client.ts:203）
 * 维度坐标：`add` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-137.md（脚本的唯一依据）
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

describe("UT-PI-137 · add · 字符串/路径/枚举输入 × 超长", () => {
  it("transmits an oversized user_id verbatim instead of rejecting it", async () => {  // transmits an oversized user_id verbatim instead of rejecting it
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：user_id 的超长类——源码无长度常量，取兜底上限 4096 的 2 倍 = 8192
      const long = "u".repeat(8192);

      // 步骤 2：调用 add
      const res = await adapter.add(validMessages(), long);

      // 步骤 3：断言——不被拒绝，请求体逐值对账
      expect(res).toEqual({ ids: ["mem-1"] });
      const addCall = stub.addCalls[0]!;
      expect(addCall.body.user_id).toBe(long);
      expect(addCall.body.user_id.length).toBe(8192);
      expect(stub.searchCalls[0]!.body.filters.user_id).toBe(long);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
