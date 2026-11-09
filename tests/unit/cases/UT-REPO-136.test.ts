/**
 * Case ID: UT-REPO-136  ·  STATUS: real
 *
 * 责任：throw L293 `TaskNotFound`（守卫 `if (r.changes === 0)`；store.ts）
 * 维度坐标：`setInputStaging` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-136.md（脚本的唯一依据）
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

describe("UT-REPO-136 · setInputStaging · 错误路径 × 每个 typed 错误码", () => {
  it("throws a typed TaskNotFound when the UPDATE matched no row", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造触发 store.ts:293 处 throw 的输入——令 r.changes ＝ 0（task_id 匹配不到行）；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用被测符号（预期被拒绝 → 抛错）
            let err: any = null;
            try {
              store.setInputStaging("ghost-task", { state: "none", fetched: [], failed: [] });
            } catch (e) {
              err = e;
            }
      // 步骤 3：断言——typed 错误逐值对账，且无状态写/资源残留
            expect(err).not.toBeNull();
      expect(err.code).toBe("TaskNotFound");
            expect(err.status).toBe(404);
            // 消息可判别（含固定措辞）
            expect(err.message).toBe("staging reported for unknown task ghost-task");
            // 无部分写入：runs 行数不变，t1 的 staging 未被改动
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
            expect((store.db.prepare("SELECT input_staging_json FROM runs WHERE task_id='t1'").get() as any).input_staging_json).toBe(
              JSON.stringify({ state: "none", fetched: [], failed: [] }),
            );
    } finally {
      store.close();
    }
  });

});
