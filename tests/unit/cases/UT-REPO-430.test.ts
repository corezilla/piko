/**
 * Case ID: UT-REPO-430  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `注入字符` 类（store.ts:544）
 * 维度坐标：`hasMatrixEvent` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-430.md（脚本的唯一依据）
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

describe("UT-REPO-430 · hasMatrixEvent · 字符串/路径/枚举输入 × 注入字符", () => {

  it("finds no event for an injection-shaped room id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 room 的注入字符类——穿越串、SQL 元字符
      store.recordMatrixEvent("!room:430", "$evt430", "sender");

      // 步骤 2：调用 hasMatrixEvent(traversal, ...) 与 hasMatrixEvent(injection, ...)
      const first = store.hasMatrixEvent("../../etc/passwd", "$evt430");
      const second = store.hasMatrixEvent("'; DROP TABLE matrix_events;--", "$evt430");

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好且原有事件仍在
      expect(first).toBe(false);
      expect(second).toBe(false);
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='matrix_events'").get()).toBeTruthy();
      expect(store.hasMatrixEvent("!room:430", "$evt430")).toBe(true);
    } finally {
      store.close();
    }
  });

});
