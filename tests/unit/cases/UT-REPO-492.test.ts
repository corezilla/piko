/**
 * Case ID: UT-REPO-492  ·  STATUS: real
 *
 * 责任：状态写 L609 → `db`（store.ts）
 * 维度坐标：`prepareMatrixSend` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-492.md（脚本的唯一依据）
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

describe("UT-REPO-492 · prepareMatrixSend · 持久化/序列化 × round-trip", () => {
  it("inserts the matrix_sends row as Pending", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:609 对 `db` 的写被执行的前置状态——一条已受理的任务
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend("tx-1", "t1", 7, "sha-1");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(out).toEqual({ state: "Pending" });
            expect(row.txn_id).toBe("tx-1");
            expect(row.task_id).toBe("t1");
            expect(row.turn_seq).toBe(7);
            expect(row.payload_sha256).toBe("sha-1");
            expect(row.event_id).toBeNull();
            expect(row.state).toBe("Pending");
    } finally {
      store.close();
    }
  });

});
