/**
 * Case ID: UT-REPO-062  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-062.md（脚本的唯一依据）
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

describe("UT-REPO-062 · createOrGet · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("accepts the boundary shape of TaskRequest (empty collections, no optional fields)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 task 的边界等价类——空集合（read_paths/write_paths/output_paths 全空）、
      // 无 input_refs／无 discussion／无 artifact_target
      const empty = task("co-062", {
        permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
        output_paths: [],
      });

      // 步骤 2：调用 createOrGet(...)
      const outcome = store.createOrGet(empty, "slinky", 10);

      // 步骤 3：断言逐值对账——空集合合法，staging 与 delivery 均落到 "none"
      expect(outcome).toEqual({ kind: "created", task_id: "co-062", generation: 1, state: "Queued" });
      const view = store.getRun("co-062");
      expect(view.input_staging).toEqual({ state: "none", fetched: [], failed: [] });
      expect(view.artifact_delivery).toEqual({ state: "none", delivered: [], failed: [] });
      expect(view.discussion_intake_state).toBe("Disabled");
    } finally {
      store.close();
    }
  });

});
