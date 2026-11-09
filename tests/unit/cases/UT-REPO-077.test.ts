/**
 * Case ID: UT-REPO-077  ·  STATUS: real
 *
 * 责任：分支 L188 `!sameTask(JSON.parse(old.task_json), task)`（!；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-077.md（脚本的唯一依据）
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

describe("UT-REPO-077 · createOrGet · 状态分支 × 合法迁移", () => {

  it("negates sameTask on an output_paths difference and returns conflict", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:188 的 !sameTask(...) 取真的另一条路径——同 ID 但 output_paths 不同
      store.createOrGet(task("co-077", { output_paths: ["/out/a"] }), "slinky", 10);

      // 步骤 2：调用 createOrGet(同 task_id，output_paths 不同)
      const outcome = store.createOrGet(task("co-077", { output_paths: ["/out/b"] }), "slinky", 10);

      // 步骤 3：断言逐值对账——!sameTask 为真，走 conflict 分支
      expect(outcome).toEqual({ kind: "conflict" });
      expect(
        JSON.parse((store.db.prepare("SELECT task_json FROM tasks WHERE task_id=?").get("co-077") as any).task_json)
          .output_paths,
      ).toEqual(["/out/a"]);
    } finally {
      store.close();
    }
  });

});
