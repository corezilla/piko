/**
 * Case ID: UT-REPO-188  ·  STATUS: real
 *
 * 责任：分支 L390 `!run`（!；store.ts）
 * 维度坐标：`recoverOrphaned` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-188.md（脚本的唯一依据）
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

describe("UT-REPO-188 · recoverOrphaned · 状态分支 × 合法迁移", () => {

  it("releases the slot and returns null when the run row is gone", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:390 的 !run 取真的输入——slot 指向一个已无 run 行的 task
      store.createOrGet(task("ro-188"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");
      store.db.exec("PRAGMA foreign_keys=OFF");
      store.db.prepare("DELETE FROM runs WHERE task_id=?").run("ro-188");
      store.db.exec("PRAGMA foreign_keys=ON");

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      const grant = store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——!run 为真，slot 被释放并返回 null
      expect(grant).toBeNull();
      expect(store.readSlot().task_id).toBeNull();
      expect(store.readSlot().lease_epoch).toBe(1);
    } finally {
      store.close();
    }
  });

});
