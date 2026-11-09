/**
 * Case ID: UT-REPO-142  ·  STATUS: real
 *
 * 责任：参数 `delivery: ArtifactDelivery` 的 `边界(上/下/零/空/满)` 类（store.ts:295）
 * 维度坐标：`setArtifactDelivery` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-142.md（脚本的唯一依据）
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

describe("UT-REPO-142 · setArtifactDelivery · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("accepts the boundary shape of ArtifactDelivery (empty collections)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 delivery 的边界等价类——delivered 与 failed 均为空数组
      store.createOrGet(task("sad-142"), "slinky", 10);
      const delivery = { state: "none" as const, delivered: [], failed: [] };

      // 步骤 2：调用 setArtifactDelivery("sad-142", delivery)
      store.setArtifactDelivery("sad-142", delivery);

      // 步骤 3：断言逐值对账——空集合是合法边界值，原样落库
      expect(store.getRun("sad-142").artifact_delivery).toEqual({
        state: "none",
        delivered: [],
        failed: [],
      });
    } finally {
      store.close();
    }
  });

});
