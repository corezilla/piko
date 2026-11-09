/**
 * Case ID: UT-REPO-103  ·  STATUS: real
 *
 * 责任：分支 L237 `if (command.expected_state_in && !command.exp…`（if；store.ts）
 * 维度坐标：`mutateRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-103.md（脚本的唯一依据）
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

describe("UT-REPO-103 · mutateRun · 状态分支 × 合法迁移", () => {
  it("rejects a run outside expected_state_in and accepts the one inside it", async () => {
    const store = newStore();
    try {
      accept(store, task("t-103"));
      expect(store.getRun("t-103").state).toBe("Queued");

      // 步骤 1：构造使 store.ts:237 的分支（if：`command.expected_state_in && !command.expected_state_in.includes(r.state)`）取真的输入
      // 步骤 2：调用 mutateRun(…) 并断言该侧可观测结果
      let takenErr: any = null;
      try {
        store.mutateRun({
          task_id: "t-103",
          expected_generation: 1,
          expected_state_in: ["Running", "Cancelling"],
          mutation: (r: any) => {
            r.state = "Running";
          },
        });
      } catch (e) {
        takenErr = e;
      }
      expect(takenErr?.constructor?.name).toBe("PikoError");
      expect(takenErr?.code).toBe("FencedWrite");
      expect(takenErr?.status).toBe(409);
      expect(takenErr?.message).toBe("state moved");
      // 取真侧没有任何写入（generation 与 state 均未变）
      expect(store.generation("t-103")).toBe(1);
      expect(store.getRun("t-103").state).toBe("Queued");

      // 步骤 3：构造使该分支取假的输入——expected_state_in 含当前状态 Queued（无显式 else：取假即跳过该块）
      // 步骤 4：再次调用 mutateRun(…) 并断言取假侧结果（两侧都被观测到）
      const generation = store.mutateRun({
        task_id: "t-103",
        expected_generation: 1,
        expected_state_in: ["Queued"],
        mutation: (r: any) => {
          r.state = "Running";
        },
      });
      expect(generation).toBe(2);
      expect(store.generation("t-103")).toBe(2);
      expect(store.getRun("t-103").state).toBe("Running");
    } finally {
      store.close();
    }
  });

});
