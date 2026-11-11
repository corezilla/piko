/**
 * Case ID: UT-PI-148  ·  STATUS: real
 *
 * 责任：分支 L214 `!Array.isArray(messages)`（!；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-148.md（脚本的唯一依据）
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

describe("UT-PI-148 · add · 状态分支 × 合法迁移", () => {
  it("rejects non-arrays via the not-isArray operand and lets arrays through it", async () => {  // rejects non-arrays via the not-isArray operand and lets arrays through it
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——Array.isArray(messages) 为假：字符串 / 数字 / 普通对象
      for (const messages of ["not-an-array", 42, { role: "user", content: "x" }] as any[]) {
        // 步骤 2：调用 add 并断言取真侧结果——! 为真，块内 throw 执行
        const err = await adapter.add(messages, "tester:piko").then(() => null, (e) => e);
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("messages must be non-empty");
      }
      expect(stub.calls.length).toBe(0);

      // 步骤 3：取假侧——Array.isArray 为真：! 不再拦截，改由 length 操作数接管
      // 步骤 4：再次调用 add 并断言——空数组照样被拒，非空数组放行
      const emptyArray = await adapter.add([], "tester:piko").then(() => null, (e) => e);
      expect(emptyArray.message).toBe("messages must be non-empty");
      const ok = await adapter.add(validMessages(), "tester:piko");
      expect(ok).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
