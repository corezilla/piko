/**
 * Case ID: UT-REPO-075  ·  STATUS: real
 *
 * 责任：分支 L187 `if (old.identity_state === "Tombstone")`（if；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-075.md（脚本的唯一依据）
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

describe("UT-REPO-075 · createOrGet · 状态分支 × 合法迁移", () => {

  it("returns tombstone for a purged task identity", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:187 的 if (old.identity_state === "Tombstone") 取真的输入
      store.createOrGet(task("co-075"), "slinky", 10);
      store.purge({ task_id: "co-075" });

      // 步骤 2：调用 createOrGet(同 task_id)
      const outcome = store.createOrGet(task("co-075"), "slinky", 10);

      // 步骤 3：断言逐值对账——tombstone 优先于内容比较，且不再受理
      expect(outcome).toEqual({ kind: "tombstone" });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 0 });
      expect(
        (store.db.prepare("SELECT identity_state FROM tasks WHERE task_id=?").get("co-075") as any)
          .identity_state,
      ).toBe("Tombstone");
    } finally {
      store.close();
    }
  });

});
