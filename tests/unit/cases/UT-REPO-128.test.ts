/**
 * Case ID: UT-REPO-128  ·  STATUS: real
 *
 * 责任：throw L260 `NotFound`（守卫 `if (!r)`；store.ts）
 * 维度坐标：`getRun` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-128.md（脚本的唯一依据）
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

describe("UT-REPO-128 · getRun · 错误路径 × 每个 typed 错误码", () => {

  it("throws NotFound for a task that was never accepted", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造完全不存在的 task_id
      // 步骤 2：调用 getRun("gr-128-absent")
      let err: any = null;
      try {
        store.getRun("gr-128-absent");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——typed 错误 NotFound / HTTP 404 / 指定消息
      expect((err as any).code).toBe("NotFound");
      expect((err as any).status).toBe(404);
      expect((err as any).message).toBe("task not found");
    } finally {
      store.close();
    }
  });

});
