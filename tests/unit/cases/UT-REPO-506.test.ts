/**
 * Case ID: UT-REPO-506  ·  STATUS: real
 *
 * 责任：状态写 L617 → `db`（store.ts）
 * 维度坐标：`unknownMatrixSend` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-506.md（脚本的唯一依据）
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

describe("UT-REPO-506 · unknownMatrixSend · 持久化/序列化 × round-trip", () => {
  it("writes state='Unknown' but never downgrades a Sent transaction", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:617 对 `db` 的写被执行的前置状态——一条 Pending 与一条 Sent 的事务
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-pending", "t1", 1, "sha-1");
      store.prepareMatrixSend("tx-sent", "t1", 2, "sha-2");
      store.finishMatrixSend("tx-sent", "event-2");
      // 步骤 2：调用 unknownMatrixSend
            store.unknownMatrixSend("tx-pending");
            store.unknownMatrixSend("tx-sent");
            const pending = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-pending'").get() as any;
            const sent = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-sent'").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义——WHERE state!='Sent' 保护已发出的事务
            expect(pending.state).toBe("Unknown");
            expect(pending.event_id).toBeNull();
            expect(sent.state).toBe("Sent");
            expect(sent.event_id).toBe("event-2");
    } finally {
      store.close();
    }
  });

});
