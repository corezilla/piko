/**
 * Case ID: UT-REPO-066  ·  STATUS: real
 *
 * 责任：参数 `principal: string` 的 `注入字符` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-066.md（脚本的唯一依据）
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

describe("UT-REPO-066 · createOrGet · 字符串/路径/枚举输入 × 注入字符", () => {

  it("stores an injection-shaped principal verbatim without SQL injection", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 principal 的注入字符类——路径穿越串、控制字符与 SQL 元字符、超长＋注入组合串
      const traversal = "../../etc/passwd";
      const injection = "'; DROP TABLE tasks;--";
      const combined = "x".repeat(4096) + "'; DELETE FROM runs;--";

      // 步骤 2：调用 createOrGet(...)
      const a = store.createOrGet(task("co-066-a"), traversal, 10);
      const b = store.createOrGet(task("co-066-b"), injection, 10);
      const c = store.createOrGet(task("co-066-c"), combined, 10);

      // 步骤 3：断言逐值对账——参数化绑定让注入串只作为字面 principal 存下，库表完好
      expect([a.kind, b.kind, c.kind]).toEqual(["created", "created", "created"]);
      expect(
        (store.db.prepare("SELECT owner_principal FROM tasks WHERE task_id=?").get("co-066-a") as any)
          .owner_principal,
      ).toBe(traversal);
      expect(
        (store.db.prepare("SELECT owner_principal FROM tasks WHERE task_id=?").get("co-066-b") as any)
          .owner_principal,
      ).toBe(injection);
      expect(
        (store.db.prepare("SELECT owner_principal FROM tasks WHERE task_id=?").get("co-066-c") as any)
          .owner_principal,
      ).toBe(combined);
      expect(store.db.prepare("SELECT count(*) n FROM tasks").get()).toEqual({ n: 3 });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 3 });
    } finally {
      store.close();
    }
  });

});
