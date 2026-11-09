/**
 * Case ID: UT-REPO-065  ·  STATUS: real
 *
 * 责任：参数 `principal: string` 的 `超长` 类（store.ts:183）
 * 维度坐标：`createOrGet` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-065.md（脚本的唯一依据）
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

describe("UT-REPO-065 · createOrGet · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-long principal verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 principal 的超长类——长度 2×4096＝8192（源码无比较常量，取上限 4096 的两倍）
      const long = "p".repeat(8192);

      // 步骤 2：调用 createOrGet(...)
      const outcome = store.createOrGet(task("co-065"), long, 10);

      // 步骤 3：断言逐值对账——实现对 principal 无长度校验，超长值被原样持久化
      expect(outcome.kind).toBe("created");
      const stored = (store.db.prepare("SELECT owner_principal FROM tasks WHERE task_id=?").get("co-065") as any)
        .owner_principal;
      expect(stored).toBe(long);
      expect(stored.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
