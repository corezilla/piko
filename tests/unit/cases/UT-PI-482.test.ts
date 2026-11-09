/**
 * Case ID: UT-PI-482  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `非法值` 类（pi-runtime.ts:43）
 * 维度坐标：`initialPrompt` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-482.md（脚本的唯一依据）
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

describe("UT-PI-482 · initialPrompt · 纯函数/无副作用 × 非法值", () => {
  it("does not validate the task", async () => {
    // 步骤 2：调用 initialPrompt（task 是字符串）
    const prompt = initialPrompt("not-a-task" as never, undefined, 1000);

    // 步骤 3：断言返回值逐值对账——该参数不校验，指令取其 undefined
    expect((prompt as { content: { text: string }[] }).content[0]?.text).toBeUndefined();
  });

});
