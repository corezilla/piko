/**
 * Case ID: UT-REPO-217  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-217.md（脚本的唯一依据）
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
import { PikoError } from "../../../src/types.js";

describe("UT-REPO-217 · reserveModel · 字符串/路径/枚举输入 × 空", () => {

  it("rejects an empty taskId and stores nothing", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 taskId——''（空串）、null（显式空值）两态；其余参数取合法等价类
      accept(store, task("t-217"));

      // 步骤 2：调用 reserveModel(…)
      let emptyErr: any = null;
      try {
        store.reserveModel("", "op", "step", 1);
      } catch (e) {
        emptyErr = e;
      }
      let nullErr: any = null;
      try {
        store.reserveModel(null as any, "op", "step", 1);
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言——实现的真实语义：reserveModel 无 taskId 校验，空串被外键拒绝（不存在该 run），
      // null 被 NOT NULL 拒绝；两者都是原生 SQLite 错误（非 PikoError），且事务回滚不留行
      expect(emptyErr).toBeInstanceOf(Error);
      expect(String((emptyErr as Error).message)).toContain("FOREIGN KEY constraint failed");
      expect(nullErr).toBeInstanceOf(Error);
      expect(String((nullErr as Error).message)).toContain("NOT NULL constraint failed");
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t-217'").get() as any).model_calls).toBe(0);
    } finally {
      store.close();
    }
  });

});
