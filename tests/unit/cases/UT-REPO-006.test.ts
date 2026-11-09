/**
 * Case ID: UT-REPO-006  ·  STATUS: real
 *
 * 责任：被测符号 `discussionRoomsInUse`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`discussionRoomsInUse` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-006.md（脚本的唯一依据）
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

describe("UT-REPO-006 · discussionRoomsInUse · 状态分支 × 合法迁移", () => {
  it("lists the rooms the open runs reference", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:a");
    accept(store, task("t-2"));
    // 步骤 2：调用 discussionRoomsInUse
    const rooms = store.discussionRoomsInUse();

    // 步骤 3：断言返回值逐值对账——只有带讨论的开放任务贡献房间
    expect(rooms).toEqual(["!room:a"]);
  } finally {
    store.close();
  }
  });

});
