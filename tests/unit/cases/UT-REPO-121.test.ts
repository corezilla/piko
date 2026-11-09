/**
 * Case ID: UT-REPO-121  ·  STATUS: real
 *
 * 责任：分支 L259 `t?.identity_state`（?.；store.ts）
 * 维度坐标：`getRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-121.md（脚本的唯一依据）
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

describe("UT-REPO-121 · getRun · 状态分支 × 合法迁移", () => {

  it("reads the identity state through the optional chain when a tombstone exists", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 tasks 行存在（identity_state='Tombstone'）但 runs 行已被删的输入
      store.createOrGet(task("gr-121"), "slinky", 10);
      store.purge({ task_id: "gr-121" });
      store.db.exec("PRAGMA foreign_keys=OFF");
      store.db.prepare("INSERT INTO runs(task_id,state,generation,cancel_requested,discussion_intake_state,input_staging_json,artifact_delivery_json,accepted_at) VALUES('gr-121','Queued',1,0,'Disabled','{}','{}','2026-01-01T00:00:00.000Z')").run();
      store.db.prepare("DELETE FROM runs WHERE task_id=?").run("gr-121");

      // 步骤 2：调用 getRun("gr-121")
      let err: any = null;
      try {
        store.getRun("gr-121");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——t?.identity_state 取到 "Tombstone"，抛 Gone(410)
      expect((err as any).code).toBe("Gone");
      expect((err as any).status).toBe(410);
    } finally {
      store.close();
    }
  });

});
