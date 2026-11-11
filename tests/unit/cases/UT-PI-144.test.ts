/**
 * Case ID: UT-PI-144  ·  STATUS: real
 *
 * 责任：分支 L209 `!user_id || user_id.trim() === ""`（||；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-144.md（脚本的唯一依据）
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

describe("UT-PI-144 · add · 状态分支 × 合法迁移", () => {
  it("short-circuits the or when user_id is nullish and still guards whitespace", async () => {  // short-circuits the or when user_id is nullish and still guards whitespace
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：左操作数取真（!user_id 为真）且必须短路——null 上没有 .trim
      // 步骤 2：调用 add 并断言——抛的是守卫错误而不是 TypeError
      const nullUser = await adapter.add(validMessages(), null as any).then(() => null, (e) => e);
      expect(nullUser).toBeInstanceOf(Error);
      expect(nullUser.message).toBe("user_id required");
      expect(String(nullUser)).not.toContain("TypeError");

      // 步骤 1：左操作数取假、右操作数取真——纯空白串 trim 后为空
      const blankUser = await adapter.add(validMessages(), "   ").then(() => null, (e) => e);
      expect(blankUser).toBeInstanceOf(Error);
      expect(blankUser.message).toBe("user_id required");

      // 步骤 3：两个操作数都取假——非空 user_id，整条 || 为假，块被跳过
      // 步骤 4：再次调用 add 并断言取假侧结果
      const ok = await adapter.add(validMessages(), "tester:piko");
      expect(ok).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls.length).toBe(1);
      expect(stub.calls.length).toBeGreaterThan(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
