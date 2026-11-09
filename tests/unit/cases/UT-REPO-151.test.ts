/**
 * Case ID: UT-REPO-151  ·  STATUS: real
 *
 * 责任：参数 `owner: string` 的 `超长` 类（store.ts:304）
 * 维度坐标：`tryClaimSlot` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-151.md（脚本的唯一依据）
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

describe("UT-REPO-151 · tryClaimSlot · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long owner string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 owner——长度 2×上限 = 8192；其余参数取合法等价类
      accept(store, task("t1"));
      const longOwner = "o".repeat(8192);
      // 步骤 2：调用 tryClaimSlot
            const grant = store.tryClaimSlot(longOwner, "boot-1");
            const slot = store.readSlot();
      // 步骤 3：断言——owner 不做长度校验，原样落库
            expect(grant).toEqual({ task_id: "t1", lease_epoch: 1 });
            expect(slot.owner_id).toBe(longOwner);
            expect(slot.owner_id?.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
