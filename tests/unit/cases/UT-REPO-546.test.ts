/**
 * Case ID: UT-REPO-546  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:670）
 * 维度坐标：`generation` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-546.md（脚本的唯一依据）
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

describe("UT-REPO-546 · generation · 字符串/路径/枚举输入 × 注入字符", () => {

  it("raises for an injection-shaped task id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的注入字符类——穿越串、SQL 元字符
      store.createOrGet(task("gn-546"), "slinky", 10);

      // 步骤 2：调用 generation(traversal) 与 generation(injection)
      let err1: any = null;
      try {
        store.generation("../../etc/passwd");
      } catch (e) {
        err1 = e;
      }
      let err2: any = null;
      try {
        store.generation("'; UPDATE runs SET generation=99;--");
      } catch (e) {
        err2 = e;
      }

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是字面值，表完好且原 generation 未变
      expect(err1).toBeInstanceOf(TypeError);
      expect(err2).toBeInstanceOf(TypeError);
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='runs'").get()).toBeTruthy();
      expect(store.generation("gn-546")).toBe(1);
    } finally {
      store.close();
    }
  });

});
