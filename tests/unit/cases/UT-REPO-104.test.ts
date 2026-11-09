/**
 * Case ID: UT-REPO-104  ·  STATUS: real
 *
 * 责任：分支 L237 `command.expected_state_in && !command.expecte…`（&&；store.ts）
 * 维度坐标：`mutateRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-104.md（脚本的唯一依据）
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

describe("UT-REPO-104 · mutateRun · 状态分支 × 合法迁移", () => {

  it("rejects a run whose state is outside expected_state_in and accepts the one inside it", async () => {
    const store = newStore();
    try {
      accept(store, task("t-104"));

      // 步骤 1：构造使 store.ts:237 的分支（&&：`command.expected_state_in && !includes`）取真的输入
      // 步骤 2：调用 mutateRun(…) 并断言该侧可观测结果
      let takenErr: any = null;
      try {
        store.mutateRun({
          task_id: "t-104",
          expected_generation: 1,
          expected_state_in: ["Running"],
          mutation: (r) => {
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
      // 取真侧没有产生任何写入
      expect(store.getRun("t-104").generation).toBe(1);
      expect(store.getRun("t-104").state).toBe("Queued");

      // 步骤 3：构造使该分支取假的输入——expected_state_in 含当前状态 Queued
      // 步骤 4：再次调用 mutateRun(…) 并断言取假侧结果（两侧都被观测到）
      const generation = store.mutateRun({
        task_id: "t-104",
        expected_generation: 1,
        expected_state_in: ["Queued"],
        mutation: (r) => {
          r.state = "Running";
        },
      });
      expect(generation).toBe(2);
      expect(store.getRun("t-104").state).toBe("Running");
      expect(store.getRun("t-104").generation).toBe(2);
    } finally {
      store.close();
    }
  });

});
