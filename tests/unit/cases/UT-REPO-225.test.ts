/**
 * Case ID: UT-REPO-225  ·  STATUS: real
 *
 * 责任：参数 `step: string` 的 `注入字符` 类（store.ts:431）
 * 维度坐标：`reserveModel` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-225.md（脚本的唯一依据）
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

describe("UT-REPO-225 · reserveModel · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped step id as a bound parameter", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 step——路径穿越串 + SQL 元字符 + 控制字符
      accept(store, task("t-225"));
      const nasty = "../../etc/passwd'; DROP TABLE runs;--\u0001";

      // 步骤 2：调用 reserveModel(…)
      const reserved = store.reserveModel("t-225", "op", nasty, 1);

      // 步骤 3：断言——参数化绑定：注入串被原样当作数据存下，runs 表与其他行完好
      expect(reserved).toBe(true);
      const row = store.db.prepare("SELECT step_id FROM model_attempts").get() as any;
      expect(row.step_id).toBe(nasty);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
