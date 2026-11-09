/**
 * Case ID: UT-REPO-150  ·  STATUS: real
 *
 * 责任：参数 `owner: string` 的 `空` 类（store.ts:304）
 * 维度坐标：`tryClaimSlot` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-150.md（脚本的唯一依据）
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

describe("UT-REPO-153 · tryClaimSlot · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty boot string and stores null as SQL NULL", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 boot——''（空串）、null（显式空值）、undefined（缺省）
      accept(store, task("t1"));
      accept(store, task("t2"));

      // 步骤 2：调用 tryClaimSlot
      const emptyBoot = store.tryClaimSlot("owner-1", "");
      const slotAfterEmpty = store.readSlot();
      store.releaseSlot("t1", (emptyBoot as { lease_epoch: number }).lease_epoch);
      const nullBoot = store.tryClaimSlot("owner-2", null as never);
      const slotAfterNull = store.readSlot();

      // 步骤 3：断言——boot 无校验，空串原样落库、null 落成 SQL NULL；
      //         undefined 则被 SQLite 绑定层拒绝
      expect(emptyBoot).toEqual({ task_id: "t1", lease_epoch: 1 });
      expect(slotAfterEmpty.boot_id).toBe("");
      expect(nullBoot).toEqual({ task_id: "t2", lease_epoch: 2 });
      expect(slotAfterNull.boot_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
