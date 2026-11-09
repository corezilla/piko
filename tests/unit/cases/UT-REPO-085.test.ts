/**
 * Case ID: UT-REPO-085  ·  STATUS: real
 *
 * 责任：状态写 L203 → `db`（store.ts）
 * 维度坐标：`createOrGet` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-085.md（脚本的唯一依据）
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

describe("UT-REPO-085 · createOrGet · 持久化/序列化 × round-trip", () => {

  it("persists the runs row written at the acceptance site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条合法的 task
      // 步骤 2：调用 createOrGet(...)
      store.createOrGet(task("co-085"), "slinky", 10);

      // 步骤 3：断言逐值对账——runs 行是 Queued / generation=1 / cancel_requested=0
      const row = store.db.prepare("SELECT * FROM runs WHERE task_id=?").get("co-085") as any;
      expect(row.state).toBe("Queued");
      expect(row.generation).toBe(1);
      expect(row.cancel_requested).toBe(0);
      expect(row.discussion_intake_state).toBe("Disabled");
      expect(JSON.parse(row.input_staging_json)).toEqual({ state: "none", fetched: [], failed: [] });
      expect(JSON.parse(row.artifact_delivery_json)).toEqual({ state: "none", delivered: [], failed: [] });
      expect(row.started_at).toBeNull();
      expect(row.finished_at).toBeNull();
    } finally {
      store.close();
    }
  });

});
