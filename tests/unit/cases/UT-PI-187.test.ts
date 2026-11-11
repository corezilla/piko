/**
 * Case ID: UT-PI-187  ·  STATUS: real
 *
 * 责任：分支 L304 `loop (Date.now() < deadline)`（loop；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-187.md（脚本的唯一依据）
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

describe("UT-PI-187 · pollForExtractedMemory · 时间域行为 × 超时边界 ±1 tick", () => {
  it("polls once more one millisecond before the deadline and stops on it", async () => {  // polls once more one millisecond before the deadline and stops on it
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    vi.useFakeTimers();
    try {
      // 步骤 1/2：死线前 1 毫秒——now = 9999 < deadline = 10000，守卫仍放行
      let now = 0;
      const clock = vi.spyOn(Date, "now").mockImplementation(() => now);
      const stubA = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] }));
      vi.stubGlobal("fetch", stubA.fetch);
      const pollA = adapter.pollForExtractedMemory("tester:piko", "q");
      const boxA = { settled: false, value: undefined as string | null | undefined };
      void pollA.then(
        (v) => {
          boxA.settled = true;
          boxA.value = v;
        },
        () => {
          boxA.settled = true;
        },
      );
      now = 9999;
      await vi.advanceTimersByTimeAsync(700);
      // 步骤 3：取真侧被观测到——死线前 1 毫秒仍然又轮了一轮
      expect(stubA.searchCalls.length).toBe(2);
      now = 10000;
      await vi.advanceTimersByTimeAsync(700);
      expect(boxA.settled).toBe(true);
      expect(boxA.value).toBeNull();
      expect(stubA.searchCalls.length).toBe(2);
      clock.mockRestore();
      vi.unstubAllGlobals();

      // 步骤 3/4：恰好死线——now = 10000 不小于 deadline = 10000，守卫立刻收口
      let nowB = 0;
      const clockB = vi.spyOn(Date, "now").mockImplementation(() => nowB);
      const stubB = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] }));
      vi.stubGlobal("fetch", stubB.fetch);
      const pollB = adapter.pollForExtractedMemory("tester:piko", "q");
      const boxB = { settled: false, value: undefined as string | null | undefined };
      void pollB.then(
        (v) => {
          boxB.settled = true;
          boxB.value = v;
        },
        () => {
          boxB.settled = true;
        },
      );
      nowB = 10000;
      await vi.advanceTimersByTimeAsync(700);
      expect(boxB.settled).toBe(true);
      expect(boxB.value).toBeNull();
      expect(stubB.searchCalls.length).toBe(1);
      clockB.mockRestore();
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
