/**
 * Case ID: UT-REPO-187  ·  STATUS: real
 *
 * 责任：分支 L390 `!run || isTerminal(run.state)`（||；store.ts）
 * 维度坐标：`recoverOrphaned` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-187.md（脚本的唯一依据）
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

describe("UT-REPO-187 · recoverOrphaned · 状态分支 × 合法迁移", () => {

  it("takes the || disjunct on the terminal-state side", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot.task_id 指向一个 Cancelled（终态）的 run
      store.createOrGet(task("ro-187"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");
      store.db.prepare("UPDATE runs SET state='Cancelled' WHERE task_id=?").run("ro-187");

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      const grant = store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——|| 的右肢 isTerminal 为真，slot 被清空并返回 null
      expect(grant).toBeNull();
      expect(store.readSlot().task_id).toBeNull();
      expect(store.readSlot().heartbeat_at).toBeNull();
    } finally {
      store.close();
    }
  });

});
