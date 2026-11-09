/**
 * Case ID: UT-REPO-096  ·  STATUS: real
 *
 * 责任：分支 L227 `!r`（!；store.ts）
 * 维度坐标：`getTask` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-096.md（脚本的唯一依据）
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

describe("UT-REPO-096 · getTask · 状态分支 × 合法迁移", () => {
  it("takes the NotFound branch for an absent task and the return branch for a present one", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:227 的分支（!：`!r`）取真的输入——库里没有这一行
      accept(store, task("present"));
      const absent = "never-accepted";

      // 步骤 2：调用 getTask(…) 并断言该侧可观测结果与设计一致
      let err: any;
      try { store.getTask(absent); } catch (e) { err = e; }
      expect(err).toBeInstanceOf(PikoError);
      expect(err.code).toBe("NotFound");

      // 步骤 3：构造使该分支取假的输入——行存在
      // 步骤 4：再次调用 getTask(…) 并断言取假侧结果；两侧都必须被观测到
      const got = store.getTask("present");
      expect(got.task_id).toBe("present");
      expect(got.instruction).toBe("run");
      // 取假侧不发生块内副作用（没有抛错，也没有写入）
      expect((store.db.prepare("SELECT count(*) n FROM tasks").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
