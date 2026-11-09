/**
 * Case ID: UT-REPO-095  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:225）
 * 维度坐标：`getTask` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-095.md（脚本的唯一依据）
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

describe("UT-REPO-095 · getTask · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats traversal and SQL-injection shaped taskIds as plain absent keys", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：构造 `注入字符` 类输入——穿越串 / 控制字符＋SQL 元字符串 / 超长＋注入组合串
      const traversal = "../../etc/passwd";
      const injection = "t'; DROP TABLE tasks;--\u0001\n";
      const combo = "t".repeat(4096) + "' OR '1'='1";
      const nasty = [traversal, injection, combo];

      // 步骤 2：调用 getTask(…)（store.ts:225）
      // 步骤 3：断言被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      // 实现对 `注入字符` 类的真实行为：taskId 走参数绑定，注入串只是普通字符串；
      // 查不到行时统一抛 NotFound（404），既不执行注入，也不落任何状态。
      for (const id of nasty) {
        let err: any;
        try { store.getTask(id); } catch (e) { err = e; }
        expect(err).toBeInstanceOf(PikoError);
        expect(err.code).toBe("NotFound");
        expect(err.status).toBe(404);
      }

      // 表结构与行数不受影响（注入串没有被执行）
      expect((store.db.prepare("SELECT count(*) n FROM tasks").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
