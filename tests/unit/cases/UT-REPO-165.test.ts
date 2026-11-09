/**
 * Case ID: UT-REPO-165  ·  STATUS: real
 *
 * 责任：返回站点 L315 值 `"slot_busy"` 逐值断言（store.ts）
 * 维度坐标：`tryClaimSlot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-165.md（脚本的唯一依据）
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

describe("UT-REPO-165 · tryClaimSlot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the literal \"slot_busy\" from the no-candidate-run site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:315 的返回站点被到达的输入——没有可认领的 run
      accept(store, task("p1", { input_refs: [{ source: "x" }] }));
      // 步骤 2：调用 tryClaimSlot
            const value = store.tryClaimSlot("owner-1", "boot-1");
      // 步骤 3：断言返回值逐值对账，且无未声明副作用
            expect(value).toBe("slot_busy");
            expect(store.readSlot().task_id).toBeNull();
            expect((store.db.prepare("SELECT state FROM runs WHERE task_id='p1'").get() as any).state).toBe("Queued");
    } finally {
      store.close();
    }
  });

});
