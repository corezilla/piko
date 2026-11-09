/**
 * Case ID: UT-REPO-098  ·  STATUS: real
 *
 * 责任：返回站点 L228 值 `JSON.parse(r.task_json)` 逐值断言（store.ts）
 * 维度坐标：`getTask` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-098.md（脚本的唯一依据）
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

describe("UT-REPO-098 · getTask · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the stored task definition parsed back from task_json", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:228 的返回站点被到达的输入——一条合法受理的任务
      const definition = task("t-1", { instruction: "do the thing" });
      accept(store, definition);

      // 步骤 2：调用 getTask(…)
      const got = store.getTask("t-1");

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(got).toEqual(definition);
      expect(Object.keys(got)).toEqual(Object.keys(definition));
      expect(got.task_id).toBe("t-1");
      expect(got.instruction).toBe("do the thing");
      expect(got.permissions.tool_profile_ref).toBe("workspace-standard");

      // 无未声明副作用：getTask 只读
      expect((store.db.prepare("SELECT count(*) n FROM tasks").get() as any).n).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
