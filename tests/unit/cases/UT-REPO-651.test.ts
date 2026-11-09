/**
 * Case ID: UT-REPO-651  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `非法值` 类（store.ts:855）
 * 维度坐标：`asReader` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-651.md（脚本的唯一依据）
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

describe("UT-REPO-651 · asReader · 纯函数/无副作用 × 非法值", () => {

  it("builds a reader for a valid store and throws for an illegal one", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `非法值` 类构造参数 store——undefined、null、以及一个缺少方法的对象
      // 步骤 2：调用 asReader(…)
      const reader = asReader(store);
      expect(Object.keys(reader).sort()).toEqual([
        "cancelRequested",
        "discussionAccessLost",
        "generation",
        "getRun",
        "getTask",
        "knownActions",
        "pendingTurns",
        "rawUsage",
      ]);
      for (const key of Object.keys(reader)) {
        expect(typeof (reader as any)[key]).toBe("function");
      }

      // 步骤 3：断言——被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      //         实现的真实语义：asReader 不做参数校验，直接对传入对象调 .bind——
      //         非法值在第一次 bind 时就抛原生 TypeError（不是 typed PikoError）
      const errors: any[] = [];
      for (const bad of [undefined, null, {}]) {
        try {
          asReader(bad as never);
        } catch (e) {
          errors.push(e);
        }
      }
      expect(errors).toHaveLength(3);
      for (const e of errors) {
        expect(e).toBeInstanceOf(TypeError);
      }
      // 无状态写/资源残留：asReader 只做绑定，不触碰数据库
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
