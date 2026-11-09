/**
 * Case ID: UT-REPO-139  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（store.ts:295）
 * 维度坐标：`setArtifactDelivery` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-139.md（脚本的唯一依据）
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

describe("UT-REPO-139 · setArtifactDelivery · 字符串/路径/枚举输入 × 超长", () => {

  it("reports TaskNotFound for an over-long task id", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 taskId 的超长类——长度 2×4096＝8192
      const long = "t".repeat(8192);

      // 步骤 2：调用 setArtifactDelivery(long, delivery)
      let err: any = null;
      try {
        store.setArtifactDelivery(long, { state: "none", delivered: [], failed: [] });
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言逐值对账——实现无长度校验，超长串只是没有匹配行，抛 TaskNotFound
      expect((err as any).code).toBe("TaskNotFound");
      expect((err as any).status).toBe(404);
      expect(store.db.prepare("SELECT count(*) n FROM runs").get()).toEqual({ n: 0 });
    } finally {
      store.close();
    }
  });

});
