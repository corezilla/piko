/**
 * Case ID: UT-REPO-641  ·  STATUS: real
 *
 * 责任：分支 L818 `loop (["matrix_sends", "discussion_turns", "d…`（loop；store.ts）
 * 维度坐标：`purge` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-641.md（脚本的唯一依据）
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

describe("UT-REPO-641 · purge · 状态分支 × 合法迁移", () => {
  it("deletes the child rows of every listed table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:818 的分支（loop：子表列表）取真的输入——一条有子记录的任务
      accept(store, task("t1"));
      store.reserveModel("t1", "op1", "step1", 1);
      store.reserveTool("t1", "op1", "tc1", "read_file", "read", "safe");
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用 purge 并断言该侧可观测结果
            const out = store.purge({ task_id: "t1" });
            const counts = {
              matrix_sends: store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any,
              model_attempts: store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any,
              tool_calls: store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any,
            };
            // 步骤 3：构造使该分支取假的输入——任务不存在，循环体不执行
            const ghost = store.purge({ task_id: "ghost" });
      // 步骤 3：断言——取真侧子表里的行被逐表删除；取假侧什么也没删
            expect(out).toEqual({ removed: 1, tombstones: 1 });
            expect(counts.matrix_sends.n).toBe(0);
            expect(counts.model_attempts.n).toBe(0);
            expect(counts.tool_calls.n).toBe(0);
            expect(ghost).toEqual({ removed: 0, tombstones: 0 });
    } finally {
      store.close();
    }
  });

});
