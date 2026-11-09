/**
 * Case ID: UT-REPO-292  ·  STATUS: real
 *
 * 责任：参数 `effect: string` 的 `超长` 类（store.ts:456）
 * 维度坐标：`reserveTool` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-292.md（脚本的唯一依据）
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

describe("UT-REPO-292 · reserveTool · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long effect string and stores it verbatim", async () => {
    const store = newStore();
    try {
      accept(store, task("t-292"));
      const longEffect = "E".repeat(2 * 4096);

      // 步骤 1：按 `超长` 类构造参数 effect——长度 2×上限（源码无比较常量，取缺省上限 4096 → 8192）；
      //         其余参数取合法等价类
      // 步骤 2：调用 reserveTool(…)
      const admitted = store.reserveTool("t-292", "op", "tc-292", "name", longEffect, "safe");

      // 步骤 3：断言——实现无长度校验：超长 effect 不被拒绝，原样落库，长度逐值对账
      expect(admitted).toBe("Admitted");
      const row = store.db.prepare("SELECT length(effect) le, tool_name FROM tool_calls").get() as any;
      expect(row.le).toBe(8192);
      expect(row.tool_name).toBe("name");
      expect((store.db.prepare("SELECT count(*) n FROM tool_calls").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
