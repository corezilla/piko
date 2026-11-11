/**
 * Case ID: UT-PI-149  ·  STATUS: real
 *
 * 责任：分支 L223 `(metadata as { tags?: string[] } | undefined)…`（?.；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-149.md（脚本的唯一依据）
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

describe("UT-PI-149 · add · 状态分支 × 合法迁移", () => {
  it("reads tags when metadata is an object and short-circuits when it is nullish", async () => {  // reads tags when metadata is an object and short-circuits when it is nullish
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ event_id: "evt-2" }), json({ event_id: "evt-3" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——metadata 是有效对象，可选链不短路，tags 被读到
      // 步骤 2：调用 add 并断言取真侧结果——tags 映射成 categories
      const withTags = await adapter.add(validMessages(), "tester:piko", { tags: ["skill"] });
      expect(withTags).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[0]!.body.categories).toEqual(["skill"]);

      // 步骤 3：取假侧——metadata 为 undefined / null，可选链短路取 undefined
      // 步骤 4：再次调用 add 并断言取假侧结果——不抛 TypeError，且 categories 不出现
      const omitted = await adapter.add(validMessages(), "tester:piko");
      expect(omitted).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[1]!.body).not.toHaveProperty("categories");

      const explicitNull = await adapter.add(validMessages(), "tester:piko", null as any);
      expect(explicitNull).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[2]!.body).not.toHaveProperty("categories");
      // 若 ?. 不短路，null.tags 会是 TypeError——这里能拿到返回值即证明短路
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
