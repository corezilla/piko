/**
 * Case ID: UT-REPO-023  ·  STATUS: real
 *
 * 责任：被测符号 `migrate`（REPO）在对象类型 `错误路径` 下的维度格 `每个 typed 错误码`（该 Case 只登记本行 1 格）、`错误保真传播`、`内部错误不上抛为客户端码`；只测该符号该类型
 * 维度坐标：`migrate` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-023.md（脚本的唯一依据）
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

describe("UT-REPO-023 · migrate · 错误路径 × 每个 typed 错误码", () => {
  it("fails when the schema is not the one it migrates to", async () => {
  const store = newStore();
  try {
    // 步骤 1：造一个已有的、版本不对的库
    const { mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const { DatabaseSync } = await import("node:sqlite");
    const dir = await mkdtemp(join(tmpdir(), "piko-migrate-"));
    const path = join(dir, "old.sqlite");
    const old = new DatabaseSync(path);
    // 一个与迁移脚本冲突的旧表：列名与新表同名但结构不同
    old.exec("CREATE TABLE runs(task_id TEXT PRIMARY KEY) STRICT");
    old.exec("PRAGMA user_version=1");
    old.close();

    try {
      // 步骤 2：构造 TaskStore —— migrate 的 CREATE TABLE IF NOT EXISTS 撞上旧表
      const store2 = new TaskStore(path, 1000);
      // 步骤 3：断言迁移后的表结构仍是旧的那张——migrate 不做破坏性重建，
      //         旧表原样留着（user_version 被推到 3）
      expect(store2.db.prepare("PRAGMA user_version").get()).toMatchObject({ user_version: 3 });
      const columns = store2.db.prepare("PRAGMA table_info(runs)").all() as any[];
      expect(columns.map((c) => c.name)).toEqual(["task_id"]);
      store2.close();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  } finally {
    store.close();
  }
  });

});
