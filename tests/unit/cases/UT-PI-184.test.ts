/**
 * Case ID: UT-PI-184  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `空` 类（mem0-client.ts:299）
 * 维度坐标：`pollForExtractedMemory` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-184.md（脚本的唯一依据）
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

describe("UT-PI-184 · pollForExtractedMemory · 字符串/路径/枚举输入 × 空", () => {
  it("replaces every empty query with a single space", async () => {  // replaces every empty query with a single space
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] }));
    vi.useFakeTimers();
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：query 的空类三态——空串 / undefined（缺省）/ null（显式空值）
      for (const query of ["", undefined, null] as any[]) {
        vi.setSystemTime(0);
        const before = stub.searchCalls.length;

        // 步骤 2：调用 pollForExtractedMemory
        const result = await drainPoll(adapter.pollForExtractedMemory("tester:piko", query));

        // 步骤 3：断言——query || " " 把三种空态都换成单空格，请求体逐值对账
        expect(result).toBeNull();
        const calls = stub.searchCalls.slice(before);
        expect(calls.length).toBe(15);
        for (const call of calls) {
          expect(call.body.query).toBe(" ");
          expect(call.body.filters.user_id).toBe("tester:piko");
          expect(call.body.top_k).toBe(5);
        }
      }
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
