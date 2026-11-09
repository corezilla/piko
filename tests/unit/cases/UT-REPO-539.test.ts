/**
 * Case ID: UT-REPO-539  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:667）
 * 维度坐标：`cancelRequested` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-539.md（脚本的唯一依据）
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

describe("UT-REPO-539 · cancelRequested · 字符串/路径/枚举输入 × 注入字符", () => {

  it("returns false for an injection-shaped task id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的注入字符类——穿越串、SQL 元字符
      store.createOrGet(task("cr-539"), "slinky", 10);

      // 步骤 2：调用 cancelRequested(traversal) 与 cancelRequested(injection)
      const first = store.cancelRequested("../../etc/passwd");
      const second = store.cancelRequested("'; UPDATE runs SET cancel_requested=1;--");

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好且原 run 未被取消
      expect(first).toBe(false);
      expect(second).toBe(false);
      expect(store.cancelRequested("cr-539")).toBe(false);
      expect(
        (store.db.prepare("SELECT cancel_requested FROM runs WHERE task_id=?").get("cr-539") as any)
          .cancel_requested,
      ).toBe(0);
    } finally {
      store.close();
    }
  });

});
