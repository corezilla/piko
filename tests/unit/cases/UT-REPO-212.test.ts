/**
 * Case ID: UT-REPO-212  ·  STATUS: real
 *
 * 责任：返回站点 L414 值 `x.changes === 1` 逐值断言（store.ts）
 * 维度坐标：`releaseSlot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-212.md（脚本的唯一依据）
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

describe("UT-REPO-212 · releaseSlot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the boolean x.changes === 1 verdict", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:414 的返回站点被到达的输入——占住槽位
      accept(store, task("t1"));
      store.tryClaimSlot("owner-1", "boot-1");
      // 步骤 2：调用 releaseSlot（匹配 → true；不匹配 → false）
            const matched = store.releaseSlot("t1", 1);
            const unmatched = store.releaseSlot("t1", 1);
            const otherTask = store.releaseSlot("other", 1);
      // 步骤 3：断言返回值逐值对账
            expect(matched).toBe(true);
            expect(unmatched).toBe(false);
            expect(otherTask).toBe(false);
            expect(typeof matched).toBe("boolean");
    } finally {
      store.close();
    }
  });

});
