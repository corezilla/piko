/**
 * Case ID: UT-REPO-450  ·  STATUS: real
 *
 * 责任：分支 L554 `r?.discussion_intake_state`（?.；store.ts）
 * 维度坐标：`ingestMatrixBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-450.md（脚本的唯一依据）
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

describe("UT-REPO-450 · ingestMatrixBatch · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional chain for a task that does not exist", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:554 的分支（?.：`r?.discussion_intake_state`）取真的输入——r 为有效值
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch 并断言该侧可观测结果
            const known = store.ingestMatrixBatch([{ room: "!r", event: "e1", sender: "s", turns: [{ task: "d1", visible: "known" }] }], "cursor-1");
            const knownRow = store.db.prepare("SELECT * FROM discussion_turns WHERE event_id='e1'").get() as any;
            // 步骤 3：构造使该分支取假的输入——r 为 undefined（任务不存在，可选链短路取 undefined）
            const unknown = store.ingestMatrixBatch([{ room: "!r", event: "e2", sender: "s", turns: [{ task: "ghost", visible: "ghost" }] }], "cursor-2");
            const unknownRow = store.db.prepare("SELECT * FROM discussion_turns WHERE event_id='e2'").get() as any;
      // 步骤 3：断言——任务存在时可选链不短路、正常写 turn；任务不存在时短路取 undefined → continue
            expect(known).toBe(1);
            expect(knownRow.task_id).toBe("d1");
            expect(unknown).toBe(1);
            expect(unknownRow).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
