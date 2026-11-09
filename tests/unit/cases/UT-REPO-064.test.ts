/**
 * Case ID: UT-REPO-064  ·  STATUS: real
 *
 * 责任：参数 `principal: string` 的 `空` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-064.md（脚本的唯一依据）
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

describe("UT-REPO-064 · createOrGet · 字符串/路径/枚举输入 × 空", () => {

  it("handles the three empty states of principal", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 principal 的空类三态——''（空串）、undefined（缺省）、null（显式空值）
      // 步骤 2：调用 createOrGet(...)
      const emptyString = store.createOrGet(task("co-064-a"), "", 10);
      let undefinedErr: any = null;
      try {
        store.createOrGet(task("co-064-b"), undefined as unknown as string, 10);
      } catch (e) {
        undefinedErr = e;
      }
      let nullErr: any = null;
      try {
        store.createOrGet(task("co-064-c"), null as unknown as string, 10);
      } catch (e) {
        nullErr = e;
      }

      // 步骤 3：断言逐值对账。
      // 实现无 principal 校验：'' 被接受并原样落库；undefined/null 在 SQLite 绑定／
      // NOT NULL 约束处被拒（原生错误，非 PikoError），且失败事务不留行。
      expect(emptyString.kind).toBe("created");
      expect(
        (store.db.prepare("SELECT owner_principal FROM tasks WHERE task_id=?").get("co-064-a") as any)
          .owner_principal,
      ).toBe("");
      expect(undefinedErr).toBeInstanceOf(TypeError);
      expect(nullErr).toBeInstanceOf(Error);
      expect(String(nullErr.message)).toContain("NOT NULL constraint failed");
      expect(store.db.prepare("SELECT count(*) n FROM tasks").get()).toEqual({ n: 1 });
    } finally {
      store.close();
    }
  });

});
