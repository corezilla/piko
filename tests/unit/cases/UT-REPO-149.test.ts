/**
 * Case ID: UT-REPO-149  ·  STATUS: real
 *
 * 责任：返回站点 L300 值 `JSON.parse((this.db.prepare("SELECT inp…` 逐值断言（store.ts）
 * 维度坐标：`inputStaging` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-149.md（脚本的唯一依据）
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

describe("UT-REPO-149 · inputStaging · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the persisted InputStaging verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:300 的返回站点被到达的输入——先写入一个 staging
      accept(store, task("t1"));
      const staging = { state: "in_progress" as const, fetched: [{ source: "a", sha256: "d" }], failed: [{ source: "b", error: "e" }] };
      store.setInputStaging("t1", staging);
      // 步骤 2：调用 inputStaging
            const got = store.inputStaging("t1");
      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
            expect(got).toEqual(staging);
            expect(Object.keys(got)).toEqual(["state", "fetched", "failed"]);
            expect(got.fetched[0]).toEqual({ source: "a", sha256: "d" });
            expect(got.failed[0]).toEqual({ source: "b", error: "e" });
            // 纯读：无状态写
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
