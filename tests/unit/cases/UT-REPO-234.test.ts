/**
 * Case ID: UT-REPO-234  ·  STATUS: real
 *
 * 责任：返回站点 L439 值 `true` 逐值断言（store.ts）
 * 维度坐标：`reserveModel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-234.md（脚本的唯一依据）
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

describe("UT-REPO-234 · reserveModel · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns true on every accepted reservation path", async () => {
    const store = newStore();
    try {
      accept(store, task("t-234"));

      // 步骤 1：构造使 store.ts:439 的返回站点被到达的输入——全新预留与幂等重放两条路径；
      //         参数取合法等价类
      // 步骤 2：调用 reserveModel(…)
      const fresh = store.reserveModel("t-234", "op", "step", 1);
      const replay = store.reserveModel("t-234", "op", "step", 1);
      const other = store.reserveModel("t-234", "op", "step", 2);

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(fresh).toBe(true);
      expect(replay).toBe(true);
      expect(other).toBe(true);
      expect(typeof fresh).toBe("boolean");
      // 幂等：重复预留不新增行、不重复计数
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(2);
      expect((store.db.prepare("SELECT model_calls FROM runs WHERE task_id='t-234'").get() as any).model_calls).toBe(2);
    } finally {
      store.close();
    }
  });

});
