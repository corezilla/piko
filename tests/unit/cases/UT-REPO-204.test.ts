/**
 * Case ID: UT-REPO-204  ·  STATUS: real
 *
 * 责任：返回站点 L408 值 `x.changes === 1` 逐值断言（store.ts）
 * 维度坐标：`renewSlot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-204.md（脚本的唯一依据）
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

describe("UT-REPO-204 · renewSlot · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns x.changes === 1 only when task_id and epoch both match", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:408 的返回站点被到达的输入——槽已被持有，epoch 已知
      accept(store, task("t1"));
      const grant = store.tryClaimSlot("owner-1", "boot-1") as { task_id: string; lease_epoch: number };

      // 步骤 2：调用 renewSlot(…)
      const matched = store.renewSlot(grant.task_id, grant.lease_epoch);
      const wrongEpoch = store.renewSlot(grant.task_id, grant.lease_epoch + 1);
      const wrongTask = store.renewSlot("other-task", grant.lease_epoch);

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(matched).toBe(true);
      expect(wrongEpoch).toBe(false);
      expect(wrongTask).toBe(false);
      // 失败的两条不产生副作用：槽仍被原任务持有
      expect(store.readSlot().task_id).toBe("t1");
      expect(store.readSlot().lease_epoch).toBe(grant.lease_epoch);
    } finally {
      store.close();
    }
  });

});
