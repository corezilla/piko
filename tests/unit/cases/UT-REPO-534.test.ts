/**
 * Case ID: UT-REPO-534  ·  STATUS: real
 *
 * 责任：返回站点 L638 值 `{ outcome: "AlreadyTerminal", requested…` 逐值断言（store.ts）
 * 维度坐标：`cancel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-534.md（脚本的唯一依据）
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

describe("UT-REPO-534 · cancel · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns AlreadyTerminal with an ISO requested_at for an already terminal task", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:638 的返回站点被到达的输入——把任务推到终态 Failed
      accept(store, task("t-534"));
      store.db.prepare("UPDATE runs SET state='Failed' WHERE task_id='t-534'").run();

      // 步骤 2：调用 cancel(…)
      const outcome = store.cancel("t-534");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(Object.keys(outcome).sort()).toEqual(["outcome", "requested_at"]);
      expect(outcome.outcome).toBe("AlreadyTerminal");
      expect(typeof outcome.requested_at).toBe("string");
      expect(outcome.requested_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(Number.isNaN(Date.parse(outcome.requested_at))).toBe(false);
      // 无未声明副作用：终态不被改写，也没有写入结果行
      expect((store.db.prepare("SELECT state,cancel_requested FROM runs WHERE task_id='t-534'").get() as any)).toEqual({
        state: "Failed",
        cancel_requested: 0,
      });
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
