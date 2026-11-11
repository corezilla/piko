/**
 * Case ID: UT-PI-165  ·  STATUS: real
 *
 * 责任：返回站点 L273 值 `{ ids: [memoryId ?? eventId] }` 逐值断言（mem0-client.ts）
 * 维度坐标：`add` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-165.md（脚本的唯一依据）
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

describe("UT-PI-165 · add · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns exactly ids with the polled memory id", async () => {  // returns exactly ids with the polled memory id
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1", status: "PENDING" }))
      .fallbackFor(
        SEARCH_PATH,
        json({
          results: [
            hit("mem-old", "2026-01-01T00:00:00Z"),
            hit("mem-new", "2026-06-01T00:00:00Z"),
          ],
        }),
      );
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：构造使返回站点被到达的输入——2xx + event_id，且轮询第一轮就命中
      // 步骤 2：调用 add
      const result = await adapter.add(validMessages("the fact"), "tester:piko");

      // 步骤 3：断言返回值逐值对账——结构只有 ids 一个字段，长度 1，
      // 值是轮询选出的那条（created_at 最新）的 id
      expect(Object.keys(result).sort()).toEqual(["ids"]);
      expect(Array.isArray(result.ids)).toBe(true);
      expect(result.ids.length).toBe(1);
      expect(result.ids[0]).toBe("mem-new");

      // 步骤 3：断言无未声明副作用——一次 add + 一次 search，就停
      expect(stub.addCalls.length).toBe(1);
      expect(stub.searchCalls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
