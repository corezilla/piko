/**
 * Case ID: UT-REPO-159  ·  STATUS: real
 *
 * 责任：状态写 L317 → `db`（store.ts）
 * 维度坐标：`tryClaimSlot` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-159.md（脚本的唯一依据）
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

describe("UT-REPO-159 · tryClaimSlot · 持久化/序列化 × round-trip", () => {
  it("writes the claimed slot row (task/owner/boot/epoch/heartbeat)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:317 对 `db` 的写被执行的前置状态——有一条 Queued 且 staging 为 none 的 run
      accept(store, task("t1"));
      // 步骤 2：调用 tryClaimSlot
            const grant = store.tryClaimSlot("owner-1", "boot-1");
            const row = store.db.prepare("SELECT * FROM execution_slot WHERE slot_id=1").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(grant).toEqual({ task_id: "t1", lease_epoch: 1 });
            expect(row.task_id).toBe("t1");
            expect(row.owner_id).toBe("owner-1");
            expect(row.boot_id).toBe("boot-1");
            expect(row.lease_epoch).toBe(1);
            expect(typeof row.heartbeat_at).toBe("string");
    } finally {
      store.close();
    }
  });

});
