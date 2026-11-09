/**
 * Case ID: UT-REPO-194  ·  STATUS: real
 *
 * 责任：返回站点 L392 值 `null` 逐值断言（store.ts）
 * 维度坐标：`recoverOrphaned` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-194.md（脚本的唯一依据）
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

describe("UT-REPO-194 · recoverOrphaned · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns null from the orphaned-or-terminal return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 slot 指向已终态 run 的前置状态
      store.createOrGet(task("ro-194"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");
      store.db.prepare("UPDATE runs SET state='Completed' WHERE task_id=?").run("ro-194");

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      const grant = store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——该返回站点同样返回 null 而非 SlotGrant
      expect(grant).toBeNull();
      expect(store.readSlot().task_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
