/**
 * Case ID: UT-PI-150  ·  STATUS: real
 *
 * 责任：分支 L229 `if (tags && tags.length > 0)`（if；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-150.md（脚本的唯一依据）
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

describe("UT-PI-150 · add · 状态分支 × 合法迁移", () => {
  it("maps non-empty tags onto categories and skips empty tags", async () => {  // maps non-empty tags onto categories and skips empty tags
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ event_id: "evt-2" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——tags && tags.length > 0 为真（length = 1，越过 0 这一界）
      // 步骤 2：调用 add 并断言取真侧结果——块内动作 body.categories = tags 逐值发生
      const withTags = await adapter.add(validMessages(), "tester:piko", {
        tags: ["skill", "test"],
      });
      expect(withTags).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[0]!.body.categories).toEqual(["skill", "test"]);

      // 步骤 3：取假侧——tags && tags.length > 0 为假（length = 0，不越界一侧）
      // 步骤 4：再次调用 add 并断言取假侧结果——块被跳过，categories 不出现
      const withoutTags = await adapter.add(validMessages(), "tester:piko", { tags: [] });
      expect(withoutTags).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[1]!.body).not.toHaveProperty("categories");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
