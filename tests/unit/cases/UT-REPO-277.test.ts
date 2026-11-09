/**
 * Case ID: UT-REPO-277  ·  STATUS: real
 *
 * 责任：分支 L454 `? unknown :`（ternary；store.ts）
 * 维度坐标：`terminalModel` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-277.md（脚本的唯一依据）
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

describe("UT-REPO-277 · terminalModel · 状态分支 × 合法迁移", () => {

  it("takes the Unknown side when unknown is true and the Terminal side otherwise", async () => {
    const store = newStore();
    try {
      accept(store, task("t-277"));
      store.reserveModel("t-277", "op-277", "step-t", 1);
      store.reserveModel("t-277", "op-277", "step-f", 1);

      // 步骤 1：构造使 store.ts:454 的分支（ternary：`? unknown :`）取真的输入
      // 步骤 2：调用 terminalModel(…) 并断言该侧可观测结果
      store.terminalModel("t-277", "op-277", "step-t", 1, true);
      expect(
        (store.db.prepare("SELECT state FROM model_attempts WHERE step_id='step-t'").get() as any).state,
      ).toBe("Unknown");

      // 步骤 3：构造使该分支取假的输入——unknown 缺省即 false
      // 步骤 4：再次调用 terminalModel(…) 并断言取假侧结果（两侧都被观测到）
      store.terminalModel("t-277", "op-277", "step-f", 1);
      expect(
        (store.db.prepare("SELECT state FROM model_attempts WHERE step_id='step-f'").get() as any).state,
      ).toBe("Terminal");
    } finally {
      store.close();
    }
  });

});
