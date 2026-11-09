/**
 * Case ID: UT-REPO-140  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（store.ts:295）
 * 维度坐标：`setArtifactDelivery` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-140.md（脚本的唯一依据）
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

describe("UT-REPO-140 · setArtifactDelivery · 字符串/路径/枚举输入 × 注入字符", () => {

  it("reports TaskNotFound for an injection-shaped task id without touching the table", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的注入字符类——穿越串、SQL 元字符串
      const traversal = "../../etc/passwd";
      const injection = "'; DROP TABLE runs;--";

      // 步骤 2：调用 setArtifactDelivery(...) 两次
      let err1: any = null;
      try {
        store.setArtifactDelivery(traversal, { state: "none", delivered: [], failed: [] });
      } catch (e) {
        err1 = e;
      }
      let err2: any = null;
      try {
        store.setArtifactDelivery(injection, { state: "none", delivered: [], failed: [] });
      } catch (e) {
        err2 = e;
      }

      // 步骤 3：断言逐值对账——参数化绑定使注入串不匹配任何行，两次都 TaskNotFound，runs 表完好
      expect((err1 as any).code).toBe("TaskNotFound");
      expect((err2 as any).code).toBe("TaskNotFound");
      expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name='runs'").get()).toBeTruthy();
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
