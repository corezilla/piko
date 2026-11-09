/**
 * Case ID: UT-REPO-129  ·  STATUS: real
 *
 * 责任：返回站点 L264 值 `{ task_id: r.task_id, state: r.state, g…` 逐值断言（store.ts）
 * 维度坐标：`getRun` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-129.md（脚本的唯一依据）
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

describe("UT-REPO-129 · getRun · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the full task view for an accepted run", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理的 task
      store.createOrGet(task("gr-129"), "slinky", 10);

      // 步骤 2：调用 getRun("gr-129")
      const view = store.getRun("gr-129");

      // 步骤 3：断言逐值对账——视图字段与 run 行一致
      expect(view.task_id).toBe("gr-129");
      expect(view.state).toBe("Queued");
      expect(view.generation).toBe(1);
      expect(typeof view.accepted_at).toBe("string");
      expect(view.started_at).toBeNull();
      expect(view.finished_at).toBeNull();
      expect(view.result_available).toBe(false);
      expect(view.cancel_requested).toBe(false);
      expect(view.discussion_intake_state).toBe("Disabled");
      expect(view.input_staging).toEqual({ state: "none", fetched: [], failed: [] });
      expect(view.artifact_delivery).toEqual({ state: "none", delivered: [], failed: [] });
      expect(view.progress.model_calls).toBe(0);
      expect(view.progress.tool_calls).toBe(0);
      expect(view.progress.usage_so_far).toEqual({
        input_tokens: null,
        output_tokens: null,
        total_tokens: null,
      });
      expect(view.progress.current_action).toBeNull();
    } finally {
      store.close();
    }
  });

});
