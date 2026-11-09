/**
 * Case ID: UT-REPO-141  ·  STATUS: real
 *
 * 责任：参数 `delivery: ArtifactDelivery` 的 `每等价类合法值` 类（store.ts:295）
 * 维度坐标：`setArtifactDelivery` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-141.md（脚本的唯一依据）
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

describe("UT-REPO-141 · setArtifactDelivery · 纯函数/无副作用 × 每等价类合法值", () => {

  it("accepts one representative of each legal ArtifactDelivery state", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 ArtifactDelivery 的各合法等价类代表值（state 枚举的每个成员），
      // 并为每条任务先受理一个 run
      const states = ["none", "pending", "in_progress", "delivered", "partial", "failed"] as const;
      for (const [i, state] of states.entries()) {
        store.createOrGet(task(`sad-141-${i}`), "slinky", 10);
      }

      // 步骤 2：逐个调用 setArtifactDelivery(...)
      for (const [i, state] of states.entries()) {
        const delivery = {
          state,
          delivered: state === "delivered" ? [{ path: "/out/a", sha256: "aa", size_bytes: 3 }] : [],
          failed: state === "failed" ? [{ path: "/out/b", error: "boom" }] : [],
        };
        store.setArtifactDelivery(`sad-141-${i}`, delivery);
      }

      // 步骤 3：断言逐值对账——每个合法 state 都被原样接受并读回
      for (const [i, state] of states.entries()) {
        expect(store.getRun(`sad-141-${i}`).artifact_delivery.state).toBe(state);
      }
      expect(states).toHaveLength(6);
    } finally {
      store.close();
    }
  });

});
