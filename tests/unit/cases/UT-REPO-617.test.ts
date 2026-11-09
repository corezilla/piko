/**
 * Case ID: UT-REPO-617  ·  STATUS: real
 *
 * 责任：分支 L783 `!r`（!；store.ts）
 * 维度坐标：`finishQueued` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-617.md（脚本的唯一依据）
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

describe("UT-REPO-617 · finishQueued · 状态分支 × 合法迁移", () => {
  it("throws NotFound when the run does not exist and proceeds normally when it does", async () => {
    const store = newStore();
    try {
      accept(store, task("t-617"));

      // 步骤 1：构造使 store.ts:783 的分支（!：`!r`）取真的输入——查不到 run 行
      // 步骤 2：调用 finishQueued(…) 并断言该侧可观测结果
      let notFound: any = null;
      try {
        store.finishQueued(result("t-617-missing"));
      } catch (e) {
        notFound = e;
      }
      expect(notFound?.code).toBe("NotFound");
      expect(notFound?.status).toBe(404);
      expect(notFound?.message).toBe("run not found");
      // 无部分写入
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);

      // 步骤 3：构造使该分支取假的输入——run 行存在
      expect((store.db.prepare("SELECT 1 FROM runs WHERE task_id='t-617'").get() as any)).toBeTruthy();

      // 步骤 4：再次调用 finishQueued(…) 并断言取假侧结果；两侧都必须被观测到
      store.finishQueued(result("t-617"));
      expect((store.db.prepare("SELECT state,finished_at FROM runs WHERE task_id='t-617'").get() as any).state).toBe("Completed");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
