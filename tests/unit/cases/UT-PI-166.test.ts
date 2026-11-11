/**
 * Case ID: UT-PI-166  ·  STATUS: real
 *
 * 责任：返回站点 L275 值 `{ ids: [] }` 逐值断言（mem0-client.ts）
 * 维度坐标：`add` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-166.md（脚本的唯一依据）
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

describe("UT-PI-166 · add · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns exactly ids with an empty array when no event id came back", async () => {  // returns exactly ids with an empty array when no event id came back
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(
        ADD_PATH,
        json({ status: "DONE" }),
        json({ event_id: "", status: "PENDING" }),
        json({}),
      )
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：构造使返回站点被到达的输入——2xx 但 event_id 缺失 / 空串 / 空对象
      // 步骤 2：调用 add
      for (let i = 0; i < 3; i += 1) {
        const result = await adapter.add(validMessages(), "tester:piko");

        // 步骤 3：断言返回值逐值对账——ids 是空数组
        expect(Object.keys(result).sort()).toEqual(["ids"]);
        expect(result.ids).toEqual([]);
        expect(result.ids.length).toBe(0);
      }

      // 步骤 3：断言无未声明副作用——三次 add，零次轮询
      expect(stub.addCalls.length).toBe(3);
      expect(stub.searchCalls.length).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
