/**
 * Case ID: UT-REPO-087  ·  STATUS: real
 *
 * 责任：返回站点 L184 值 `this.tx(() => { const old = this.db.pre…` 逐值断言（store.ts）
 * 维度坐标：`createOrGet` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-087.md（脚本的唯一依据）
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

describe("UT-REPO-087 · createOrGet · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the outcome produced inside the acceptance transaction", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条合法 task（走 created 路径）
      // 步骤 2：调用 createOrGet(...)
      const outcome = store.createOrGet(task("co-087"), "slinky", 10);

      // 步骤 3：断言逐值对账——tx 包装返回的就是判别结果对象本身
      expect(outcome).toEqual({ kind: "created", task_id: "co-087", generation: 1, state: "Queued" });
      expect(Object.keys(outcome).sort()).toEqual(["generation", "kind", "state", "task_id"]);
    } finally {
      store.close();
    }
  });

});
