/**
 * Case ID: UT-REPO-118  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:255）
 * 维度坐标：`getRun` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-118.md（脚本的唯一依据）
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

describe("UT-REPO-118 · getRun · 字符串/路径/枚举输入 × 注入字符", () => {

  it("reports NotFound for an injection-shaped task id and keeps the store intact", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的注入字符类——穿越串、SQL 元字符串
      const traversal = "../../etc/passwd";
      const injection = "' OR 1=1;--";

      // 步骤 2：调用 getRun(...) 两次
      let err1: any = null;
      try {
        store.getRun(traversal);
      } catch (e) {
        err1 = e;
      }
      let err2: any = null;
      try {
        store.getRun(injection);
      } catch (e) {
        err2 = e;
      }

      // 步骤 3：断言逐值对账——参数化绑定使注入串只是查不到，两次都 NotFound，库表完好
      expect((err1 as any).code).toBe("NotFound");
      expect((err2 as any).code).toBe("NotFound");
      expect(store.db.prepare("SELECT count(*) n FROM tasks").get()).toEqual({ n: 0 });
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='runs'").get()).toBeTruthy();
    } finally {
      store.close();
    }
  });

});
