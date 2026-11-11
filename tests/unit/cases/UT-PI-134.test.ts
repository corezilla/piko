/**
 * Case ID: UT-PI-134  ·  STATUS: real
 *
 * 责任：参数 `messages: Array<{ role: "user" | "assistant"; content: string }>` 的 `超长` 类（mem0-clien…
 * 维度坐标：`add` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-134.md（脚本的唯一依据）
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

describe("UT-PI-134 · add · 字符串/路径/枚举输入 × 超长", () => {
  it("transmits an oversized message verbatim and truncates only the poll query", async () => {  // transmits an oversized message verbatim and truncates only the poll query
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：messages 的超长类——源码无长度常量，取兜底上限 4096 的 2 倍 = 8192
      const long = "A".repeat(8192);
      const messages = validMessages(long);

      // 步骤 2：调用 add
      const res = await adapter.add(messages, "tester:piko");

      // 步骤 3：断言返回值，且请求体逐值对账——原样透传，不截断、不拒绝
      expect(res).toEqual({ ids: ["mem-1"] });
      const addCall = stub.addCalls[0]!;
      expect(addCall.body.messages).toEqual(messages);
      expect(addCall.body.messages[0]!.content.length).toBe(8192);

      // 步骤 3：断言 80 字符截断只作用于轮询用的 query，不作用于请求体
      const searchCall = stub.searchCalls[0]!;
      expect(searchCall.body.query).toBe(long.slice(0, 80));
      expect(searchCall.body.query.length).toBe(80);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
