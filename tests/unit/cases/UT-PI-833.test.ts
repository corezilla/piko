/**
 * Case ID: UT-PI-833  ·  STATUS: real
 *
 * 责任：返回站点 L140 值 `tokens` 逐值断言（tool-exec-policy.ts）
 * 维度坐标：`tokenize` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-833.md（脚本的唯一依据）
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

describe("UT-PI-833 · tokenize · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the tokens it collected", async () => {
    // 步骤 2：调用 tokenize
    // 步骤 3：断言返回值逐值对账——词表逐个对账
    expect(tokenize("python3 -c 'import os'")).toEqual(["python3", "-c", "import os"]);
  });

});
