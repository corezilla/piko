/**
 * Case ID: UT-PI-194  ·  STATUS: real
 *
 * 责任：分支 L316 `catch ()`（catch；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-194.md（脚本的唯一依据）
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

describe("UT-PI-194 · pollForExtractedMemory · 错误路径 × 每个 typed 错误码", () => {
  it("swallows a failing search round and keeps polling", async () => {  // swallows a failing search round and keeps polling
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const failing = new Mem0FetchStub().fallbackFor(
      SEARCH_PATH,
      json({ message: "upstream down" }, 500, "Internal Server Error"),
    );
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubGlobal("fetch", failing.fetch);
    try {
      // 步骤 1：取真侧——search 抛 Mem0ApiError，catch 命中
      // 步骤 2：调用 pollForExtractedMemory 并断言取真侧结果——错误被吞，不上抛
      const pending = adapter.pollForExtractedMemory("tester:piko", "q");
      const result = await drainPoll(pending);
      expect(result).toBeNull();
      expect(failing.searchCalls.length).toBe(15);
      expect(Date.now()).toBe(10500);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }

    // 步骤 3：取假侧——search 正常返回，catch 块被跳过
    // 步骤 4：再次调用并断言取假侧结果
    const working = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", working.fetch);
    try {
      const ok = await adapter.pollForExtractedMemory("tester:piko", "q");
      expect(ok).toBe("mem-1");
      expect(working.searchCalls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
