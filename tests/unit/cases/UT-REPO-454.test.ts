/**
 * Case ID: UT-REPO-454  ·  STATUS: real
 *
 * 责任：返回站点 L548 值 `this.tx(() => { for (const item of even…` 逐值断言（store.ts）
 * 维度坐标：`ingestMatrixBatch` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-454.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { TaskStore, asReader } from "../../../src/store.js";
import {
  accept,
  acceptDiscussion,
  discussionTask,
  newStore,
  rawUsageSample,
  result,
  task,
} from "./support/repo-fix.js";
import type { AgentResult } from "../../../src/types.js";

describe("UT-REPO-454 · ingestMatrixBatch · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the transaction's value from the outer return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:548 的返回站点被到达的输入——非空批次
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch
            const value = store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s", turns: [] }], "cursor-1");
      // 步骤 3：断言返回值逐值对账，且无未声明副作用
            expect(typeof value).toBe("number");
            expect(value).toBe(1);
            expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
