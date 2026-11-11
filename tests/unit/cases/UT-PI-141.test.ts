/**
 * Case ID: UT-PI-141  ·  STATUS: real
 *
 * 责任：参数 `metadata: Record<string, any>` 的 `注入字符` 类（mem0-client.ts:203）
 * 维度坐标：`add` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-141.md（脚本的唯一依据）
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

describe("UT-PI-141 · add · 字符串/路径/枚举输入 × 注入字符", () => {
  it("accepts injection payloads in metadata and never puts them on the wire", async () => {  // accepts injection payloads in metadata and never puts them on the wire
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：metadata 的注入字符类——路径穿越、SQL/命令元字符、控制字符
      const metadata = {
        path: "../../etc/passwd",
        sql: "'; DROP TABLE memories; --",
        cmd: "$(rm -rf /)",
        ctrl: "a\u0000b",
      };

      // 步骤 2：调用 add
      const res = await adapter.add(validMessages(), "tester:piko", metadata);

      // 步骤 3：断言——不被拒绝；metadata 只被读 tags，注入串一个都没上线
      expect(res).toEqual({ ids: ["mem-1"] });
      const addCall = stub.addCalls[0]!;
      expect(Object.keys(addCall.body)).toEqual(["messages", "user_id", "infer"]);
      expect(addCall.rawBody).not.toContain("passwd");
      expect(addCall.rawBody).not.toContain("DROP TABLE");
      expect(addCall.rawBody).not.toContain("rm -rf");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
