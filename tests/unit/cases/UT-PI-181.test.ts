/**
 * Case ID: UT-PI-181  ·  STATUS: real
 *
 * 责任：参数 `user_id: string` 的 `空` 类（mem0-client.ts:299）
 * 维度坐标：`pollForExtractedMemory` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-181.md（脚本的唯一依据）
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

describe("UT-PI-181 · pollForExtractedMemory · 字符串/路径/枚举输入 × 空", () => {
  it("swallows the empty user_id rejection and times out with null", async () => {  // swallows the empty user_id rejection and times out with null
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.useFakeTimers();
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：user_id 的空类三态——空串 / undefined（缺省）/ null（显式空值）
      for (const user_id of ["", undefined, null] as any[]) {
        vi.setSystemTime(0);

        // 步骤 2：调用 pollForExtractedMemory
        const result = await drainPoll(adapter.pollForExtractedMemory(user_id, "q"));

        // 步骤 3：断言——实现自身没有校验：search 抛出的 user_id required 被同一个
        // catch 吞掉，轮询一直空转到 10 秒死线，落定值是 null（不是 typed 错误）
        expect(result).toBeNull();
      }

      // 步骤 3：断言无残留——search 的守卫先于 fetch，空 user_id 连一次 HTTP 都没发出
      expect(stub.calls.length).toBe(0);
      expect(Date.now()).toBe(10500);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
