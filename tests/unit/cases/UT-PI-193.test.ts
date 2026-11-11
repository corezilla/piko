/**
 * Case ID: UT-PI-193  ·  STATUS: real
 *
 * 责任：分支 L314 `sorted[0]?.id`（?.；mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-193.md（脚本的唯一依据）
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

describe("UT-PI-193 · pollForExtractedMemory · 状态分支 × 合法迁移", () => {
  it("short-circuits a nullish first hit and keeps polling", async () => {  // short-circuits a nullish first hit and keeps polling
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    // 步骤 1：取真侧——sorted[0] 是有效对象，可选链不短路，id 被读到
    const good = vi.spyOn(adapter, "search").mockResolvedValue([
      { id: "mem-1", memory: "", score: 1, metadata: {}, created_at: "2026-01-01T00:00:00Z" },
    ]);
    try {
      // 步骤 2：调用 pollForExtractedMemory 并断言取真侧结果
      const found = await adapter.pollForExtractedMemory("tester:piko", "q");
      expect(found).toBe("mem-1");
      expect(good).toHaveBeenCalledTimes(1);
    } finally {
      good.mockRestore();
    }

    // 步骤 3：取假侧——sorted[0] 为 undefined，可选链短路取 undefined
    // 步骤 4：再次调用并断言取假侧结果——不崩、继续轮询、10 秒死线后落定为 null
    const bad = vi.spyOn(adapter, "search").mockResolvedValue([undefined as any]);
    vi.useFakeTimers();
    vi.setSystemTime(0);
    try {
      const pending = adapter.pollForExtractedMemory("tester:piko", "q");
      const result = await drainPoll(pending);
      expect(result).toBeNull();
      expect(bad).toHaveBeenCalledTimes(15);
      expect(Date.now()).toBe(10500);
    } finally {
      bad.mockRestore();
      vi.useRealTimers();
    }
  });
});
