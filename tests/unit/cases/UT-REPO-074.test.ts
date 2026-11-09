/**
 * Case ID: UT-REPO-074  ·  STATUS: real
 *
 * 责任：分支 L186 `if (old)`（if；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-074.md（脚本的唯一依据）
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

describe("UT-REPO-074 · createOrGet · 状态分支 × 合法迁移", () => {

  it("takes the if (old) branch and replays the existing run", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:186 的 if (old) 取真的输入——同 task_id 已在 tasks 表中
      const first = store.createOrGet(task("co-074"), "slinky", 10);

      // 步骤 2：再次调用 createOrGet(同 task 同内容)
      const second = store.createOrGet(task("co-074"), "slinky", 10);

      // 步骤 3：断言该分支走的是 existing 路径，未新增行
      expect(first.kind).toBe("created");
      expect(second).toEqual({ kind: "existing", task_id: "co-074", generation: 1, state: "Queued" });
      expect(store.db.prepare("SELECT count(*) n FROM tasks").get()).toEqual({ n: 1 });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
