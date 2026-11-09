/**
 * Case ID: UT-REPO-078  ·  STATUS: real
 *
 * 责任：分支 L193 `if (q >= capacity)`（if；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-078.md（脚本的唯一依据）
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

describe("UT-REPO-078 · createOrGet · 状态分支 × 合法迁移", () => {

  it("takes the q >= capacity branch and reports queue_full", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:193 的 if (q >= capacity) 取真的输入——队列已满
      store.createOrGet(task("co-078-q1"), "slinky", 10);

      // 步骤 2：调用 createOrGet(..., capacity=1)
      const outcome = store.createOrGet(task("co-078-q2"), "slinky", 1);

      // 步骤 3：断言该分支的判别结果，且拒绝路径无任何写入
      expect(outcome).toEqual({ kind: "queue_full" });
      expect(store.db.prepare("SELECT count(*) n FROM tasks").get()).toEqual({ n: 1 });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
