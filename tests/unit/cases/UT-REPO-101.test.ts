/**
 * Case ID: UT-REPO-101  ·  STATUS: real
 *
 * 责任：参数 `command: FencedRunCommand` 的 `非法值` 类（store.ts:232）
 * 维度坐标：`mutateRun` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-101.md（脚本的唯一依据）
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

describe("UT-REPO-101 · mutateRun · 纯函数/无副作用 × 非法值", () => {

  it("rejects illegal mutateRun commands with typed errors and no state write", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造 command——未知 task_id、对不上的 generation、含不住当前状态的 expected_state_in；其余参数取合法等价类
      accept(store, task("t1"));
      const unknownTask = { task_id: "no-such-task", expected_generation: 1, mutation: () => {} };
      const badGeneration = { task_id: "t1", expected_generation: 99, mutation: () => {} };
      const badState = { task_id: "t1", expected_generation: 1, expected_state_in: ["Running"], mutation: () => {} };

      // 步骤 2：调用 mutateRun(…)
      const errors: any[] = [];
      for (const cmd of [unknownTask, badGeneration, badState]) {
        try {
          store.mutateRun(cmd as any);
        } catch (e) {
          errors.push(e);
        }
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      expect(errors).toHaveLength(3);
      expect(errors.map((e) => e.code)).toEqual(["NotFound", "FencedWrite", "FencedWrite"]);
      expect(errors.map((e) => e.status)).toEqual([404, 409, 409]);
      for (const e of errors) expect(e).toBeInstanceOf(PikoError);
      // 无部分写入：generation 未动、状态未动、run 行数未变
      expect(store.generation("t1")).toBe(1);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t1'").get() as any).state).toBe("Queued");
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
