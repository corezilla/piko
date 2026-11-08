/**
 * Case ID: UT-TRANSFER-248  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `边界(上/下/零/空/满)` 类（transfer.ts:42）
 * 维度坐标：`Transfer.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TRANSFER`）
 * 用例文档：docs/70_verification/unit/cases/UT-TRANSFER-248.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { splitRemoteCommand, createRemoteBashTool } from "../../../src/remote-exec-tools.js";
import { execRemote, truncate } from "../../../src/remote-exec.js";
import { Transfer, safeJoin } from "../../../src/transfer.js";
import { config, fakeSpawn, fakeTransfer } from "./support/transfer-fix.js";

describe("UT-TRANSFER-248 · Transfer.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds a config with an empty staging root", async () => {
    const store = { transfer: { staging_root: "" }, workspace: { staging_root: "", roots: {} } };
    const transfer = new Transfer(config(store) as never);
    try {
      // 步骤 2：调用 fetchInputs（无输入 → 不建目录）
      const result = await transfer.fetchInputs("t-1", []);

      // 步骤 3：断言状态为 none
      expect(result.state).toBe("none");
    } finally {
      transfer.close();
    }
  });

});
