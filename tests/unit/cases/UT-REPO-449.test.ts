/**
 * Case ID: UT-REPO-449  ·  STATUS: real
 *
 * 责任：分支 L554 `if (r?.discussion_intake_state !== "Open")`（if；store.ts）
 * 维度坐标：`ingestMatrixBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-449.md（脚本的唯一依据）
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

describe("UT-REPO-449 · ingestMatrixBatch · 状态分支 × 合法迁移", () => {
  it("skips batch turns whose task intake is not Open", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:554 的分支（if：`if (r?.discussion_intake_state !== "Open")`）取真的输入
      accept(store, task("plain"));
      acceptDiscussion(store, "d1", "!r");
      acceptDiscussion(store, "d2", "!r2");
      store.db.prepare("UPDATE runs SET discussion_intake_state='Closed' WHERE task_id='d1'").run();
      // 步骤 2：调用 ingestMatrixBatch 并断言该侧可观测结果
            const n = store.ingestMatrixBatch(
              [
                { room: "!r", event: "e1", sender: "s", turns: [{ task: "d1", visible: "closed" }] },
                { room: "!r", event: "e2", sender: "s", turns: [{ task: "plain", visible: "disabled" }] },
              ],
              "cursor-1",
            );
            const turns = store.db.prepare("SELECT count(*) n FROM discussion_turns WHERE event_id IN ('e1','e2')").get() as any;
            // 步骤 3：构造使该分支取假的输入——intake 为 Open
            const open = store.ingestMatrixBatch([{ room: "!r", event: "e3", sender: "s", turns: [{ task: "d2", visible: "open" }] }], "cursor-2");
      // 步骤 3：断言——取真侧（Closed / Disabled）不写 turn；取假侧正常写
            expect(n).toBe(2);
            expect(turns.n).toBe(0);
            expect(open).toBe(1);
            expect(store.db.prepare("SELECT count(*) n FROM discussion_turns WHERE event_id='e3'").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
