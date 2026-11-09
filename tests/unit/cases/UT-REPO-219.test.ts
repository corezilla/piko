/**
 * Case ID: UT-REPO-219  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-219.md（脚本的唯一依据）
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

describe("UT-REPO-219 · reserveModel · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injected task id verbatim without touching the schema", async () => {
    const store = newStore();
    try {
      const injected = "t-219'; DROP TABLE model_attempts;--";
      accept(store, task(injected));

      // 步骤 1：按 `注入字符` 类构造参数 taskId——穿越串 + SQL 元字符 + 控制字符
      // 步骤 2：调用 reserveModel(…)
      const reserved = store.reserveModel(injected, "op-219", "step-219", 1);

      // 步骤 3：断言——实现没有校验语句；参数走绑定层被当作普通文本原样落库，
      //         注入串没有构成 SQL，计数按实现语义 +1
      expect(reserved).toBe(true);
      const row = store.db.prepare("SELECT task_id,operation_id,step_id,state FROM model_attempts").get() as any;
      expect(row.task_id).toBe(injected);
      expect(row.operation_id).toBe("op-219");
      expect(row.state).toBe("Started");
      expect(store.db.prepare("SELECT count(*) n FROM model_attempts").get()).toEqual({ n: 1 });
      expect(store.getRun(injected).progress.model_calls).toBe(1);
    } finally {
      store.close();
    }
  });

});
