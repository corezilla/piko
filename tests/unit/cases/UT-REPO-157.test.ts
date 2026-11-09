/**
 * Case ID: UT-REPO-157  ·  STATUS: real
 *
 * 责任：分支 L315 `if (!r)`（if；store.ts）
 * 维度坐标：`tryClaimSlot` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-157.md（脚本的唯一依据）
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

describe("UT-REPO-157 · tryClaimSlot · 状态分支 × 合法迁移", () => {
  it("returns slot_busy when no claimable run exists", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:315 的分支（if：`if (!r)`）取真的输入——没有任何可认领的 run
      accept(store, task("p1", { input_refs: [{ source: "x" }] }));
      // 步骤 2：调用 tryClaimSlot 并断言该侧可观测结果
            const busy = store.tryClaimSlot("owner-1", "boot-1");
            const slot = store.readSlot();
            // 步骤 3：构造使该分支取假的输入（把 staging 推进到 ready 后 run 可被认领）
            store.setInputStaging("p1", { state: "ready", fetched: [], failed: [] });
            const claimed = store.tryClaimSlot("owner-2", "boot-2");
      // 步骤 3：断言——取真侧返回 "slot_busy" 且不写槽位；取假侧越过守卫完成认领
            expect(busy).toBe("slot_busy");
            expect(slot.task_id).toBeNull();
            expect(slot.lease_epoch).toBe(0);
            expect(claimed).toEqual({ task_id: "p1", lease_epoch: 1 });
    } finally {
      store.close();
    }
  });

});
