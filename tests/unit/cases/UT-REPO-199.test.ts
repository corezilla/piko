/**
 * Case ID: UT-REPO-199  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:406）
 * 维度坐标：`renewSlot` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-199.md（脚本的唯一依据）
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

describe("UT-REPO-199 · renewSlot · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injected task id as plain text and refuses to renew", async () => {
    const store = newStore();
    try {
      accept(store, task("t-199"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };
      store.db.prepare("UPDATE execution_slot SET heartbeat_at='2000-01-01T00:00:00.000Z'").run();

      // 步骤 1：按 `注入字符` 类构造参数 taskId——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 renewSlot(…)
      const renewed = store.renewSlot("t-199'; DROP TABLE runs;--", grant.lease_epoch);

      // 步骤 3：断言——实现无校验语句，但参数被绑定层当作普通文本：CAS 不命中返回 false，
      //         心跳未变，且注入串没有破坏任何表
      expect(renewed).toBe(false);
      expect(store.readSlot().heartbeat_at).toBe("2000-01-01T00:00:00.000Z");
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 1 });
      expect(store.db.prepare("SELECT task_id FROM execution_slot").get()).toEqual({ task_id: "t-199" });
    } finally {
      store.close();
    }
  });

});
