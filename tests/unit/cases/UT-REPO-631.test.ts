/**
 * Case ID: UT-REPO-631  ·  STATUS: real
 *
 * 责任：throw L800 `ResultUnavailable`（守卫 `unconditional`；store.ts）
 * 维度坐标：`result` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-631.md（脚本的唯一依据）
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

describe("UT-REPO-631 · result · 错误路径 × 每个 typed 错误码", () => {

  it("throws a typed ResultUnavailable for a terminal run with no stored result", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：构造触发 store.ts:800 处 throw 的输入——run 已进入终态，但 results 表里没有对应的行
      accept(store, task("t1"));
      store.db.prepare("UPDATE runs SET state='Failed', finished_at='2026-11-09T00:00:00.000Z' WHERE task_id='t1'").run();

      // 步骤 2：调用 result(…)
      let err: any = null;
      try {
        store.result("t1");
      } catch (e) {
        err = e;
      }

      // 步骤 3：断言消息可判别、含建议动作，且无部分写入（状态写/资源/持久化均未发生）
      expect(err).not.toBeNull();
      expect(err).toBeInstanceOf(PikoError);
      expect(err.code).toBe("ResultUnavailable");
      expect(err.status).toBe(500);
      expect(err.message).toBe("terminal result missing");
      expect((store.db.prepare("SELECT count(*) n FROM results").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT state FROM runs WHERE task_id='t1'").get() as any).state).toBe("Failed");

      // 步骤 4：断言内部错误不上抛为客户端码（保真传播）——错误码原样为 ResultUnavailable，未被包装
      expect(err.code).toBe("ResultUnavailable");
      expect(err.constructor.name).toBe("PikoError");
    } finally {
      store.close();
    }
  });

});
