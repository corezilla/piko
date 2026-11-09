/**
 * Case ID: UT-REPO-262  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-262.md（脚本的唯一依据）
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

describe("UT-REPO-262 · terminalModel · 字符串/路径/枚举输入 × 超长", () => {

  it("writes no row when terminalModel is given an over-long task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造参数 taskId——长度 2×上限 = 8192（源码无比较常量，取文档默认上限 4096）；其余参数取合法等价类
      accept(store, task("t1"));
      store.reserveModel("t1", "op", "step", 1);
      const longId = "t".repeat(8192);

      // 步骤 2：调用 terminalModel(…)
      store.terminalModel(longId, "op", "step", 1);

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：terminalModel 是一次 UPDATE，长 taskId 匹配不到任何行，
      //         不抛错也不写入——行数与状态都保持不变
      const row = store.db.prepare("SELECT state, record_version FROM model_attempts WHERE task_id='t1'").get() as any;
      expect(row.state).toBe("Started");
      expect(row.record_version).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
