/**
 * Case ID: UT-REPO-110  ·  STATUS: real
 *
 * 责任：throw L236 `FencedWrite`（守卫 `if (r.generation !== command.expected_g…`；store.ts）
 * 维度坐标：`mutateRun` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-110.md（脚本的唯一依据）
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
import { PikoError } from "../../../src/types.js";

describe("UT-REPO-110 · mutateRun · 错误路径 × 每个 typed 错误码", () => {

  it("throws FencedWrite with no partial write when the generation moved", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造触发 store.ts:236 处 throw 的输入——r.generation ≠ command.expected_generation
      accept(store, task("t-110"));
      const before = store.db.prepare("SELECT * FROM runs WHERE task_id='t-110'").get() as any;

      // 步骤 2：调用 mutateRun(…)
      let err: any = null;
      try {
        store.mutateRun({
          task_id: "t-110",
          expected_generation: 999,
          mutation: (r: any) => {
            r.state = "Completed";
          },
        });
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言——抛出 typed 错误，code 逐值等于 FencedWrite，消息可判别且无部分写入
      expect(err).toBeInstanceOf(PikoError);
      expect((err as any).code).toBe("FencedWrite");
      expect((err as any).status).toBe(409);
      expect((err as any).message).toBe("generation moved");
      const after = store.db.prepare("SELECT * FROM runs WHERE task_id='t-110'").get() as any;
      expect(after.state).toBe(before.state);
      expect(after.generation).toBe(before.generation);
      expect(after.last_activity_at).toBe(before.last_activity_at);

      // 步骤 4：断言内部错误不外泄为客户端码——对外仍是设计声明的 FencedWrite
      expect((err as any).code).not.toBe("InternalError");
      expect(store.generation("t-110")).toBe(1);
    } finally {
      store.close();
    }
  });

});
