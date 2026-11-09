/**
 * Case ID: UT-REPO-477  ·  STATUS: real
 *
 * 责任：状态写 L600 → `db`（store.ts）
 * 维度坐标：`setMatrixCursor` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-477.md（脚本的唯一依据）
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

describe("UT-REPO-477 · setMatrixCursor · 持久化/序列化 × round-trip", () => {

  it("persists the matrix sync cursor so a reopened database sees it", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "piko-repo-477-"));
    const path = join(dir, "store.sqlite");
    const store = new TaskStore(path, 1000);
    let closed = false;
    try {
      // 步骤 1：构造使 store.ts:600 对 `db` 的写被执行的前置状态——matrix_state 单例行已由 migrate() 建好
      expect(store.matrixCursor()).toBeNull();

      // 步骤 2：调用 setMatrixCursor(…)
      store.setMatrixCursor("s-42");
      expect(store.matrixCursor()).toBe("s-42");
      store.close();
      closed = true;

      // 步骤 3：读回权威事实源（重开库逐行对账）逐值对账写入语义
      const reopened = new TaskStore(path, 1000);
      try {
        expect(reopened.matrixCursor()).toBe("s-42");
        const row = reopened.db.prepare("SELECT sync_cursor, membership_version FROM matrix_state WHERE singleton=1").get() as any;
        expect(row.sync_cursor).toBe("s-42");
        expect(row.membership_version).toBe(0);
      } finally {
        reopened.close();
      }
    } finally {
      if (!closed) store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

});
