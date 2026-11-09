/**
 * Case ID: UT-REPO-182  ·  STATUS: real
 *
 * 责任：参数 `boot: string` 的 `超长` 类（store.ts:385）
 * 维度坐标：`recoverOrphaned` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-182.md（脚本的唯一依据）
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

describe("UT-REPO-182 · recoverOrphaned · 字符串/路径/枚举输入 × 超长", () => {

  it("recovers with an over-long boot id stored verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 boot 的超长类——长度 2×4096＝8192
      const long = "b".repeat(8192);
      store.createOrGet(task("ro-182"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");

      // 步骤 2：调用 recoverOrphaned("owner", long)
      const grant = store.recoverOrphaned("owner", long);

      // 步骤 3：断言逐值对账——实现对 boot 无长度上限，超长串原样落库
      expect(grant).toEqual({ task_id: "ro-182", lease_epoch: 2 });
      expect(store.readSlot().boot_id).toBe(long);
      expect(store.readSlot().boot_id!.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
