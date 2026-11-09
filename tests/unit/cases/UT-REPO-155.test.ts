/**
 * Case ID: UT-REPO-155  ·  STATUS: real
 *
 * 责任：参数 `boot: string` 的 `注入字符` 类（store.ts:304）
 * 维度坐标：`tryClaimSlot` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-155.md（脚本的唯一依据）
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

describe("UT-REPO-155 · tryClaimSlot · 字符串/路径/枚举输入 × 注入字符", () => {
  it("stores an injection-shaped boot string verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 boot——SQL 注入串、路径穿越串、控制字符串
      accept(store, task("t1"));
      const boot = "'; DROP TABLE runs;--";
      // 步骤 2：调用 tryClaimSlot
            const grant = store.tryClaimSlot("owner-1", boot);
            const slot = store.readSlot();
      // 步骤 3：断言——参数化绑定：注入串只作为 boot_id 字面量
            expect(grant).toEqual({ task_id: "t1", lease_epoch: 1 });
            expect(slot.boot_id).toBe(boot);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
