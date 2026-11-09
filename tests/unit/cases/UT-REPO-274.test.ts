/**
 * Case ID: UT-REPO-274  ·  STATUS: real
 *
 * 责任：参数 `unknown: inferred` 的 `边界(上/下/零/空/满)` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-274.md（脚本的唯一依据）
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

describe("UT-REPO-274 · terminalModel · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("maps the unknown flag to Unknown vs Terminal at the boundary values", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造参数 unknown——false（下界）、true（上界）、缺省（零/空态）；其余参数取合法等价类
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "s1", 1);
      store.reserveModel("t1", "op", "s2", 2);
      store.reserveModel("t1", "op", "s3", 3);

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t1", "op", "s1", 1, false);
      store.terminalModel("t1", "op", "s2", 2, true);
      store.terminalModel("t1", "op", "s3", 3);

      // 步骤 3：断言：被接受时返回值/状态与设计声明一致，逐值对账
      //         实现的真实语义：unknown 缺省即 false → Terminal；true → Unknown
      const rows = store.db.prepare("SELECT step_id, state FROM model_attempts WHERE task_id='t1' ORDER BY step_id").all() as any[];
      expect(rows.map((r) => [r.step_id, r.state])).toEqual([
        ["s1", "Terminal"],
        ["s2", "Unknown"],
        ["s3", "Terminal"],
      ]);
    } finally {
      store.close();
    }
  });

});
