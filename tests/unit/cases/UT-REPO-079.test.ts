/**
 * Case ID: UT-REPO-079  ·  STATUS: real
 *
 * 责任：分支 L196 `? task.input_refs?.length :`（ternary；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-079.md（脚本的唯一依据）
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

describe("UT-REPO-079 · createOrGet · 状态分支 × 合法迁移", () => {

  it("sets staging to pending when input_refs is non-empty", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:196 的三元真侧成立的输入——task.input_refs?.length 为真
      const withRefs = task("co-079", { input_refs: [{ source: "s1" }, { source: "s2" }] });

      // 步骤 2：调用 createOrGet(...)
      const outcome = store.createOrGet(withRefs, "slinky", 10);

      // 步骤 3：断言逐值对账——真侧写入 staging.state="pending"
      expect(outcome.kind).toBe("created");
      expect(store.getRun("co-079").input_staging).toEqual({ state: "pending", fetched: [], failed: [] });
    } finally {
      store.close();
    }
  });

});
