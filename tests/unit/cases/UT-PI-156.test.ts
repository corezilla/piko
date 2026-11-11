/**
 * Case ID: UT-PI-156  ·  STATUS: real
 *
 * 责任：分支 L271 `messages[0]?.content ?? ""`（??；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-156.md（脚本的唯一依据）
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

describe("UT-PI-156 · add · 状态分支 × 合法迁移", () => {
  it("uses the first message content as the poll query and an empty string otherwise", async () => {  // uses the first message content as the poll query and an empty string otherwise
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }), json({ event_id: "evt-2" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧（?? 左侧非空）——首条 message 带 content
      // 步骤 2：调用 add 并断言——轮询 query 逐字等于 content 的前 80 字符
      const withContent = await adapter.add(validMessages("hello poll query"), "tester:piko");
      expect(withContent).toEqual({ ids: ["mem-1"] });
      expect(stub.searchCalls[0]!.body.query).toBe("hello poll query");

      // 步骤 3：取假侧（?? 右侧兜底 ""）——首条 message 没有 content
      // 步骤 4：再次调用 add 并断言——query 落到空串，再被轮询内部的 query || " " 换成单空格
      const withoutContent = await adapter.add(
        [{ role: "user", content: undefined as unknown as string }],
        "tester:piko",
      );
      expect(withoutContent).toEqual({ ids: ["mem-1"] });
      expect(stub.searchCalls[1]!.body.query).toBe(" ");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
