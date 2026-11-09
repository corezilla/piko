/**
 * Case ID: UT-REPO-594  ·  STATUS: real
 *
 * 责任：throw L748 `LeaseLost`（守卫 `if (slot.task_id !== result.task_id || …`；store.ts）
 * 维度坐标：`publishResult` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-594.md（脚本的唯一依据）
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

describe("UT-REPO-594 · publishResult · 错误路径 × 每个 typed 错误码", () => {

  it("raises the typed LeaseLost error and writes nothing", async () => {
    const store = newStore();
    try {
      accept(store, task("t-594"));
      const grant = store.tryClaimSlot("worker", "boot") as { task_id: string; lease_epoch: number };

      // 步骤 1：构造触发 store.ts:748 处 throw 的输入——② `slot.lease_epoch` ≠ `epoch`
      // 步骤 2：调用 publishResult(…)
      let err: any = null;
      try {
        store.publishResult(result("t-594"), grant.lease_epoch + 1);
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别，且无部分写入（结果行、纪元都没有动）
      expect(err?.constructor?.name).toBe("PikoError");
      expect(err?.code).toBe("LeaseLost");
      expect(err?.status).toBe(409);
      expect(err?.message).toBe("execution lease was lost");
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 0 });
      expect(store.generation("t-594")).toBe(1);

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——code 原样是 LeaseLost
      expect(err?.code).not.toBe("InternalError");
    } finally {
      store.close();
    }
  });

});
