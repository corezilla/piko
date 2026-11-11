/**
 * Case ID: UT-PI-182  ·  STATUS: real
 *
 * 责任：参数 `user_id: string` 的 `超长` 类（mem0-client.ts:299）
 * 维度坐标：`pollForExtractedMemory` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-182.md（脚本的唯一依据）
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

describe("UT-PI-182 · pollForExtractedMemory · 字符串/路径/枚举输入 × 超长", () => {
  it("sends an oversized user_id verbatim and times out with null", async () => {  // sends an oversized user_id verbatim and times out with null
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] }));
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：user_id 的超长类——源码无长度常量，取兜底上限 4096 的 2 倍 = 8192
      const long = "u".repeat(8192);

      // 步骤 2：调用 pollForExtractedMemory
      const result = await drainPoll(adapter.pollForExtractedMemory(long, "q"));

      // 步骤 3：断言——不被拒绝，超长 user_id 逐字节出现在每次请求体的 filters 里
      expect(result).toBeNull();
      expect(stub.searchCalls.length).toBe(15);
      for (const call of stub.searchCalls) {
        expect(call.body.filters.user_id).toBe(long);
        expect(call.body.filters.user_id.length).toBe(8192);
      }
      expect(Date.now()).toBe(10500);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
