/**
 * Case ID: UT-REPO-559  ·  STATUS: real
 *
 * 责任：返回站点 L676 值 `{ input_tokens: null, output_tokens: nu…` 逐值断言（store.ts）
 * 维度坐标：`usageSoFar` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-559.md（脚本的唯一依据）
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

describe("UT-REPO-559 · usageSoFar · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the exact null-triple shape when there is no usage at all", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:676 的返回站点被到达的输入——任务存在但没有任何已观测用量的 model_attempt
      accept(store, task("t1"));

      // 步骤 2：调用 usageSoFar(…)
      //         usageSoFar 是私有的，实现对外只经 getRun().progress.usage_so_far 暴露
      const usage = (store.getRun("t1") as any).progress.usage_so_far;

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(Object.keys(usage).sort()).toEqual(["input_tokens", "output_tokens", "total_tokens"]);
      expect(usage.input_tokens).toBeNull();
      expect(usage.output_tokens).toBeNull();
      expect(usage.total_tokens).toBeNull();
      // 无未声明副作用：只读聚合没有写任何行
      expect((store.db.prepare("SELECT count(*) n FROM model_attempts").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
