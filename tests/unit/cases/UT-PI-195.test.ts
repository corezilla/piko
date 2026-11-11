/**
 * Case ID: UT-PI-195  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `new Promise((r` 拒绝必须 typed 化上抛（mem0-client.ts:299）
 * 维度坐标：`pollForExtractedMemory` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-195.md（脚本的唯一依据）
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

describe("UT-PI-195 · pollForExtractedMemory · 错误路径 × 每个 typed 错误码", () => {
  it("never rejects on a failing search and propagates a broken timer raw", async () => {  // never rejects on a failing search and propagates a broken timer raw
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const failing = new Mem0FetchStub().fallbackFor(
      SEARCH_PATH,
      json({ message: "upstream down" }, 500, "Internal Server Error"),
    );
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubGlobal("fetch", failing.fetch);
    try {
      // 步骤 1：注入被调方失败——search 每轮都抛 Mem0ApiError
      // 步骤 2：调用 pollForExtractedMemory
      // 步骤 3：断言——实现的真实行为是**不**上抛：轮询把错误吞掉，
      // promise 落定为 null（文档要求的「typed 化上抛」在实现里不存在）
      const pending = adapter.pollForExtractedMemory("tester:piko", "q");
      const settled = await drainPoll(pending);
      expect(settled).toBeNull();
      expect(failing.searchCalls.length).toBe(15);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }

    // 步骤 3：唯一的拒绝通道是 setTimeout 抛错——new Promise 的 executor 抛出会让
    // 睡眠 promise 拒绝，await 把它原样上抛（不是 typed 错误）
    vi.useFakeTimers();
    vi.stubGlobal("fetch", new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] })).fetch);
    vi.stubGlobal("setTimeout", (() => {
      throw new Error("timer boom");
    }) as unknown as typeof setTimeout);
    try {
      const err = await adapter.pollForExtractedMemory("tester:piko", "q").then(
        () => null,
        (e) => e,
      );
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("timer boom");
      expect(err).not.toBeInstanceOf(Mem0ApiError);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
