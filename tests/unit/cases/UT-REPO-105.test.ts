/**
 * Case ID: UT-REPO-105  ·  STATUS: real
 *
 * 责任：分支 L237 `!command.expected_state_in.includes(r.state)`（!；store.ts）
 * 维度坐标：`mutateRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-105.md（脚本的唯一依据）
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

describe("UT-REPO-105 · mutateRun · 状态分支 × 合法迁移", () => {

  it("throws FencedWrite when the state is not in expected_state_in and succeeds otherwise", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:237 的分支取真的输入——expected_state_in 不含当前状态 'Queued'
      accept(store, task("t1"));

      // 步骤 2：调用 mutateRun(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致
      let err: any = null;
      try {
        store.mutateRun({ task_id: "t1", expected_generation: 1, expected_state_in: ["Running"], mutation: () => {} });
      } catch (e) {
        err = e;
      }
      expect(err).not.toBeNull();
      expect(err.code).toBe("FencedWrite");
      expect(err.status).toBe(409);
      expect(store.generation("t1")).toBe(1);

      // 步骤 3：构造使该分支取假的输入——expected_state_in 含当前状态 'Queued'（无显式 else：取假即跳过该块，断言块内副作用不发生）
      // 步骤 4：再次调用 mutateRun(…) 并断言取假侧结果；两侧都必须被观测到
      const gen = store.mutateRun({
        task_id: "t1",
        expected_generation: 1,
        expected_state_in: ["Queued", "Running"],
        mutation: (r: any) => {
          r.state = "Running";
        },
      });
      expect(gen).toBe(2);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t1'").get() as any).state).toBe("Running");
    } finally {
      store.close();
    }
  });

});
