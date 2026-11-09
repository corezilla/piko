/**
 * Case ID: UT-REPO-109  ·  STATUS: real
 *
 * 责任：throw L235 `NotFound`（守卫 `if (!r)`；store.ts）
 * 维度坐标：`mutateRun` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-109.md（脚本的唯一依据）
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

describe("UT-REPO-109 · mutateRun · 错误路径 × 每个 typed 错误码", () => {

  it("throws a typed NotFound for an unknown run and writes nothing", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：构造触发 store.ts:235 处 throw 的输入——task_id 对应的 run 行不存在
      accept(store, task("t1"));

      // 步骤 2：调用 mutateRun(…)
      let err: any = null;
      try {
        store.mutateRun({ task_id: "no-such-task", expected_generation: 1, mutation: () => {} });
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别、含建议动作，且无部分写入（状态写/资源/持久化均未发生）
      expect(err).not.toBeNull();
      expect(err).toBeInstanceOf(PikoError);
      expect(err.code).toBe("NotFound");
      expect(err.status).toBe(404);
      expect(err.message).toBe("run not found");
      expect(store.generation("t1")).toBe(1);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——错误码原样为 NotFound，未被包装成别的 code
      expect(err.code).toBe("NotFound");
      expect(err.constructor.name).toBe("PikoError");
    } finally {
      store.close();
    }
  });

});
