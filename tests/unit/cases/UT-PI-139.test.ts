/**
 * Case ID: UT-PI-139  ·  STATUS: real
 *
 * 责任：参数 `metadata: Record<string, any>` 的 `空` 类（mem0-client.ts:203）
 * 维度坐标：`add` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-139.md（脚本的唯一依据）
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

describe("UT-PI-139 · add · 字符串/路径/枚举输入 × 空", () => {
  it("accepts every empty shape of metadata and sends neither metadata nor categories", async () => {  // accepts every empty shape of metadata and sends neither metadata nor categories
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：metadata 的空类三态——空串 / undefined（缺省）/ null（显式空值）
      const empties: any[] = ["", undefined, null];
      for (const metadata of empties) {
        // 步骤 2：调用 add
        const res = await adapter.add(validMessages(), "tester:piko", metadata);

        // 步骤 3：断言——metadata 不被拒绝；只有 tags 会被读，body 里既没有 metadata 也没有 categories
        expect(res).toEqual({ ids: ["mem-1"] });
        const addCall = stub.addCalls[stub.addCalls.length - 1]!;
        expect(Object.keys(addCall.body)).toEqual(["messages", "user_id", "infer"]);
        expect(addCall.body).not.toHaveProperty("metadata");
        expect(addCall.body).not.toHaveProperty("categories");
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
