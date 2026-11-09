/**
 * Case ID: UT-REPO-570  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:711）
 * 维度坐标：`knownActions` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-570.md（脚本的唯一依据）
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

describe("UT-REPO-570 · knownActions · 字符串/路径/枚举输入 × 空", () => {
  it("returns an empty list for an empty taskId", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 taskId——''（空串）；其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 knownActions
            const actions = store.knownActions("");
      // 步骤 3：断言——实现的真实语义：knownActions 对未知 taskId 返回空数组，
            // 不抛 typed 错（store.ts:711 无显式校验语句）
            expect(Array.isArray(actions)).toBe(true);
            expect(actions).toEqual([]);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
