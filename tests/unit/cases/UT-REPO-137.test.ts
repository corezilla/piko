/**
 * Case ID: UT-REPO-137  ·  STATUS: real
 *
 * 责任：状态写 L292 → `db`（store.ts）
 * 维度坐标：`setInputStaging` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-137.md（脚本的唯一依据）
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

describe("UT-REPO-137 · setInputStaging · 持久化/序列化 × round-trip", () => {
  it("persists the staging JSON on the runs row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:292 对 `db` 的写被执行的前置状态——先有一条真实存在的 run
      accept(store, task("t1"));
      const staging = { state: "ready" as const, fetched: [{ source: "a", dest: "b" }], failed: [{ source: "c", error: "boom" }] };
      // 步骤 2：调用 setInputStaging
            store.setInputStaging("t1", staging);
      // 步骤 3：读回权威事实源（直接查库）逐值对账写入语义
            const row = store.db.prepare("SELECT input_staging_json FROM runs WHERE task_id='t1'").get() as any;
            expect(JSON.parse(row.input_staging_json)).toEqual(staging);
            expect(store.inputStaging("t1")).toEqual(staging);
    } finally {
      store.close();
    }
  });

});
