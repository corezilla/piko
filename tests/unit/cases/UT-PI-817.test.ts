/**
 * Case ID: UT-PI-817  ·  STATUS: real
 *
 * 责任：返回站点 L81 值 `segments .map((part) => part.replace(/[…` 逐值断言（tool-exec-policy.ts）
 * 维度坐标：`splitCommands` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-817.md（脚本的唯一依据）
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

describe("UT-PI-817 · splitCommands · 纯函数/无副作用 × 每等价类合法值", () => {
  it("drops the trailing separators from each segment", async () => {
    // 步骤 2：调用 splitCommands（段尾带分隔符）
    const segments = splitCommands("ls ; rm ;");

    // 步骤 3：断言返回值逐值对账——段尾的分隔符被去掉，空段被过滤
    expect(segments).toEqual(["ls", "rm"]);
  });

});
