/**
 * Case ID: UT-REPO-509  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:619）
 * 维度坐标：`tryCloseIntake` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-509.md（脚本的唯一依据）
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

describe("UT-REPO-509 · tryCloseIntake · 字符串/路径/枚举输入 × 注入字符", () => {

  it("returns false for an injection-shaped task id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的注入字符类——穿越串、SQL 元字符
      store.createOrGet(discussionTask("tc-509"), "slinky", 10, "hello");

      // 步骤 2：调用 tryCloseIntake(traversal, 1) 与 tryCloseIntake(injection, 1)
      const first = store.tryCloseIntake("../../etc/passwd", 1);
      const second = store.tryCloseIntake("'; UPDATE runs SET discussion_intake_state='Closed';--", 1);

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好且 intake 仍为 Open
      expect(first).toBe(false);
      expect(second).toBe(false);
      expect(store.getRun("tc-509").discussion_intake_state).toBe("Open");
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='runs'").get()).toBeTruthy();
    } finally {
      store.close();
    }
  });

});
