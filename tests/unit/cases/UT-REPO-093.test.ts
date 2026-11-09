/**
 * Case ID: UT-REPO-093  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（store.ts:225）
 * 维度坐标：`getTask` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-093.md（脚本的唯一依据）
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

describe("UT-REPO-093 · getTask · 字符串/路径/枚举输入 × 空", () => {
  it("treats an empty taskId as an absent task, not as a valid key", async () => {
    const { PikoError } = await import("../../../src/types.js");
    const store = newStore();
    try {
      // 步骤 1：构造 `空` 类三态输入——空串 / 缺省(undefined) / 显式 null
      const empty = "";
      const missing = undefined as unknown as string;
      const explicitNull = null as unknown as string;

      // 步骤 2：调用 getTask(…)（store.ts:225）
      // 步骤 3：断言被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留
      // 实现对 `空` 类的真实行为：空串与 null 都是"库里没有这一行"，走同一条
      // `if (!r) throw new PikoError("NotFound", 404, ...)`；undefined 在到达
      // SQL 之前就被 node:sqlite 的绑定检查拒掉（TypeError，不是 PikoError）。
      let emptyErr: any;
      try { store.getTask(empty); } catch (e) { emptyErr = e; }
      expect(emptyErr).toBeInstanceOf(PikoError);
      expect(emptyErr.code).toBe("NotFound");
      expect(emptyErr.status).toBe(404);

      let nullErr: any;
      try { store.getTask(explicitNull); } catch (e) { nullErr = e; }
      expect(nullErr).toBeInstanceOf(PikoError);
      expect(nullErr.code).toBe("NotFound");
      expect(nullErr.status).toBe(404);

      let missingErr: any;
      try { store.getTask(missing); } catch (e) { missingErr = e; }
      expect(missingErr).toBeInstanceOf(TypeError);
      expect(missingErr.code).toBe("ERR_INVALID_ARG_TYPE");

      // 无状态写：三种输入都没有在 tasks/runs 留下任何行
      expect((store.db.prepare("SELECT count(*) n FROM tasks").get() as any).n).toBe(0);
      expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(0);
    } finally {
      store.close();
    }
  });

});
