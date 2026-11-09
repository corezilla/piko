/**
 * Case ID: UT-REPO-269  ·  STATUS: real
 *
 * 责任：参数 `step: string` 的 `注入字符` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-269.md（脚本的唯一依据）
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

describe("UT-REPO-269 · terminalModel · 字符串/路径/枚举输入 × 注入字符", () => {

  it("treats an injected step id as plain text and matches it exactly", async () => {
    const store = newStore();
    try {
      accept(store, task("t-269"));
      const injected = "st'; DROP TABLE model_attempts;--";
      store.reserveModel("t-269", "op-269", injected, 1);

      // 步骤 1：按 `注入字符` 类构造参数 step——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t-269", "op-269", injected, 1);

      // 步骤 3：断言——实现的真实语义：step_id 是绑定参数，注入串不构成 SQL，
      //         原样落库并被精确匹配到那一行，表结构完好
      const rows = store.db.prepare("SELECT step_id,state FROM model_attempts").all() as any[];
      expect(rows).toEqual([{ step_id: injected, state: "Terminal" }]);
      expect(store.db.prepare("SELECT count(*) n FROM model_attempts").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
