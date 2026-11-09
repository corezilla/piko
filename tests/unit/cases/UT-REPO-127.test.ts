/**
 * Case ID: UT-REPO-127  ·  STATUS: real
 *
 * 责任：throw L259 `Gone`（守卫 `if (t?.identity_state === "Tombstone")`；store.ts）
 * 维度坐标：`getRun` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-127.md（脚本的唯一依据）
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

describe("UT-REPO-127 · getRun · 错误路径 × 每个 typed 错误码", () => {

  it("throws Gone for a purged task identity", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 identity_state='Tombstone' 的 task
      store.createOrGet(task("gr-127"), "slinky", 10);
      store.purge({ task_id: "gr-127" });

      // 步骤 2：调用 getRun("gr-127")
      let err: any = null;
      try {
        store.getRun("gr-127");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——typed 错误 Gone / HTTP 410 / 指定消息
      expect((err as any).code).toBe("Gone");
      expect((err as any).status).toBe(410);
      expect((err as any).message).toBe("task identity was purged");
    } finally {
      store.close();
    }
  });

});
