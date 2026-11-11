/**
 * Case ID: UT-PI-133  ·  STATUS: real
 *
 * 责任：参数 `messages: Array<{ role: "user" | "assistant"; content: string }>` 的 `空` 类（mem0-client…
 * 维度坐标：`add` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-133.md（脚本的唯一依据）
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

describe("UT-PI-133 · add · 字符串/路径/枚举输入 × 空", () => {
  it("rejects every empty shape of messages before any request", async () => {  // rejects every empty shape of messages before any request
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub();
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：messages 的空类四态——空串 / undefined（缺省）/ null（显式空值）/ 空数组
      const empties: any[] = ["", undefined, null, []];
      for (const messages of empties) {
        // 步骤 2：调用 add
        const err = await adapter.add(messages, "tester:piko").then(() => null, (e) => e);

        // 步骤 3：断言——抛出的是普通 Error（不是 typed Mem0ApiError），消息逐值相等
        expect(err).toBeInstanceOf(Error);
        expect(err).not.toBeInstanceOf(Mem0ApiError);
        expect(err.message).toBe("messages must be non-empty");
      }

      // 步骤 3：断言无副作用——守卫先于 fetch，一个请求都没发出
      expect(stub.calls.length).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
