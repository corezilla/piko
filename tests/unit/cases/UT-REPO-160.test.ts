/**
 * Case ID: UT-REPO-160  ·  STATUS: real
 *
 * 责任：状态写 L320 → `db`（store.ts）
 * 维度坐标：`tryClaimSlot` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-160.md（脚本的唯一依据）
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

describe("UT-REPO-160 · tryClaimSlot · 持久化/序列化 × round-trip", () => {
  it("moves the claimed run to Running with a start timestamp", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:320 对 `db` 的写被执行的前置状态——有一条 Queued 的 run
      accept(store, task("t1"));
      const before = store.db.prepare("SELECT state,started_at FROM runs WHERE task_id='t1'").get() as any;
      // 步骤 2：调用 tryClaimSlot
            store.tryClaimSlot("owner-1", "boot-1");
            const after = store.db.prepare("SELECT state,started_at,last_activity_at FROM runs WHERE task_id='t1'").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(before.state).toBe("Queued");
            expect(before.started_at).toBeNull();
            expect(after.state).toBe("Running");
            expect(typeof after.started_at).toBe("string");
            expect(typeof after.last_activity_at).toBe("string");
    } finally {
      store.close();
    }
  });

});
