/**
 * Case ID: UT-REPO-213  ·  STATUS: real
 *
 * 责任：返回站点 L417 值 `(this.db.prepare("SELECT task_id FROM r…` 逐值断言（store.ts）
 * 维度坐标：`scanNonTerminal` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-213.md（脚本的唯一依据）
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

describe("UT-REPO-213 · scanNonTerminal · 纯函数/无副作用 × 每等价类合法值", () => {
  it("lists every non-terminal run ordered by acceptance time", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:417 的返回站点被到达的输入——三条已受理的 run，
      //         并把其中一条推进到终态
      accept(store, task("t-213a"));
      accept(store, task("t-213b"));
      accept(store, task("t-213c"));
      store.db.prepare("UPDATE runs SET state='Completed' WHERE task_id='t-213b'").run();

      // 步骤 2：调用 scanNonTerminal()
      const scanned = store.scanNonTerminal();

      // 步骤 3：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
      expect(Array.isArray(scanned)).toBe(true);
      expect(scanned).toEqual(["t-213a", "t-213c"]);
      expect(scanned.every((id) => typeof id === "string")).toBe(true);
      // 终态 run 被排除
      expect(scanned).not.toContain("t-213b");
      // 无未声明副作用：扫描不改任何行
      expect(store.generation("t-213a")).toBe(1);
      expect(store.getRun("t-213b").state).toBe("Completed");
      // 全部终态时返回空数组
      store.db.prepare("UPDATE runs SET state='Failed' WHERE task_id='t-213a'").run();
      store.db.prepare("UPDATE runs SET state='Cancelled' WHERE task_id='t-213c'").run();
      expect(store.scanNonTerminal()).toEqual([]);
    } finally {
      store.close();
    }
  });

});
