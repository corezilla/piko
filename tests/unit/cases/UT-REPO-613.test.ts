/**
 * Case ID: UT-REPO-613  ·  STATUS: real
 *
 * 责任：状态写 L773 → `db`（store.ts）
 * 维度坐标：`finish` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-613.md（脚本的唯一依据）
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

describe("UT-REPO-613 · finish · 持久化/序列化 × round-trip", () => {
  it("releases the execution slot after the terminal state write", async () => {
    const store = newStore();
    try {
      accept(store, task("t-613"));
      const grant = store.tryClaimSlot("owner-613", "boot-613") as { lease_epoch: number };

      // 步骤 1：构造使 store.ts:773 对 `db` 的写被执行的前置状态——
      //         槽被该任务持有，run 处于 Running
      const before = store.readSlot();
      expect(before.task_id).toBe("t-613");
      expect(before.owner_id).toBe("owner-613");
      expect(before.boot_id).toBe("boot-613");
      expect(before.lease_epoch).toBe(grant.lease_epoch);
      expect(before.heartbeat_at).not.toBeNull();

      // 步骤 2：调用 finish(…)
      store.finish(result("t-613"), grant.lease_epoch);

      // 步骤 3：读回权威事实源逐值对账写入语义
      const after = store.readSlot();
      expect(after.task_id).toBeNull();
      expect(after.owner_id).toBeNull();
      expect(after.boot_id).toBeNull();
      expect(after.heartbeat_at).toBeNull();
      // lease_epoch 不被这次写改动（只有槽的持有者字段被清空）
      expect(after.lease_epoch).toBe(grant.lease_epoch);
      // 终态写入同时发生
      expect((store.db.prepare("SELECT state,finished_at FROM runs WHERE task_id='t-613'").get() as any).state).toBe("Completed");
    } finally {
      store.close();
    }
  });

});
