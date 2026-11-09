/**
 * Case ID: UT-REPO-232  ·  STATUS: real
 *
 * 责任：返回站点 L432 值 `this.tx(() => { const ex = this.db .pre…` 逐值断言（store.ts）
 * 维度坐标：`reserveModel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-232.md（脚本的唯一依据）
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

describe("UT-REPO-232 · reserveModel · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns true on both the fresh-reserve and the already-reserved path", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:432 的返回站点被到达的输入——同一条 (task, op, step, attempt) 先后调用两次
      accept(store, task("t1"));

      // 步骤 2：调用 reserveModel(…)
      const first = store.reserveModel("t1", "op", "step", 1);
      const second = store.reserveModel("t1", "op", "step", 1);

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(first).toBe(true);
      expect(second).toBe(true);
      // 幂等：第二次没有再插入一行，也没有再累加 model_calls
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t1'").get() as any).model_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
