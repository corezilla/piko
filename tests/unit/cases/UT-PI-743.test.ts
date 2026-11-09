/**
 * Case ID: UT-PI-743  ·  STATUS: real
 *
 * 责任：返回站点 L165 值 `name.length > 0 ? name : undefined` 逐值断言（tool-exec-policy.ts）
 * 维度坐标：`parseExecutable` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-743.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import {
  PolicyViolationError,
  currentAllowlist,
  enterNetworkScope,
  exitNetworkScope,
  installNetworkPolicy,
  makePolicyFetch,
  restoreNetworkPolicy,
} from "../../../src/tool-host-policy.js";
import {
  ExecPolicyViolationError,
  assertExecutablesAllowed,
  assertRemoteExecutableAllowed,
  parseExecutable,
  parseExecutables,
  splitCommands,
  tokenize,
} from "../../../src/tool-exec-policy.js";
import {
  buildSystemPrompt,
  discussionMessage,
  initialPrompt,
  isProviderUnavailableMessage,
  normalizeRawUsage,
} from "../../../src/pi-runtime.js";
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-743 · parseExecutable · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the stripped name", async () => {
    // 步骤 2：调用 parseExecutable（带引号的路径）
    // 步骤 3：断言返回值逐值对账——引号与路径都被去掉
    expect(parseExecutable("'/usr/bin/python3'")).toBe("python3");
  });

});
