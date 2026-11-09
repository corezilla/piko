/**
 * Case ID: UT-REPO-237  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `注入字符` 类（store.ts:44）
 * 维度坐标：`TaskStore.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-237.md（脚本的唯一依据）
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

describe("UT-REPO-237 · TaskStore.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("creates a directory whose name carries SQL metacharacters", async () => {
      // 步骤 1：按 `注入字符` 类构造 path——目录名含 SQL 元字符与控制字符
      const { mkdtempSync, existsSync } = await import("node:fs");
      const { tmpdir } = await import("node:os");
      const { join } = await import("node:path");
      const dir = mkdtempSync(join(tmpdir(), "piko-ctor-"));
      const nasty = "a'; DROP TABLE runs;--";
      const path = join(dir, nasty, "db.sqlite");
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore(path)
        store = new TaskStore(path, 1000);

        // 步骤 3：断言——路径只当作文件系统路径，注入串原样成为目录名；库正常建好
        expect(existsSync(join(dir, nasty))).toBe(true);
        const tables = (store.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any).map((x: any) => x.name);
        expect(tables).toContain("tasks");
        expect(tables).toContain("runs");
      } finally {
        if (store) store.close();
      }
  });

});
