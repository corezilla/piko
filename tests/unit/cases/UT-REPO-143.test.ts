/**
 * Case ID: UT-REPO-143  ·  STATUS: real
 *
 * 责任：参数 `delivery: ArtifactDelivery` 的 `非法值` 类（store.ts:295）
 * 维度坐标：`setArtifactDelivery` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-143.md（脚本的唯一依据）
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

describe("UT-REPO-143 · setArtifactDelivery · 纯函数/无副作用 × 非法值", () => {

  it("stores an out-of-enum delivery state verbatim (no runtime validation)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 delivery 的非法值类——state 不在 ArtifactDelivery 的枚举内
      store.createOrGet(task("sad-143"), "slinky", 10);
      const delivery = {
        state: "not_a_state" as unknown as "none",
        delivered: [],
        failed: [],
      };

      // 步骤 2：调用 setArtifactDelivery("sad-143", delivery)
      store.setArtifactDelivery("sad-143", delivery);

      // 步骤 3：断言逐值对账。
      // 实现不做运行时枚举校验（只在 TS 类型层约束），非法 state 被原样序列化落库，
      // 且不抛 typed 错误——故断言真实的"接受并落库"事实，而非"被拒绝"。
      expect(store.getRun("sad-143").artifact_delivery).toEqual({
        state: "not_a_state",
        delivered: [],
        failed: [],
      });
    } finally {
      store.close();
    }
  });

});
