/**
 * Case ID: UT-REPO-609  ·  STATUS: real
 *
 * 责任：throw L758 `LeaseLost`（守卫 `if (slot.task_id !== result.task_id || …`；store.ts）
 * 维度坐标：`finish` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-609.md（脚本的唯一依据）
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

describe("UT-REPO-609 · finish · 错误路径 × 每个 typed 错误码", () => {
  it("throws LeaseLost with a discriminable message and leaves no partial write", async () => {
    const store = newStore();
    try {
      accept(store, task("t-609"));
      const grant = store.tryClaimSlot("owner-609", "boot-609") as { lease_epoch: number };

      // 步骤 1：构造触发 store.ts:758 处 throw 的输入——① slot.task_id ≠ result.task_id，
      //         或 ② slot.lease_epoch ≠ epoch
      // 步骤 2：调用 finish(…)
      let wrongTask: any = null;
      try {
        store.finish(result("not_result.task_id"), grant.lease_epoch);
      } catch (e) {
        wrongTask = e;
      }
      let wrongEpoch: any = null;
      try {
        store.finish(result("t-609"), grant.lease_epoch + 5);
      } catch (e) {
        wrongEpoch = e;
      }

      // 步骤 3：断言消息可判别、含建议动作，且无部分写入（状态写/资源/持久化均未发生）
      expect(wrongTask?.code).toBe("LeaseLost");
      expect(wrongTask?.status).toBe(409);
      expect(wrongTask?.message).toBe("execution lease was lost");
      expect(wrongEpoch?.code).toBe("LeaseLost");
      expect(wrongEpoch?.status).toBe(409);
      expect(wrongEpoch?.message).toBe("execution lease was lost");
      // 无部分写入：结果行不存在、run 未终态化、槽未被释放
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT state,finished_at FROM runs WHERE task_id='t-609'").get() as any)).toEqual({
        state: "Running",
        finished_at: null,
      });
      expect(store.readSlot().task_id).toBe("t-609");

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——对外错误码就是 ISD 的 LeaseLost/409，
      //         没有被包成 500 或别的码
      expect(wrongTask?.code).toBe("LeaseLost");
      expect(wrongTask?.status).toBe(409);
      expect(wrongTask?.constructor?.name).toBe("PikoError");
    } finally {
      store.close();
    }
  });

});
