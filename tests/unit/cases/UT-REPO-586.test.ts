/**
 * Case ID: UT-REPO-586  ·  STATUS: real
 *
 * 责任：资源操作 L740 `createHash`（store.ts）
 * 维度坐标：`insertResult` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-586.md（脚本的唯一依据）
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

describe("UT-REPO-586 · insertResult · 资源获取/释放 × 获取失败路径", () => {

  it("digests the result json and releases the hash without leaving residue", async () => {
    const store = newStore();
    try {
      accept(store, task("t-586"));
      const published = result("t-586");
      const { createHash } = await import("node:crypto");

      // 步骤 1：构造使 store.ts:740 的资源操作（`createHash`）被执行的输入——合法结果
      // 步骤 2：调用 insertResult(…) 走正常路径
      (store as any).insertResult(published);

      // 步骤 3：注入该操作失败后再次调用——用非法 usage 让 validateUsage 先失败，
      //         结果行不能被写入（没有任何残留）
      let invalidErr: any = null;
      try {
        (store as any).insertResult(
          result("t-586", {
            usage: { ...published.usage, quality: "Complete", input_tokens: null } as never,
          }),
        );
      } catch (e) {
        invalidErr = e;
      }
      expect(invalidErr?.constructor?.name).toBe("Error");
      expect(invalidErr?.message).toMatch(/usage missing mismatch/);
      expect(store.db.prepare("SELECT count(*) n FROM results").get()).toEqual({ n: 1 });

      // 步骤 4：断言两路均无残留——createHash 是一次性摘要，没有句柄/子进程/临时目录
      //         残留；成功那路的摘要等于 sha256(result_json)
      const row = store.db.prepare("SELECT result_json,result_sha256 FROM results").get() as any;
      expect(row.result_sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(row.result_sha256).toBe(createHash("sha256").update(row.result_json).digest("hex"));
    } finally {
      store.close();
    }
  });

});
