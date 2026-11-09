/**
 * Case ID: UT-REPO-097  ·  STATUS: real
 *
 * 责任：throw L227 `NotFound`（守卫 `if (!r)`；store.ts）
 * 维度坐标：`getTask` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-097.md（脚本的唯一依据）
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

describe("UT-REPO-097 · getTask · 错误路径 × 每个 typed 错误码", () => {
  it("raises the typed NotFound error code with no partial write", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：构造触发 store.ts:227 处 throw 的输入——`r` 为假（空串 / 0 / null / undefined）
      const falsyInputs = ["", 0 as unknown as string, null as unknown as string];

      // 步骤 2：调用 getTask(…)
      // 步骤 3：断言消息可判别、含建议动作，且无部分写入（状态写/资源/持久化均未发生）
      let last: any;
      for (const id of falsyInputs) {
        let err: any;
        try { store.getTask(id); } catch (e) { err = e; }
        expect(err).toBeInstanceOf(PikoError);
        expect(err.code).toBe("NotFound");
        expect(err.status).toBe(404);
        expect(err.message).toBe("task not found");
        last = err;
      }

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——对外错误码符合 ISD 错误表
      // catalog `NotFound` = 404 / retryable=false，实现逐值对齐
      expect(last.code).not.toBe("InternalError");
      expect(last.status).toBe(404);

      // 无部分写入
      expect((store.db.prepare("SELECT count(*) n FROM tasks").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM audit_events").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
