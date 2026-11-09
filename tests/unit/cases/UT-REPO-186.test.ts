/**
 * Case ID: UT-REPO-186  ·  STATUS: real
 *
 * 责任：分支 L390 `if (!run || isTerminal(run.state))`（if；store.ts）
 * 维度坐标：`recoverOrphaned` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-186.md（脚本的唯一依据）
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

describe("UT-REPO-186 · recoverOrphaned · 状态分支 × 合法迁移", () => {

  it("releases the slot and returns null for a terminal run", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 store.ts:390 的 if (!run || isTerminal(run.state)) 取真的输入——
      // slot 仍指向一个已终态的 run
      store.createOrGet(task("ro-186"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");
      store.db.prepare("UPDATE runs SET state='Completed' WHERE task_id=?").run("ro-186");

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      const grant = store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——终态 run 释放 slot 并返回 null
      expect(grant).toBeNull();
      expect(store.readSlot().task_id).toBeNull();
      expect(store.readSlot().owner_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
