/**
 * Case ID: UT-REPO-063  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `非法值` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-063.md（脚本的唯一依据）
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

describe("UT-REPO-063 · createOrGet · 纯函数/无副作用 × 非法值", () => {

  it("rejects an illegal task_id without writing any row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 task 的非法值类——task_id 为 undefined 与 null
      const undefinedId = task(undefined as unknown as string);
      const nullId = task(null as unknown as string);

      // 步骤 2：调用 createOrGet(...)
      let undefinedErr: any = null;
      try {
        store.createOrGet(undefinedId, "slinky", 10);
      } catch (e) {
        undefinedErr = e;
      }
      let nullErr: any = null;
      try {
        store.createOrGet(nullId, "slinky", 10);
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言被拒绝且无状态写残留。
      // 实现无显式入参校验：undefined 由 node:sqlite 绑定阶段抛原生 TypeError，
      // null 由 tasks.task_id 的 NOT NULL 约束抛原生 SQLite 错误——都不是 PikoError，
      // 故断言原生错误事实而非 ISD 错误表里的 typed 码。
      expect(undefinedErr).toBeInstanceOf(TypeError);
      expect(String(undefinedErr.message)).toContain("cannot be bound to SQLite parameter");
      expect(nullErr).toBeInstanceOf(Error);
      expect(String(nullErr.message)).toContain("NOT NULL constraint failed");
      expect(store.db.prepare("SELECT count(*) n FROM tasks").get()).toEqual({ n: 0 });
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
