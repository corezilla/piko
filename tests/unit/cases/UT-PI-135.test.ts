/**
 * Case ID: UT-PI-135  ·  STATUS: real
 *
 * 责任：参数 `messages: Array<{ role: "user" | "assistant"; content: string }>` 的 `注入字符` 类（mem0-cli…
 * 维度坐标：`add` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-135.md（脚本的唯一依据）
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

describe("UT-PI-135 · add · 字符串/路径/枚举输入 × 注入字符", () => {
  it("passes traversal and injection payloads through verbatim without rejecting them", async () => {  // passes traversal and injection payloads through verbatim without rejecting them
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：messages 的注入字符类——路径穿越、SQL/命令元字符、控制字符、超长＋注入组合
      const payloads = [
        "../../etc/passwd",
        "/etc/shadow",
        "'; DROP TABLE memories; --",
        "$(rm -rf /)",
        "line1\r\nline2",
        "A".repeat(4096) + "../../etc/passwd",
      ];
      for (const content of payloads) {
        // 步骤 2：调用 add
        const res = await adapter.add(validMessages(content), "tester:piko");

        // 步骤 3：断言——实现不做注入过滤，请求照发，内容逐字节原样出现在请求体里
        expect(res).toEqual({ ids: ["mem-1"] });
        const addCall = stub.addCalls[stub.addCalls.length - 1]!;
        expect(addCall.body.messages[0]!.content).toBe(content);
      }
      expect(stub.addCalls.length).toBe(payloads.length);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
