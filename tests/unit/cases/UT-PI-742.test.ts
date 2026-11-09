/**
 * Case ID: UT-PI-742  ·  STATUS: real
 *
 * 责任：返回站点 L160 值 `undefined` 逐值断言（tool-exec-policy.ts）
 * 维度坐标：`parseExecutable` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-742.md（脚本的唯一依据）
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

describe("UT-PI-742 · parseExecutable · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined when no executable can be identified", async () => {
    // 步骤 2：调用 parseExecutable（只有环境变量赋值）
    // 步骤 3：断言返回值逐值对账
    expect(parseExecutable("FOO=1")).toBeUndefined();
  });

});
