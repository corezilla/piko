/**
 * Case ID: UT-REPO-621  ·  STATUS: real
 *
 * 责任：throw L783 `NotFound`（守卫 `if (!r)`；store.ts）
 * 维度坐标：`finishQueued` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-621.md（脚本的唯一依据）
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

describe("UT-REPO-621 · finishQueued · 错误路径 × 每个 typed 错误码", () => {
  it("throws NotFound for an unknown task and writes no result or run row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造触发 store.ts:783 处 throw 的输入——`r` 为假（查不到 runs 行）
      // 步骤 2：调用 finishQueued(…)
      let err: any = null;
      try {
        store.finishQueued(result("t-621-missing"));
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别、含建议动作，且无部分写入（状态写/资源/持久化均未发生）
      expect(err?.code).toBe("NotFound");
      expect(err?.status).toBe(404);
      expect(err?.message).toBe("run not found");
      expect(err?.constructor?.name).toBe("PikoError");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(0);

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——对外错误码就是 ISD 的 NotFound/404
      expect(err?.code).toBe("NotFound");
      expect(err?.status).toBe(404);
    } finally {
      store.close();
    }
  });

});
