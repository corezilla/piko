/**
 * Case ID: UT-PI-164  ·  STATUS: real
 *
 * 责任：throw L287 `reject`（守卫 `unconditional`；mem0-client.ts）
 * 维度坐标：`add` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-164.md（脚本的唯一依据）
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

describe("UT-PI-164 · add · 错误路径 × 每个 typed 错误码", () => {
  it("maps every non-2xx status onto its typed code and message", async () => {  // maps every non-2xx status onto its typed code and message
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const cases: Array<{ status: number; statusText: string; code: string }> = [
      { status: 401, statusText: "Unauthorized", code: "auth_invalid" },
      { status: 403, statusText: "Forbidden", code: "auth_forbidden" },
      { status: 404, statusText: "Not Found", code: "not_found" },
      { status: 429, statusText: "Too Many Requests", code: "rate_limited" },
      { status: 500, statusText: "Internal Server Error", code: "server_error" },
      { status: 503, statusText: "Service Unavailable", code: "server_error" },
      { status: 418, statusText: "I'm a teapot", code: "server_error" },
    ];
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, ...cases.map((c) => text("", c.status, c.statusText)));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      for (const expected of cases) {
        // 步骤 1：构造触发 throw 的输入——非 2xx 状态码（无 throw 守卫，直接调用即命中）
        // 步骤 2：调用 add 并断言——status / code / message 逐值对 ISD §5 错误码表
        const err = await adapter.add(validMessages(), "tester:piko").then(() => null, (e) => e);
        expect(err, `status ${expected.status}`).toBeInstanceOf(Mem0ApiError);
        expect(err.status, `status ${expected.status}`).toBe(expected.status);
        expect(err.code, `status ${expected.status}`).toBe(expected.code);
        expect(err.message, `status ${expected.status}`).toBe(expected.statusText);

        // 步骤 3：断言无部分写入——失败后不轮询
        expect(stub.searchCalls.length).toBe(0);
      }
      // 步骤 4：断言保真传播——没有内部错误被伪装成别的类型
      expect(stub.addCalls.length).toBe(cases.length);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
