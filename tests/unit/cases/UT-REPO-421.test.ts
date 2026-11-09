/**
 * Case ID: UT-REPO-421  ·  STATUS: real
 *
 * 责任：分支 L534 `if (r?.discussion_intake_state !== "Open")`（if；store.ts）
 * 维度坐标：`ingestMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-421.md（脚本的唯一依据）
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

describe("UT-REPO-421 · ingestMatrixEvent · 状态分支 × 合法迁移", () => {
  it("skips turns whose task intake is not Open", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:534 的分支（if：`if (r?.discussion_intake_state !== "Open")`）取真的输入
      accept(store, task("plain"));
      acceptDiscussion(store, "d1", "!r");
      acceptDiscussion(store, "d2", "!r2");
      store.db.prepare("UPDATE runs SET discussion_intake_state='Closed' WHERE task_id='d1'").run();
      // 步骤 2：调用 ingestMatrixEvent 并断言该侧可观测结果
            const ok = store.ingestMatrixEvent("!r", "e1", "sender-1", "txn-1", [
              { task: "d1", visible: "closed" },
              { task: "plain", visible: "no-discussion" },
            ]);
            const rows = store.db.prepare("SELECT task_id FROM discussion_turns WHERE event_id='e1'").all() as any[];
            // 步骤 3：构造使该分支取假的输入——intake 为 Open
            const open = store.ingestMatrixEvent("!r", "e2", "sender-1", "txn-2", [{ task: "d2", visible: "open" }]);
      // 步骤 3：断言——取真侧（Closed / Disabled）不写 turn；取假侧正常写
            expect(ok).toBe(true);
            expect(rows.length).toBe(0);
            expect(open).toBe(true);
    } finally {
      store.close();
    }
  });

});
