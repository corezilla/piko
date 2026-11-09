/**
 * Case ID: UT-REPO-455  ·  STATUS: real
 *
 * 责任：返回站点 L563 值 `events.length` 逐值断言（store.ts）
 * 维度坐标：`ingestMatrixBatch` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-455.md（脚本的唯一依据）
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

describe("UT-REPO-455 · ingestMatrixBatch · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns events.length as the batch result", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:563 的返回站点被到达的输入——三条事件（其中一条重投）
      acceptDiscussion(store, "d1", "!r");
      store.ingestMatrixBatch([{ room: "!r", event: "e0", sender: "s", turns: [] }], "cursor-0");
      // 步骤 2：调用 ingestMatrixBatch
            const value = store.ingestMatrixBatch(
              [
                { room: "!r", event: "e0", sender: "s", turns: [] },
                { room: "!r", event: "e1", sender: "s", turns: [] },
                { room: "!r", event: "e2", sender: "s", turns: [] },
              ],
              "cursor-1",
            );
      // 步骤 3：断言返回值逐值对账——返回的是入参长度，不是实际插入条数
            expect(value).toBe(3);
            expect((store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any).n).toBe(3);
    } finally {
      store.close();
    }
  });

});
