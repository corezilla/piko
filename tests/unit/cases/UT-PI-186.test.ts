/**
 * Case ID: UT-PI-186  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `注入字符` 类（mem0-client.ts:299）
 * 维度坐标：`pollForExtractedMemory` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-186.md（脚本的唯一依据）
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

describe("UT-PI-186 · pollForExtractedMemory · 字符串/路径/枚举输入 × 注入字符", () => {
  it("sends injection payloads in query verbatim without rejecting them", async () => {  // sends injection payloads in query verbatim without rejecting them
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] }));
    vi.useFakeTimers();
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：query 的注入字符类——路径穿越、SQL/命令元字符、超长＋注入组合
      const payloads = [
        "../../etc/passwd",
        "'; DROP TABLE memories; --",
        "q".repeat(4096) + "$(rm -rf /)",
      ];
      for (const query of payloads) {
        vi.setSystemTime(0);
        const before = stub.searchCalls.length;

        // 步骤 2：调用 pollForExtractedMemory
        const result = await drainPoll(adapter.pollForExtractedMemory("tester:piko", query));

        // 步骤 3：断言——不被拒绝，注入串逐字节原样进入请求体的 query
        expect(result).toBeNull();
        const calls = stub.searchCalls.slice(before);
        expect(calls.length).toBe(15);
        for (const call of calls) {
          expect(call.body.query).toBe(query);
        }
      }
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
