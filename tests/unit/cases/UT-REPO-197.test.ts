/**
 * Case ID: UT-REPO-197  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:406）
 * 维度坐标：`renewSlot` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-197.md（脚本的唯一依据）
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

describe("UT-REPO-197 · renewSlot · 字符串/路径/枚举输入 × 空", () => {
  it("treats an empty task id as plain text and refuses to renew", async () => {
    const store = newStore();
    try {
      accept(store, task("t-197"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };
      store.db.prepare("UPDATE execution_slot SET heartbeat_at='2000-01-01T00:00:00.000Z'").run();

      // 步骤 1：按 `空` 类构造参数 taskId——''（空串）、undefined（缺省）、null（显式空值）三态；
      //         其余参数取合法等价类（epoch 取当前租约 epoch）
      // 步骤 2：调用 renewSlot(…)
      const emptyStr = store.renewSlot("", grant.lease_epoch);
      const explicitNull = store.renewSlot(null as never, grant.lease_epoch);
      let undefinedErr: any = null;
      try {
        store.renewSlot(undefined as never, grant.lease_epoch);
      } catch (e) {
        undefinedErr = e;
      }

      // 步骤 3：断言——实现无校验语句，也不抛 typed 错误：空串与 null 只是不匹配的 CAS 键
      //         （返回 false、心跳不刷新）；undefined 被 SQLite 绑定层拒绝，抛的是 TypeError
      //         而不是 PikoError
      expect(emptyStr).toBe(false);
      expect(explicitNull).toBe(false);
      expect(undefinedErr).not.toBeNull();
      expect(undefinedErr?.constructor?.name).toBe("TypeError");
      expect(undefinedErr?.code).toBe("ERR_INVALID_ARG_TYPE");
      expect(undefinedErr?.constructor?.name).not.toBe("PikoError");
      // 无状态写残留：心跳未被刷新，执行位仍由原任务持有
      expect(store.readSlot().heartbeat_at).toBe("2000-01-01T00:00:00.000Z");
      expect(store.readSlot().task_id).toBe("t-197");
    } finally {
      store.close();
    }
  });

});
