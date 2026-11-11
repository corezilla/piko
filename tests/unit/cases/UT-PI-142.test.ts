/**
 * Case ID: UT-PI-142  ·  STATUS: real
 *
 * 责任：可选参数 `metadata` 缺省/显式两态（mem0-client.ts:203）
 * 维度坐标：`add` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-142.md（脚本的唯一依据）
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

describe("UT-PI-142 · add · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("treats an omitted metadata and an explicit default metadata identically", async () => {  // treats an omitted metadata and an explicit default metadata identically
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：可选参数 metadata 的三态——缺省、显式默认值、未知枚举值
      const omitted = await adapter.add(validMessages(), "tester:piko");
      const explicit = await adapter.add(validMessages(), "tester:piko", {});
      const unknown = await adapter.add(validMessages(), "tester:piko", {
        type: "totally-unknown-enum-value",
      });

      // 步骤 2：三次调用的返回值逐一比对
      expect(omitted).toEqual({ ids: ["mem-1"] });
      expect(explicit).toEqual({ ids: ["mem-1"] });
      expect(unknown).toEqual({ ids: ["mem-1"] });

      // 步骤 3：断言缺省态与显式默认值同构（请求体逐字节相同）
      const bodies = stub.addCalls.map((c) => c.rawBody);
      expect(bodies[1]).toBe(bodies[0]);

      // 步骤 3：未知枚举值同样不被拒绝——实现只读 metadata.tags，其余字段一律不上线
      expect(bodies[2]).toBe(bodies[0]);
      expect(JSON.parse(bodies[2]!)).not.toHaveProperty("metadata");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
