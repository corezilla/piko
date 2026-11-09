/**
 * Case ID: UT-REPO-629  ·  STATUS: real
 *
 * 责任：分支 L799 `!isTerminal(state)`（!；store.ts）
 * 维度坐标：`result` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-629.md（脚本的唯一依据）
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

describe("UT-REPO-629 · result · 状态分支 × 合法迁移", () => {
  it("throws TaskNotTerminal while the run is live and returns the stored result once it is terminal", async () => {
    const store = newStore();
    try {
      accept(store, task("t-629"));

      // 步骤 1：构造使 store.ts:799 的分支（!：`!isTerminal(state)`）取真的输入——
      //         run 处于 Queued（非终态），且 results 表里没有该任务的行
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-629'").get() as any).state).toBe("Queued");
      expect((store.db.prepare("SELECT count(*) n FROM results WHERE task_id='t-629'").get() as any).n).toBe(0);

      // 步骤 2：调用 result(…) 并断言该侧可观测结果
      let notTerminal: any = null;
      try {
        store.result("t-629");
      } catch (e) {
        notTerminal = e;
      }
      expect(notTerminal?.code).toBe("TaskNotTerminal");
      expect(notTerminal?.status).toBe(409);
      expect(notTerminal?.message).toBe("task is not terminal");

      // 步骤 3：构造使该分支取假的输入——run 进入终态且结果行已写入
      store.finishQueued(result("t-629", { summary: "finished" }));
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t-629'").get() as any).state).toBe("Completed");

      // 步骤 4：再次调用 result(…) 并断言取假侧结果；两侧都必须被观测到
      const value = store.result("t-629");
      expect(value.task_id).toBe("t-629");
      expect(value.state).toBe("Completed");
      expect(value.summary).toBe("finished");
    } finally {
      store.close();
    }
  });

});
