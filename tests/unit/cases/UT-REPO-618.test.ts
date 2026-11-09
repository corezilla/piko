/**
 * Case ID: UT-REPO-618  ·  STATUS: real
 *
 * 责任：分支 L784 `if (isTerminal(r.state))`（if；store.ts）
 * 维度坐标：`finishQueued` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-618.md（脚本的唯一依据）
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

describe("UT-REPO-618 · finishQueued · 状态分支 × 合法迁移", () => {

  it("returns without touching anything when the run is already terminal", async () => {
    const store = newStore();
    try {
      accept(store, task("t-618"));
      store.finishQueued(result("t-618"));
      const before = store.db.prepare("SELECT state,finished_at FROM runs WHERE task_id='t-618'").get() as any;

      // 步骤 1：构造使 store.ts:784 的分支（if：`if (isTerminal(r.state))`）取真的输入
      // 步骤 2：调用 finishQueued(…) 并断言该侧可观测结果
      store.finishQueued(result("t-618", { generation: 7, summary: "second" }));

      // 步骤 3：构造使该分支取假的输入——run 还不是终态
      // 步骤 4：再次调用 finishQueued(…) 并断言取假侧结果（两侧都被观测到）
      accept(store, task("t-618b"));
      store.finishQueued(result("t-618b", { state: "Failed" }));

      // 断言：终态侧是提前退出——旧结果原封不动，没有第二行结果
      const after = store.db.prepare("SELECT state,finished_at FROM runs WHERE task_id='t-618'").get() as any;
      expect(after).toEqual(before);
      expect(store.result("t-618").summary).toBe("done");
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 2 });
      // 取假侧确实落了终态
      expect(store.getRun("t-618b").state).toBe("Failed");
    } finally {
      store.close();
    }
  });

});
