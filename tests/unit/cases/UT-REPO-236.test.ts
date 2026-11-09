/**
 * Case ID: UT-REPO-236  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `超长` 类（store.ts:44）
 * 维度坐标：`TaskStore.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-236.md（脚本的唯一依据）
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

describe("UT-REPO-236 · TaskStore.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long path with ENAMETOOLONG", async () => {
      // 步骤 1：按 `超长` 类构造 path——长度 2×上限 = 8192（源码无比较常量，取文档默认上限 4096）；
      // 其余参数取合法等价类
      const { mkdtempSync } = await import("node:fs");
      const { tmpdir } = await import("node:os");
      const { join } = await import("node:path");
      const dir = mkdtempSync(join(tmpdir(), "piko-ctor-"));
      const longPath = join(dir, "x".repeat(8192), "db.sqlite");
      let err: any = null;
      try {
        // 步骤 2：调用 new TaskStore(longPath)
        const store = new TaskStore(longPath, 1000);
        store.close();
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——构造器在 mkdirSync(dirname(path)) 上失败，错误来自 node:fs 而非 typed PikoError
      expect(err).not.toBeNull();
      expect(err.code).toBe("ENAMETOOLONG");
      expect(err.message).toContain("mkdir");
  });

});
