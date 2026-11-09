/**
 * Case ID: UT-REPO-273  ·  STATUS: real
 *
 * 责任：参数 `unknown: inferred` 的 `每等价类合法值` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-273.md（脚本的唯一依据）
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

describe("UT-REPO-273 · terminalModel · 纯函数/无副作用 × 每等价类合法值", () => {

  it("maps the unknown flag onto the Terminal and Unknown states respectively", async () => {
    const store = newStore();
    try {
      accept(store, task("t-273"));
      store.reserveModel("t-273", "op-273", "step-false", 1);
      store.reserveModel("t-273", "op-273", "step-true", 1);

      // 步骤 1：按 `每等价类合法值` 类构造参数 unknown——false 与 true 各一个代表值
      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t-273", "op-273", "step-false", 1, false);
      store.terminalModel("t-273", "op-273", "step-true", 1, true);

      // 步骤 3：断言逐值对账——unknown=false 写 Terminal，unknown=true 写 Unknown，
      //         两者都把 record_version 推了 +1
      const rows = store.db.prepare("SELECT step_id,state,record_version FROM model_attempts ORDER BY step_id").all() as any[];
      expect(rows).toEqual([
        { step_id: "step-false", state: "Terminal", record_version: 2 },
        { step_id: "step-true", state: "Unknown", record_version: 2 },
      ]);
    } finally {
      store.close();
    }
  });

});
