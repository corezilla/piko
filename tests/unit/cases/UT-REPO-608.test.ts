/**
 * Case ID: UT-REPO-608  ·  STATUS: real
 *
 * 责任：分支 L767 `!this.db.prepare("SELECT 1 FROM results WHERE…`（!；store.ts）
 * 维度坐标：`finish` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-608.md（脚本的唯一依据）
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

describe("UT-REPO-608 · finish · 状态分支 × 合法迁移", () => {

  it("skips the insert when the result generation is already published", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:767 的分支（!）取真的输入——results 里已有同 generation 的行
      accept(store, task("t-608"));
      const grant = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
      store.publishResult(result("t-608"), grant.lease_epoch);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);

      // 步骤 2：调用 finish(…) 并断言该侧可观测结果
      store.finish(result("t-608"), grant.lease_epoch);

      // 步骤 3：断言取真侧——不再插入第二条，results 仍是一行；run 落终态、槽位释放
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT generation FROM results WHERE task_id='t-608'").get() as any).generation).toBe(1);
      expect(store.getRun("t-608").state).toBe("Completed");
      expect(store.readSlot().task_id).toBeNull();

      // 步骤 4：断言取假侧——未发布过结果时 finish 自己插入那一行
      accept(store, task("t-608-b"));
      const second = store.tryClaimSlot("owner", "boot") as { task_id: string; lease_epoch: number };
      store.finish(result("t-608-b"), second.lease_epoch);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(2);
      expect((store.db.prepare("SELECT generation FROM results WHERE task_id='t-608-b'").get() as any).generation).toBe(1);
    } finally {
      store.close();
    }
  });

});
