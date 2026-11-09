/**
 * Case ID: UT-REPO-158  ·  STATUS: real
 *
 * 责任：分支 L315 `!r`（!；store.ts）
 * 维度坐标：`tryClaimSlot` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-158.md（脚本的唯一依据）
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

describe("UT-REPO-158 · tryClaimSlot · 状态分支 × 合法迁移", () => {
  it("negates the candidate-run check exactly (r present → not busy)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:315 的分支（!：`!r`）取真的输入——令 r 为假（无候选 run）
      accept(store, task("p1", { input_refs: [{ source: "x" }] }));
      // 步骤 2：调用 tryClaimSlot 并断言该侧可观测结果
            const busy = store.tryClaimSlot("owner-1", "boot-1");
            // 步骤 3：构造使该分支取假的输入（令 r 为真：候选 run 存在）
            store.setInputStaging("p1", { state: "ready", fetched: [], failed: [] });
            const claimed = store.tryClaimSlot("owner-2", "boot-2");
            const slot = store.readSlot();
      // 步骤 3：断言——r 为假时 !r 取真 → "slot_busy"；r 为真时 !r 取假 → 越过守卫认领
            expect(busy).toBe("slot_busy");
            expect(claimed).toEqual({ task_id: "p1", lease_epoch: 1 });
            expect(slot.task_id).toBe("p1");
            expect(slot.lease_epoch).toBe(1);
    } finally {
      store.close();
    }
  });

});
