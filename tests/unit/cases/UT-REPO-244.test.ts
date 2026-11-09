/**
 * Case ID: UT-REPO-244  ·  STATUS: real
 *
 * 责任：资源操作 L45 `mkdirSync`（store.ts）
 * 维度坐标：`TaskStore.constructor` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-244.md（脚本的唯一依据）
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

describe("UT-REPO-244 · TaskStore.constructor · 资源获取/释放 × 获取失败路径", () => {
  it("propagates the mkdirSync failure and opens nothing", async () => {
      // 步骤 1：构造使 store.ts:45 的资源操作（mkdirSync）被执行的输入——取临时目录下的真实路径，
      // 但父路径是一个普通文件，mkdirSync 因此失败
      const { mkdtempSync, writeFileSync } = await import("node:fs");
      const { tmpdir } = await import("node:os");
      const { join } = await import("node:path");
      const dir = mkdtempSync(join(tmpdir(), "piko-ctor-"));
      const blocker = join(dir, "blocker");
      writeFileSync(blocker, "not a directory");
      let err: any = null;
      let store: any = null;
      try {
        // 步骤 2：调用 new TaskStore（走正常路径）
        store = new TaskStore(join(blocker, "sub", "db.sqlite"), 1000);
      } catch (e) {
        err = e;
      }

      // 步骤 3：注入该操作失败后再次调用——断言错误被原样传播，且没有半开的库残留
      expect(err).not.toBeNull();
      expect(err.code).toBe("ENOTDIR");
      expect(err.message).toContain("mkdir");
      expect(store).toBeNull();
  });

});
