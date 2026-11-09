/**
 * Case ID: UT-REPO-115  ·  STATUS: real
 *
 * 责任：返回站点 L251 值 `next.generation` 逐值断言（store.ts）
 * 维度坐标：`mutateRun` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-115.md（脚本的唯一依据）
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

describe("UT-REPO-115 · mutateRun · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the incremented generation and mirrors it into the runs row", async () => {
    const store = newStore();
    try {
      accept(store, task("t-115"));
      expect(store.generation("t-115")).toBe(1);

      // 步骤 1：构造使 store.ts:251 的返回站点被到达的输入——expected_generation ＝ 当前值 1
      // 步骤 2：调用 mutateRun(…)
      const first = store.mutateRun({
        task_id: "t-115",
        expected_generation: 1,
        mutation: (r: any) => {
          r.state = "Running";
        },
      });
      // 返回的 next.generation 与权威事实源里的 runs.generation 逐值一致（第一次调用后立刻读）
      const afterFirst = (store.db.prepare("SELECT generation FROM runs WHERE task_id='t-115'").get() as any).generation;
      const second = store.mutateRun({
        task_id: "t-115",
        expected_generation: first,
        mutation: (r: any) => {
          r.state = "Cancelling";
        },
      });

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(typeof first).toBe("number");
      expect(first).toBe(2);
      expect(afterFirst).toBe(first);
      expect(second).toBe(3);
      expect(store.generation("t-115")).toBe(second);
      expect(store.getRun("t-115").generation).toBe(3);
      // 未声明副作用：除了 generation/state/last_activity_at，其余列原样保留
      const row = store.db.prepare("SELECT * FROM runs WHERE task_id='t-115'").get() as any;
      expect(row.state).toBe("Cancelling");
      expect(row.cancel_requested).toBe(0);
      expect(row.discussion_intake_state).toBe("Disabled");
      expect(row.accepted_at).toBe(store.getRun("t-115").accepted_at);
    } finally {
      store.close();
    }
  });

});
