/**
 * Case ID: UT-REPO-144  ·  STATUS: real
 *
 * 责任：throw L297 `TaskNotFound`（守卫 `if (r.changes === 0)`；store.ts）
 * 维度坐标：`setArtifactDelivery` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-144.md（脚本的唯一依据）
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

describe("UT-REPO-144 · setArtifactDelivery · 错误路径 × 每个 typed 错误码", () => {

  it("throws TaskNotFound when no run row matches the task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造未知 task_id（r.changes ＝ 0 的前置状态）
      // 步骤 2：调用 setArtifactDelivery("sad-144-absent", delivery)
      let err: any = null;
      try {
        store.setArtifactDelivery("sad-144-absent", { state: "none", delivered: [], failed: [] });
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——typed TaskNotFound / 404 / 消息含 taskId
      expect((err as any).code).toBe("TaskNotFound");
      expect((err as any).status).toBe(404);
      expect((err as any).message).toBe("delivery reported for unknown task sad-144-absent");
    } finally {
      store.close();
    }
  });

});
