/**
 * Case ID: UT-REPO-620  ·  STATUS: real
 *
 * 责任：分支 L785 `!this.db.prepare("SELECT 1 FROM results WHERE…`（!；store.ts）
 * 维度坐标：`finishQueued` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-620.md（脚本的唯一依据）
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

describe("UT-REPO-620 · finishQueued · 状态分支 × 合法迁移", () => {

  it("skips the insert when the result generation is already stored", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:785 的分支（!）取真的输入——results 里已有同 generation 的行
      accept(store, task("t-620"));
      store.tryClaimSlot("owner", "boot");
      store.publishResult(result("t-620"), 1);
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);

      // 步骤 2：调用 finishQueued(…) 并断言该侧可观测结果
      store.finishQueued(result("t-620"));

      // 步骤 3：断言取真侧——不再插入第二条，results 仍是一行；run 落终态
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT generation FROM results WHERE task_id='t-620'").get() as any).generation).toBe(1);
      expect(store.getRun("t-620").state).toBe("Completed");

      // 步骤 4：断言取假侧——没有已存结果时 finishQueued 自己插入那一行
      accept(store, task("t-620-b"));
      store.finishQueued(result("t-620-b"));
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(2);
      expect((store.db.prepare("SELECT generation FROM results WHERE task_id='t-620-b'").get() as any).generation).toBe(1);
    } finally {
      store.close();
    }
  });

});
