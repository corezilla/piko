/**
 * Case ID: UT-REPO-080  ·  STATUS: real
 *
 * 责任：分支 L196 `task.input_refs?.length`（?.；store.ts）
 * 维度坐标：`createOrGet` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-080.md（脚本的唯一依据）
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

describe("UT-REPO-080 · createOrGet · 状态分支 × 合法迁移", () => {

  it("does not short-circuit the optional chain when input_refs is present", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 task.input_refs 为有效值（非 undefined／null）的输入，与缺省者对照
      const present = task("co-080-a", { input_refs: [{ source: "s1" }] });
      const absent = task("co-080-b");

      // 步骤 2：调用 createOrGet(...)
      store.createOrGet(present, "slinky", 10);
      store.createOrGet(absent, "slinky", 10);

      // 步骤 3：断言逐值对账——可选链在 input_refs 存在时不短路，取到长度并写 pending
      expect(store.getRun("co-080-a").input_staging.state).toBe("pending");
      expect(store.getRun("co-080-b").input_staging.state).toBe("none");
    } finally {
      store.close();
    }
  });

});
