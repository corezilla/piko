/**
 * Case ID: UT-PI-151  ·  STATUS: real
 *
 * 责任：分支 L229 `tags && tags.length > 0`（&&；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-151.md（脚本的唯一依据）
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

describe("UT-PI-151 · add · 状态分支 × 合法迁移", () => {
  it("short-circuits the and when tags is nullish", async () => {  // short-circuits the and when tags is nullish
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ event_id: "evt-2" }), json({ event_id: "evt-3" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：左操作数取真、右操作数取真——tags 是非空数组
      // 步骤 2：调用 add 并断言——categories 被写入
      const truthy = await adapter.add(validMessages(), "tester:piko", { tags: ["a"] });
      expect(truthy).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[0]!.body.categories).toEqual(["a"]);

      // 步骤 3：左操作数取真、右操作数取假——tags 是空数组
      const emptyTags = await adapter.add(validMessages(), "tester:piko", { tags: [] });
      expect(emptyTags).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[1]!.body).not.toHaveProperty("categories");

      // 步骤 3：左操作数取假且必须短路——tags 为 null，null 上没有 .length
      // 步骤 4：再次调用 add 并断言取假侧结果——不抛 TypeError，categories 不出现
      const nullTags = await adapter.add(validMessages(), "tester:piko", { tags: null as any });
      expect(nullTags).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[2]!.body).not.toHaveProperty("categories");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
