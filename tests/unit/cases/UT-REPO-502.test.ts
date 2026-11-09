/**
 * Case ID: UT-REPO-502  ·  STATUS: real
 *
 * 责任：状态写 L614 → `db`（store.ts）
 * 维度坐标：`finishMatrixSend` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-502.md（脚本的唯一依据）
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

describe("UT-REPO-502 · finishMatrixSend · 持久化/序列化 × round-trip", () => {
  it("writes state='Sent' and the event id onto the row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:614 对 `db` 的写被执行的前置状态——一条 Pending 的事务
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      const before = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 2：调用 finishMatrixSend
            store.finishMatrixSend("tx-1", "event-1");
            const after = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(before.state).toBe("Pending");
            expect(before.event_id).toBeNull();
            expect(after.state).toBe("Sent");
            expect(after.event_id).toBe("event-1");
            expect(after.payload_sha256).toBe("sha-1");
            expect(after.task_id).toBe("t1");
    } finally {
      store.close();
    }
  });

});
