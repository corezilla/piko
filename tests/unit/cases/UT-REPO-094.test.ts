/**
 * Case ID: UT-REPO-094  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:225）
 * 维度坐标：`getTask` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-094.md（脚本的唯一依据）
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

describe("UT-REPO-094 · getTask · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long taskId as NotFound without writing anything", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：构造 `超长` 类输入——长度 2×上限（源码无比较常量，取默认上限 4096）的 taskId
      const overlong = "t".repeat(4096 * 2);

      // 步骤 2：调用 getTask(…)（store.ts:225）
      // 步骤 3：断言被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      // 实现对 `超长` 类的真实行为：taskId 是绑定参数，SQLite 不截断也不报错；
      // 这一行本来就不存在，所以按 `if (!r)` 走 NotFound（404）。
      let err: any;
      try { store.getTask(overlong); } catch (e) { err = e; }

      expect(err).toBeInstanceOf(PikoError);
      expect(err.code).toBe("NotFound");
      expect(err.status).toBe(404);
      expect(err.message).toBe("task not found");

      // 无状态写/资源残留：库里仍然没有这一行，也没有别的副作用
      expect((store.db.prepare("SELECT count(*) n FROM tasks").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
