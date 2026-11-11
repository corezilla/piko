/**
 * Case ID: UT-PI-146  ·  STATUS: real
 *
 * 责任：分支 L214 `if (!Array.isArray(messages) || messages.leng…`（if；mem0-client.ts）
 * 维度坐标：`add` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-146.md（脚本的唯一依据）
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

describe("UT-PI-146 · add · 状态分支 × 合法迁移", () => {
  it("takes both sides of the messages guard", async () => {  // takes both sides of the messages guard
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub()
      .on(ADD_PATH, json({ event_id: "evt-1" }))
      .fallbackFor(SEARCH_PATH, json({ results: [hit("mem-1")] }));
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1：取真侧——满足任一分支即可：非数组（null）或 length === 0（空数组）
      for (const messages of [null, []] as any[]) {
        // 步骤 2：调用 add 并断言取真侧结果——块内 throw 执行，请求没有发出
        const err = await adapter.add(messages, "tester:piko").then(() => null, (e) => e);
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("messages must be non-empty");
      }
      expect(stub.calls.length).toBe(0);

      // 步骤 3：取假侧——非空数组，两个操作数都为假
      // 步骤 4：再次调用 add 并断言取假侧结果
      const ok = await adapter.add(validMessages(), "tester:piko");
      expect(ok).toEqual({ ids: ["mem-1"] });
      expect(stub.addCalls[0]!.body.messages).toEqual(validMessages());
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
