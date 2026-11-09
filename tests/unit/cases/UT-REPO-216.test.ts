/**
 * Case ID: UT-REPO-216  ·  STATUS: real
 *
 * 责任：返回站点 L427 值 `r?.task_id ?? null` 逐值断言（store.ts）
 * 维度坐标：`nextNeedingStaging` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-216.md（脚本的唯一依据）
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

describe("UT-REPO-216 · nextNeedingStaging · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the oldest pending-staging task id or null", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:427 的返回站点被到达的输入——先空库，再放一条带 input_refs 的任务
      expect(store.nextNeedingStaging()).toBeNull();
      accept(store, task("p2"));
      expect(store.nextNeedingStaging()).toBeNull();
      accept(store, task("p1", { input_refs: [{ source: "file:///a" }] }));

      // 步骤 2：调用 nextNeedingStaging(…)
      const next = store.nextNeedingStaging();

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(next).toBe("p1");
      expect(store.inputStaging("p1").state).toBe("pending");
      expect(store.inputStaging("p2").state).toBe("none");
    } finally {
      store.close();
    }
  });

});
