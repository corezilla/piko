/**
 * Case ID: UT-REPO-276  ·  STATUS: real
 *
 * 责任：可选参数 `unknown` 缺省/显式两态（store.ts:449）
 * 维度坐标：`terminalModel` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-276.md（脚本的唯一依据）
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

describe("UT-REPO-276 · terminalModel · 纯函数/无副作用 × 未知枚举", () => {
  it("treats the omitted and explicit-default unknown flags alike", async () => {
    const store = newStore();
    try {
      accept(store, task("t-276"));

      // 步骤 1：对可选参数 unknown 构造三态——缺省（不传）、显式传默认值 false、未知枚举值；
      //         三组输入各用一条独立的已预留 attempt
      store.reserveModel("t-276", "op", "step-omit", 1);
      store.reserveModel("t-276", "op", "step-false", 2);
      store.reserveModel("t-276", "op", "step-weird", 3);
      store.reserveModel("t-276", "op", "step-true", 4);

      // 步骤 2：分别调用 terminalModel(…)
      const omitted = store.terminalModel("t-276", "op", "step-omit", 1);
      const explicitDefault = store.terminalModel("t-276", "op", "step-false", 2, false);
      const unknownEnum = store.terminalModel("t-276", "op", "step-weird", 3, "not-a-boolean" as never);
      const truthy = store.terminalModel("t-276", "op", "step-true", 4, true);

      // 步骤 3：断言——实现的真实语义：unknown 的声明类型是 boolean，但实现只做真值判断
      //         （`unknown ? "Unknown" : "Terminal"`），所以任意真值都走 Unknown 分支、
      //         任意假值都走 Terminal 分支；缺省态与显式默认值同构。
      //         未知枚举值不被 typed 化拒绝——它只是被当成真值。
      expect(omitted).toBeUndefined();
      expect(explicitDefault).toBeUndefined();
      expect(unknownEnum).toBeUndefined();
      expect(truthy).toBeUndefined();
      const rows = store.db
        .prepare("SELECT step_id, state FROM model_attempts ORDER BY step_id")
        .all() as any[];
      expect(rows.map((r) => [r.step_id, r.state])).toEqual([
        ["step-false", "Terminal"],
        ["step-omit", "Terminal"],
        ["step-true", "Unknown"],
        ["step-weird", "Unknown"],
      ]);
    } finally {
      store.close();
    }
  });

});
