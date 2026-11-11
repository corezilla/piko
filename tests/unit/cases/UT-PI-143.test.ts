/**
 * Case ID: UT-PI-143  ·  STATUS: real
 *
 * 责任：分支 L209 `if (!user_id || user_id.trim() === "")`（if；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-143.md（脚本的唯一依据）
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

describe("UT-PI-143 · add · 状态分支 × 合法迁移", () => {
  it("takes both sides of the user_id guard", async () => {  // takes both sides of the user_id guard
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——user_id 为空串，守卫 if (!user_id || user_id.trim() === "") 命中
      // 步骤 2：调用 add 并断言取真侧结果——块内 throw 执行，请求没有发出
      const rejected = await adapter.add(validMessages(), "").then(() => null, (e) => e);
      expect(rejected).toBeInstanceOf(Error);
      expect(rejected.message).toBe("user_id required");
      expect(stub.calls.length).toBe(0);

      // 步骤 3：取假侧——user_id 非空且 trim 后非空
      // 步骤 4：再次调用 add 并断言取假侧结果——跳过 throw 块，请求照常发出
      const accepted = await adapter.add(validMessages(), "tester:piko");
      expect(accepted).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls.length).toBe(1);
      expect(stub.addCalls[0]!.body.user_id).toBe("tester:piko");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
