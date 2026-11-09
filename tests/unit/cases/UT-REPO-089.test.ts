/**
 * Case ID: UT-REPO-089  ·  STATUS: real
 *
 * 责任：返回站点 L188 值 `{ kind: "conflict" }` 逐值断言（store.ts）
 * 维度坐标：`createOrGet` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-089.md（脚本的唯一依据）
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

describe("UT-REPO-089 · createOrGet · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns exactly { kind: conflict } for mismatched content", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造同 ID 不同内容的 task
      store.createOrGet(task("co-089", { instruction: "a" }), "slinky", 10);

      // 步骤 2：调用 createOrGet(...)
      const outcome = store.createOrGet(task("co-089", { instruction: "b" }), "slinky", 10);

      // 步骤 3：断言逐值对账——该返回站点不带任何其他字段
      expect(outcome).toEqual({ kind: "conflict" });
      expect(Object.keys(outcome)).toEqual(["kind"]);
    } finally {
      store.close();
    }
  });

});
