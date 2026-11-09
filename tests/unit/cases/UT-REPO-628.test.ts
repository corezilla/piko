/**
 * Case ID: UT-REPO-628  ·  STATUS: real
 *
 * 责任：分支 L797 `if (r)`（if；store.ts）
 * 维度坐标：`result` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-628.md（脚本的唯一依据）
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

describe("UT-REPO-628 · result · 状态分支 × 合法迁移", () => {

  it("returns the stored result when a row exists and raises when it does not", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:797 的分支（if：`if (r)`）取真的输入——results 里已有行
      accept(store, task("t-628"));
      store.finishQueued(result("t-628"));

      // 步骤 2：调用 result(…) 并断言该侧可观测结果
      const stored = store.result("t-628");

      // 步骤 3：断言取真侧——返回 JSON.parse(result_json)，逐值对账
      expect(stored.task_id).toBe("t-628");
      expect(stored.state).toBe("Completed");
      expect(stored.summary).toBe("done");

      // 步骤 4：断言取假侧——没有结果行时按 run 状态分叉：非终态抛 TaskNotTerminal，
      // 终态但缺结果抛 ResultUnavailable
      accept(store, task("t-628-b"));
      let notTerminal: any = null;
      try {
        store.result("t-628-b");
      } catch (e) {
        notTerminal = e;
      }
      expect((notTerminal as any).code).toBe("TaskNotTerminal");
      store.db.prepare("UPDATE runs SET state='Failed' WHERE task_id='t-628-b'").run();
      let unavailable: any = null;
      try {
        store.result("t-628-b");
      } catch (e) {
        unavailable = e;
      }
      expect((unavailable as any).code).toBe("ResultUnavailable");
    } finally {
      store.close();
    }
  });

});
