/**
 * Case ID: UT-REPO-275  ·  STATUS: real
 *
 * 责任：参数 `unknown: inferred` 的 `非法值` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-275.md（脚本的唯一依据）
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

describe("UT-REPO-275 · terminalModel · 纯函数/无副作用 × 非法值", () => {

  it("maps every truthy unknown value to the Unknown state", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造 unknown——缺省 false 与若干非布尔真值（实现按真值而非枚举判定）
      accept(store, task("t-275"));
      store.reserveModel("t-275", "op-1", "step-1", 1);
      store.reserveModel("t-275", "op-2", "step-2", 2);

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel("t-275", "op-1", "step-1", 1);
      store.terminalModel("t-275", "op-2", "step-2", 2, "not-a-boolean" as any);

      // 步骤 3：断言——实现的真实语义：unknown 只做真值判断，
      // 缺省 false → Terminal；任意真值（含非法枚举值）→ Unknown
      const rows = store.db.prepare("SELECT operation_id,state FROM model_attempts ORDER BY operation_id").all() as any[];
      expect(rows[0].operation_id).toBe("op-1");
      expect(rows[0].state).toBe("Terminal");
      expect(rows[1].operation_id).toBe("op-2");
      expect(rows[1].state).toBe("Unknown");
    } finally {
      store.close();
    }
  });

});
