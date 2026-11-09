/**
 * Case ID: UT-REPO-164  ·  STATUS: real
 *
 * 责任：返回站点 L307 值 `"slot_busy"` 逐值断言（store.ts）
 * 维度坐标：`tryClaimSlot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-164.md（脚本的唯一依据）
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

describe("UT-REPO-164 · tryClaimSlot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the literal \"slot_busy\" from the occupied-slot site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:307 的返回站点被到达的输入——槽位已被占用
      accept(store, task("t1"));
      store.tryClaimSlot("owner-1", "boot-1");
      // 步骤 2：调用 tryClaimSlot
            const value = store.tryClaimSlot("owner-2", "boot-2");
      // 步骤 3：断言返回值逐值对账，且无未声明副作用
            expect(value).toBe("slot_busy");
            expect(typeof value).toBe("string");
            expect(store.readSlot().owner_id).toBe("owner-1");
    } finally {
      store.close();
    }
  });

});
