/**
 * Case ID: UT-REPO-166  ·  STATUS: real
 *
 * 责任：返回站点 L327 值 `{ task_id: r.task_id, lease_epoch: epoc…` 逐值断言（store.ts）
 * 维度坐标：`tryClaimSlot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-166.md（脚本的唯一依据）
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

describe("UT-REPO-166 · tryClaimSlot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the { task_id, lease_epoch } grant object", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:327 的返回站点被到达的输入——有一条可认领的 run
      accept(store, task("t1"));
      // 步骤 2：调用 tryClaimSlot
            const value = store.tryClaimSlot("owner-1", "boot-1");
      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
            expect(value).toEqual({ task_id: "t1", lease_epoch: 1 });
            expect(Object.keys(value as any)).toEqual(["task_id", "lease_epoch"]);
            expect((value as any).lease_epoch).toBe(store.readSlot().lease_epoch);
    } finally {
      store.close();
    }
  });

});
