/**
 * Case ID: UT-REPO-178  ·  STATUS: real
 *
 * 责任：参数 `owner: string` 的 `空` 类（store.ts:385）
 * 维度坐标：`recoverOrphaned` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-178.md（脚本的唯一依据）
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

describe("UT-REPO-178 · recoverOrphaned · 字符串/路径/枚举输入 × 空", () => {

  it("recovers with an empty owner when the slot is free", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 owner 的空类——''（空串）；执行位先被占用
      store.createOrGet(task("ro-178"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");

      // 步骤 2：调用 recoverOrphaned("", "boot")
      const grant = store.recoverOrphaned("", "boot");

      // 步骤 3：断言逐值对账——实现不校验 owner，空串被原样写入 slot
      expect(grant).toEqual({ task_id: "ro-178", lease_epoch: 2 });
      expect(store.readSlot().owner_id).toBe("");
    } finally {
      store.close();
    }
  });

});
