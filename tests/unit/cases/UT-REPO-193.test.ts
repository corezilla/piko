/**
 * Case ID: UT-REPO-193  ·  STATUS: real
 *
 * 责任：返回站点 L388 值 `null` 逐值断言（store.ts）
 * 维度坐标：`recoverOrphaned` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-193.md（脚本的唯一依据）
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

describe("UT-REPO-193 · recoverOrphaned · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns null from the free-slot return site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造执行位空闲的前置状态
      expect(store.readSlot().task_id).toBeNull();

      // 步骤 2：调用 recoverOrphaned("owner", "boot")
      const grant = store.recoverOrphaned("owner", "boot");

      // 步骤 3：断言逐值对账——该返回站点返回 null 而非 SlotGrant
      expect(grant).toBeNull();
      expect(grant).not.toBeUndefined();
    } finally {
      store.close();
    }
  });

});
