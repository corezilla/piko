/**
 * Case ID: UT-REPO-640  ·  STATUS: real
 *
 * 责任：分支 L817 `if (identity.identity_state === "Tombstone")`（if；store.ts）
 * 维度坐标：`purge` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-640.md（脚本的唯一依据）
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

describe("UT-REPO-640 · purge · 状态分支 × 合法迁移", () => {
  it("skips a task that is already a Tombstone", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:817 的分支（if：`identity.identity_state === "Tombstone"`）取真的输入
      accept(store, task("t1"));
      store.purge({ task_id: "t1" });
      // 步骤 2：调用 purge 并断言该侧可观测结果
            const out = store.purge({ task_id: "t1" });
            const audits = store.db.prepare("SELECT count(*) n FROM audit_events").get() as any;
            // 步骤 3：构造使该分支取假的输入——身份仍是 Active
            accept(store, task("t2"));
            const active = store.purge({ task_id: "t2" });
      // 步骤 3：断言——取真侧 continue（不再墓碑化、不再写审计）；取假侧正常处理
            expect(out).toEqual({ removed: 0, tombstones: 0 });
            expect(audits.n).toBe(1);
            expect(active).toEqual({ removed: 1, tombstones: 1 });
    } finally {
      store.close();
    }
  });

});
