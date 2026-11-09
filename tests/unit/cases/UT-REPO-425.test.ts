/**
 * Case ID: UT-REPO-425  ·  STATUS: real
 *
 * 责任：返回站点 L529 值 `this.tx(() => { const inserted = this.d…` 逐值断言（store.ts）
 * 维度坐标：`ingestMatrixEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-425.md（脚本的唯一依据）
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

describe("UT-REPO-425 · ingestMatrixEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the transaction's boolean from the outer return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:529 的返回站点被到达的输入——全新事件
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent
            const value = store.ingestMatrixEvent("!r", "event-a", "sender-a", "txn-a", []);
      // 步骤 3：断言返回值逐值对账，且无未声明副作用
            expect(typeof value).toBe("boolean");
            expect(value).toBe(true);
            expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
