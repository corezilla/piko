/**
 * Case ID: UT-REPO-268  ·  STATUS: real
 *
 * 责任：参数 `step: string` 的 `超长` 类（store.ts:449）
 * 维度坐标：`terminalModel` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-268.md（脚本的唯一依据）
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

describe("UT-REPO-268 · terminalModel · 字符串/路径/枚举输入 × 超长", () => {
  it("matches no attempt for an over-long step id and writes nothing", async () => {
    const store = newStore();
    try {
      accept(store, task("t-268"));
      store.reserveModel("t-268", "op", "step", 1);
      const longStep = "S".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 step——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      // 步骤 2：调用 terminalModel(…)
      const returned = store.terminalModel("t-268", "op", longStep, 1);

      // 步骤 3：断言——实现无长度校验：超长 step 只是不匹配的 UPDATE 键 → 匹配 0 行、
      //         静默返回 undefined，且没有任何地方持久化了这段超长文本
      expect(returned).toBeUndefined();
      const row = store.db.prepare("SELECT state, record_version, length(step_id) ls FROM model_attempts").get() as any;
      expect(row.state).toBe("Started");
      expect(row.record_version).toBe(1);
      expect(row.ls).toBe(4);
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
