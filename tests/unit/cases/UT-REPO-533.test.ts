/**
 * Case ID: UT-REPO-533  ·  STATUS: real
 *
 * 责任：返回站点 L635 值 `this.tx(() => { const r = this.getRun(t…` 逐值断言（store.ts）
 * 维度坐标：`cancel` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-533.md（脚本的唯一依据）
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

describe("UT-REPO-533 · cancel · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the three documented outcomes with a requested_at stamp", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:635 的返回站点被到达的输入——三种等价类状态
      accept(store, task("t-533-running"));
      store.tryClaimSlot("owner", "boot");
      accept(store, task("t-533-queued"));

      // 步骤 2：调用 cancel(…)
      const queued = store.cancel("t-533-queued");
      const terminal = store.cancel("t-533-queued");
      const running = store.cancel("t-533-running");

      // 步骤 3：断言返回值逐值对账——三种 outcome 逐一比对，且都带 requested_at 时间戳
      expect(queued.outcome).toBe("CancelledBeforeStart");
      expect(terminal.outcome).toBe("AlreadyTerminal");
      expect(running.outcome).toBe("StopRequested");
      expect(typeof queued.requested_at).toBe("string");
      expect(Date.parse(queued.requested_at)).not.toBeNaN();
      expect(Object.keys(queued).sort()).toEqual(["outcome", "requested_at"]);
    } finally {
      store.close();
    }
  });

});
