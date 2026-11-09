/**
 * Case ID: UT-REPO-612  ·  STATUS: real
 *
 * 责任：状态写 L770 → `db`（store.ts）
 * 维度坐标：`finish` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-612.md（脚本的唯一依据）
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

describe("UT-REPO-612 · finish · 持久化/序列化 × round-trip", () => {

  it("persists the terminal run row so a reopened database reads it back", async () => {
    const { mkdtempSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-612-"));
    const path = join(dir, "db.sqlite");
    const first = new TaskStore(path, 1000);
    try {
      // 步骤 1：构造使 store.ts:770 对 db 的写被执行的前置状态——任务已受理且持有槽位
      first.createOrGet(task("t-612"), "slinky", 10);
      const grant = first.tryClaimSlot("owner", "boot") as { lease_epoch: number };
      expect(grant.lease_epoch).toBe(1);
      expect((first.db.prepare("SELECT state FROM runs WHERE task_id='t-612'").get() as any).state).toBe("Running");

      // 步骤 2：调用 finish(…)
      first.finish(result("t-612"), grant.lease_epoch);

      // 步骤 3：读回权威事实源（重开库逐行对账）——写已发生，新值可被重开后的库读到
      expect((first.db.prepare("SELECT state,finished_at FROM runs WHERE task_id='t-612'").get() as any).state).toBe("Completed");
    } finally {
      first.close();
    }
    const second = new TaskStore(path, 1000);
    try {
      const row = second.db.prepare("SELECT state,finished_at,discussion_intake_state FROM runs WHERE task_id='t-612'").get() as any;
      expect(row.state).toBe("Completed");
      expect(row.finished_at).toBe("2026-11-09T00:00:00.000Z");
      expect(row.discussion_intake_state).toBe("Disabled");
      expect((second.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(1);
    } finally {
      second.close();
    }
  });

});
