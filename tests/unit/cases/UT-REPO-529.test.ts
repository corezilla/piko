/**
 * Case ID: UT-REPO-529  ·  STATUS: real
 *
 * 责任：分支 L639 `if (r.state === "Queued")`（if；store.ts）
 * 维度坐标：`cancel` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-529.md（脚本的唯一依据）
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

describe("UT-REPO-529 · cancel · 状态分支 × 合法迁移", () => {

  it("cancels a Queued run outright and only requests a stop for a Running one", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:639 的分支（if：`if (r.state === "Queued")`）取真的输入
      accept(store, task("t-529"));

      // 步骤 2：调用 cancel(…) 并断言该侧可观测结果
      const queued = store.cancel("t-529");

      // 步骤 3：断言取真侧——Queued 走零调用取消路径：落一条 Cancelled 结果并把 run 置为 Cancelled
      expect(queued.outcome).toBe("CancelledBeforeStart");
      expect(store.getRun("t-529").state).toBe("Cancelled");
      expect(store.result("t-529").state).toBe("Cancelled");
      expect(store.result("t-529").failure?.code).toBe("CancelledByRequest");

      // 步骤 4：断言取假侧——Running 的 run 只请求停止：状态变 Cancelling，cancel_requested 置位
      accept(store, task("t-529-b"));
      store.tryClaimSlot("owner", "boot");
      const running = store.cancel("t-529-b");
      expect(running.outcome).toBe("StopRequested");
      expect(store.getRun("t-529-b").state).toBe("Cancelling");
      expect(store.cancelRequested("t-529-b")).toBe(true);
    } finally {
      store.close();
    }
  });

});
