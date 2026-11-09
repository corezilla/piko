/**
 * Case ID: UT-REPO-126  ·  STATUS: real
 *
 * 责任：分支 L279 `? r.started_at :`（ternary；store.ts）
 * 维度坐标：`getRun` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-126.md（脚本的唯一依据）
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

describe("UT-REPO-126 · getRun · 状态分支 × 合法迁移", () => {

  it("reports elapsed_ms 0 while started_at is null and a real elapsed once running", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条已受理但尚未开始的 task
      store.createOrGet(task("gr-126"), "slinky", 10);

      // 步骤 2：先读一次 Queued 视图，再领取 slot 让它 Running 后读一次
      const queued = store.getRun("gr-126");
      store.tryClaimSlot("owner", "boot");
      const running = store.getRun("gr-126");

      // 步骤 3：断言逐值对账——三元假侧 elapsed_ms=0；真侧 started_at 非空且 elapsed_ms>=0
      expect(queued.started_at).toBeNull();
      expect(queued.progress.elapsed_ms).toBe(0);
      expect(running.started_at).not.toBeNull();
      expect(running.progress.elapsed_ms).toBeGreaterThanOrEqual(0);
    } finally {
      store.close();
    }
  });

});
