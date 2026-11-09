/**
 * Case ID: UT-REPO-544  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:670）
 * 维度坐标：`generation` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-544.md（脚本的唯一依据）
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

describe("UT-REPO-544 · generation · 字符串/路径/枚举输入 × 空", () => {

  it("raises for an empty task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的空类——''（空串）
      store.createOrGet(task("gn-544"), "slinky", 10);

      // 步骤 2：调用 generation("")
      let err: any = null;
      try {
        store.generation("");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账。
      // 实现对未知 task_id 直接解引用 .generation，抛原生 TypeError 而非 typed 错误
      // （与 getRun 的 NotFound 不同）——故断言真实的原生错误事实。
      expect(err).toBeInstanceOf(TypeError);
      expect(String(err.message)).toContain("generation");
    } finally {
      store.close();
    }
  });

});
