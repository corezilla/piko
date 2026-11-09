/**
 * Case ID: UT-REPO-607  ·  STATUS: real
 *
 * 责任：分支 L767 `if (!this.db.prepare("SELECT 1 FROM results W…`（if；store.ts）
 * 维度坐标：`finish` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-607.md（脚本的唯一依据）
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

describe("UT-REPO-607 · finish · 状态分支 × 合法迁移", () => {

  it("inserts the result when the generation is absent and keeps the published one when it is present", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:767 的分支取真的输入——results 表里还没有该 task_id/generation 的行
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };

      // 步骤 2：调用 finish(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      store.finish(result("t1", { generation: 1, summary: "written-by-finish" }), grant.lease_epoch);
      const written = store.db.prepare("SELECT result_json FROM results WHERE task_id='t1'").get() as any;
      expect(JSON.parse(written.result_json).summary).toBe("written-by-finish");

      // 步骤 3：构造使该分支取假的输入——同 task_id/generation 的结果行已存在（无显式 else：取假即跳过该块，断言块内副作用不发生）
      //         第二次 finish 被槽释放挡住，先重开一条同任务的槽来进入该分支
      const store2 = newStore();
      try {
        accept(store2, task("t2"));
        const grant2 = store2.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };
        store2.publishResult(result("t2", { generation: 1, summary: "written-by-publish" }), grant2.lease_epoch);
        store2.finish(result("t2", { generation: 1, summary: "written-by-finish" }), grant2.lease_epoch);
        const kept = store2.db.prepare("SELECT result_json FROM results WHERE task_id='t2'").get() as any;
        // 取假侧的结果仍是 publishResult 写下的那一份——finish 不覆盖已发布的结果
        expect(JSON.parse(kept.result_json).summary).toBe("written-by-publish");
        expect((store2.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
        expect((store2.db.prepare("SELECT state FROM runs WHERE task_id='t2'").get() as any).state).toBe("Completed");
      } finally {
        store2.close();
      }
    } finally {
      store.close();
    }
  });

});
