/**
 * Case ID: UT-REPO-366  ·  STATUS: real
 *
 * 责任：返回站点 L517 值 `!!this.db.prepare("SELECT 1 FROM discus…` 逐值断言（store.ts）
 * 维度坐标：`discussionAccessLost` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-366.md（脚本的唯一依据）
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

describe("UT-REPO-366 · discussionAccessLost · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns false before the loss is recorded and true after", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:517 的返回站点被到达的输入——讨论房间匹配的活跃任务
      acceptDiscussion(store, "t-366", "!room:366");

      // 步骤 2：调用 discussionAccessLost(…)
      const before = store.discussionAccessLost("t-366");

      // 步骤 3：断言返回值逐值对账——!! 把行存在性折成布尔；登记丢失后翻转为 true
      expect(before).toBe(false);
      expect(typeof before).toBe("boolean");
      store.markDiscussionAccessLost("!room:366");
      const after = store.discussionAccessLost("t-366");
      expect(after).toBe(true);
      expect(typeof after).toBe("boolean");
    } finally {
      store.close();
    }
  });

});
