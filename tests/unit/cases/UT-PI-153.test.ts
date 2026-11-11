/**
 * Case ID: UT-PI-153  ·  STATUS: real
 *
 * 责任：分支 L262 `if (response.ok)`（if；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-153.md（脚本的唯一依据）
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

describe("UT-PI-153 · add · 状态分支 × 合法迁移", () => {
  it("takes both sides of response.ok", async () => {  // takes both sides of response.ok
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(
        ADD_PATH,
        json({ event_id: "evt-1" }),
        json({ error: "nope" }, 404, "Not Found"),
      )
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——2xx 响应，response.ok 为真
      // 步骤 2：调用 add 并断言取真侧结果——块内解析 event_id 并转轮询
      const ok = await adapter.add(validMessages("the fact"), "tester:piko");
      expect(ok).toEqual({ ids: ["mem-1"] });
      expect(stub.searchCalls.length).toBe(1);

      // 步骤 3：取假侧——404 响应，response.ok 为假
      // 步骤 4：再次调用 add 并断言取假侧结果——不解析成功载荷，不轮询，抛 typed 错误
      const missing = await adapter.add(validMessages("the fact"), "tester:piko").then(
        () => null,
        (e) => e,
      );
      expect(missing).toBeInstanceOf(Mem0ApiError);
      expect(missing.status).toBe(404);
      expect(missing.code).toBe("not_found");
      expect(missing.message).toBe("Not Found");
      expect(stub.searchCalls.length).toBe(1);
      expect(stub.addCalls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
