/**
 * Case ID: UT-REPO-183  ·  STATUS: real
 *
 * 责任：参数 `boot: string` 的 `注入字符` 类（store.ts:385）
 * 维度坐标：`recoverOrphaned` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-183.md（脚本的唯一依据）
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

describe("UT-REPO-183 · recoverOrphaned · 字符串/路径/枚举输入 × 注入字符", () => {

  it("recovers with an injection-shaped boot id stored verbatim without SQL injection", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 boot 的注入字符类——穿越串、SQL 元字符
      const traversal = "../../etc/passwd";
      const injection = "'; UPDATE execution_slot SET task_id=NULL;--";
      store.createOrGet(task("ro-183"), "slinky", 10);
      store.tryClaimSlot("owner", "boot");

      // 步骤 2：调用 recoverOrphaned("owner", traversal) 与 recoverOrphaned("owner", injection)
      const first = store.recoverOrphaned("owner", traversal);
      const second = store.recoverOrphaned("owner", injection);

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，slot 未被清空
      expect(first).toEqual({ task_id: "ro-183", lease_epoch: 2 });
      expect(second).toEqual({ task_id: "ro-183", lease_epoch: 3 });
      expect(store.readSlot().boot_id).toBe(injection);
      expect(store.readSlot().task_id).toBe("ro-183");
    } finally {
      store.close();
    }
  });

});
