/**
 * Case ID: UT-REPO-133  ·  STATUS: real
 *
 * 责任：参数 `staging: InputStaging` 的 `每等价类合法值` 类（store.ts:288）
 * 维度坐标：`setInputStaging` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-133.md（脚本的唯一依据）
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

describe("UT-REPO-133 · setInputStaging · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts every legal InputStaging equivalence class", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `每等价类合法值` 类构造 staging——取自类型定义 InputStaging.state 的五个枚举值；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      const states = ["none", "pending", "in_progress", "ready", "failed"] as const;
      // 步骤 2：逐个等价类调用 setInputStaging
            const seen: any[] = [];
            for (const st of states) {
              store.setInputStaging("t1", { state: st, fetched: [], failed: [] });
              seen.push(store.inputStaging("t1"));
            }
      // 步骤 3：断言返回值/状态与设计声明一致，逐值对账
            expect(seen.map((x) => x.state)).toEqual(["none", "pending", "in_progress", "ready", "failed"]);
            for (const x of seen) {
              expect(x.fetched).toEqual([]);
              expect(x.failed).toEqual([]);
            }
            expect(store.inputStaging("t1").state).toBe("failed");
    } finally {
      store.close();
    }
  });

});
