/**
 * Case ID: UT-PI-157  ·  STATUS: real
 *
 * 责任：分支 L271 `messages[0]?.content`（?.；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-157.md（脚本的唯一依据）
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

describe("UT-PI-157 · add · 状态分支 × 合法迁移", () => {
  it("reads the first message and short-circuits when it is nullish", async () => {  // reads the first message and short-circuits when it is nullish
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ event_id: "evt-2" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——messages[0] 是有效对象，可选链不短路
      // 步骤 2：调用 add 并断言——轮询 query 读到 content
      const present = await adapter.add(validMessages("first message"), "tester:piko");
      expect(present).toEqual({ ids: ["mem-1"] });
      expect(stub.searchCalls[0]!.body.query).toBe("first message");

      // 步骤 3：取假侧——messages[0] 为 null，可选链短路取 undefined，再由 ?? 兜成 ""
      // 步骤 4：再次调用 add 并断言——不抛 TypeError，query 走 query || " " 落到单空格
      const nullish = await adapter.add([null as any], "tester:piko");
      expect(nullish).toEqual({ ids: ["mem-1"] });
      expect(stub.searchCalls[1]!.body.query).toBe(" ");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
