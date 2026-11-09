/**
 * Case ID: UT-REPO-229  ·  STATUS: real
 *
 * 责任：分支 L436 `if (ex)`（if；store.ts）
 * 维度坐标：`reserveModel` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-229.md（脚本的唯一依据）
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

describe("UT-REPO-229 · reserveModel · 状态分支 × 合法迁移", () => {

  it("is idempotent: a repeated reservation returns true without a second row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:436 的分支（if：`if (ex)`）取真的输入——同一 (task,op,step,attempt) 已存在
      accept(store, task("t-229"));
      store.reserveModel("t-229", "op", "step", 1);

      // 步骤 2：调用 reserveModel(…) 并断言该侧可观测结果
      const again = store.reserveModel("t-229", "op", "step", 1);

      // 步骤 3：断言取真侧——返回 true，且不新增行、model_calls 不再自增
      expect(again).toBe(true);
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t-229'").get() as any).model_calls).toBe(1);

      // 步骤 4：断言取假侧——首次预留走 INSERT 分支，model_calls 自增到 1
      expect((store.db.prepare("SELECT state FROM model_attempts").get() as any).state).toBe("Started");
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
