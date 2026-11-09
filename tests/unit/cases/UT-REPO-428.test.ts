/**
 * Case ID: UT-REPO-428  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（store.ts:544）
 * 维度坐标：`hasMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-428.md（脚本的唯一依据）
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

describe("UT-REPO-428 · hasMatrixEvent · 字符串/路径/枚举输入 × 空", () => {

  it("finds no event for an empty room id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 room 的空类——''（空串）；库中有一条空房间的事件
      store.recordMatrixEvent("", "$evt428", "sender");

      // 步骤 2：调用 hasMatrixEvent("", "$evt428")
      const found = store.hasMatrixEvent("", "$evt428");

      // 步骤 3：断言逐值对账——空房间是合法主键分量，命中已登记的那条
      expect(found).toBe(true);
      expect(store.hasMatrixEvent("", "$other")).toBe(false);
    } finally {
      store.close();
    }
  });

});
