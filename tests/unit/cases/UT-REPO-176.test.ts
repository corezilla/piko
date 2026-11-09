/**
 * Case ID: UT-REPO-176  ·  STATUS: real
 *
 * 责任：返回站点 L337 值 `this.tx(() => { const rows = this.db .p…` 逐值断言（store.ts）
 * 维度坐标：`failAccessLostTasks` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-176.md（脚本的唯一依据）
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

describe("UT-REPO-176 · failAccessLostTasks · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the access-lost task ids and leaves the other rooms alone", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造前置状态——两条任务在 !room:a，一条在 !room:b
      acceptDiscussion(store, "zz-176", "!room:a");
      acceptDiscussion(store, "aa-176", "!room:a");
      acceptDiscussion(store, "mm-176", "!room:b");
      expect(store.markDiscussionAccessLost("!room:a").sort()).toEqual(["aa-176", "zz-176"]);

      // 步骤 2：调用 failAccessLostTasks(…)
      const affected = store.failAccessLostTasks();

      // 步骤 3：断言返回值逐值对账——只有丢了访问权且仍在 Queued 的任务，按 task_id 升序
      expect(affected).toEqual(["aa-176", "zz-176"]);
      expect(store.getRun("aa-176").state).toBe("Failed");
      expect(store.getRun("zz-176").state).toBe("Failed");
      expect(store.getRun("mm-176").state).toBe("Queued");
      // 每个被终止的任务各写一条结果（实现声明的副作用）
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 2 });
      const failure = store.result("aa-176").failure;
      expect(failure?.code).toBe("DiscussionAccessLost");
      expect(failure?.cause_class).toBe("Authorization");
    } finally {
      store.close();
    }
  });

});
