/**
 * Case ID: UT-REPO-112  ·  STATUS: real
 *
 * 责任：throw L243 `LeaseLost`（守卫 `if (slot.task_id !== command.task_id ||…`；store.ts）
 * 维度坐标：`mutateRun` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-112.md（脚本的唯一依据）
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

describe("UT-REPO-112 · mutateRun · 错误路径 × 每个 typed 错误码", () => {

  it("raises the typed LeaseLost error and writes nothing", async () => {
    const store = newStore();
    try {
      accept(store, task("t-112"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };

      // 步骤 1：构造触发 store.ts:243 处 throw 的输入——② `slot.lease_epoch` ≠ `expected_lease_epoch`
      // 步骤 2：调用 mutateRun(…)
      let err: any = null;
      try {
        store.mutateRun({
          task_id: "t-112",
          expected_generation: 1,
          expected_lease_epoch: grant.lease_epoch + 1,
          mutation: (r) => {
            r.state = "Cancelling";
          },
        });
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别，且无部分写入（状态写/持久化均未发生）
      expect(err).toBeInstanceOf(Error);
      expect(err?.constructor?.name).toBe("PikoError");
      expect(err?.code).toBe("LeaseLost");
      expect(err?.status).toBe(409);
      expect(err?.message).toBe("lease moved");
      expect(store.getRun("t-112").generation).toBe(1);
      expect(store.getRun("t-112").state).toBe("Running");
      expect(store.db.prepare("SELECT count(*) n FROM audit_events").get()).toEqual({ n: 0 });

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——code 原样是 LeaseLost
      expect(err?.code).not.toBe("InternalError");
    } finally {
      store.close();
    }
  });

});
