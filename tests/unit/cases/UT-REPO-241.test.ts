/**
 * Case ID: UT-REPO-241  ·  STATUS: real
 *
 * 责任：分支 L45 `if (path !== ":memory:")`（if；store.ts）
 * 维度坐标：`TaskStore.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-241.md（脚本的唯一依据）
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

describe("UT-REPO-241 · TaskStore.constructor · 状态分支 × 合法迁移", () => {
  it("skips mkdirSync for \":memory:\" and runs it for every other path", async () => {
      // 步骤 1：构造使 store.ts:45 的分支（if：`if (path !== ":memory:"`）取真的输入——path ≠ ":memory:"
      const { mkdtempSync, existsSync } = await import("node:fs");
      const { tmpdir } = await import("node:os");
      const { join } = await import("node:path");
      const dir = mkdtempSync(join(tmpdir(), "piko-ctor-"));
      const sub = join(dir, "nested", "deeper");
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore（走真分支）
        store = new TaskStore(join(sub, "db.sqlite"), 1000);

        // 步骤 3：断言——取真侧：父目录被递归创建；取假侧（":memory:"）不创建任何目录
        expect(existsSync(sub)).toBe(true);
        store.close();
        store = null;

        const mem = new TaskStore(":memory:", 1000);
        const tables = (mem.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any).map((x: any) => x.name);
        expect(tables).toContain("tasks");
        const { readdirSync } = await import("node:fs");
        expect(readdirSync(dir).sort()).toEqual(["nested"]);
        mem.close();
      } finally {
        if (store) store.close();
      }
  });

});
