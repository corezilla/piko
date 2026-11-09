/**
 * Case ID: UT-PI-474  ·  STATUS: real
 *
 * 责任：参数 `turn: DiscussionTurn` 的 `非法值` 类（pi-runtime.ts:42）
 * 维度坐标：`discussionMessage` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-474.md（脚本的唯一依据）
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

describe("UT-PI-474 · discussionMessage · 纯函数/无副作用 × 非法值", () => {
  it("does not validate the turn", async () => {
    // 步骤 1：造一条字段类型不对的讨论轮次
const turn = (over: Record<string, unknown> = {}) => ({
  event_id: "$e1",
  turn_seq: 1,
  status: "Pending",
  visible_content: "the visible content",
  ...over,
});
    // 步骤 2：调用 discussionMessage（turn_seq 是字符串）
    const message = discussionMessage(turn({ turn_seq: "one" }) as never, 1000);

    // 步骤 3：断言返回值逐值对账——该参数不校验；消息只带 event_id
    //         与可见内容，turn_seq 不进消息
    expect(message.role).toBe("custom");
    expect(JSON.stringify(message)).toContain("$e1");
    expect(JSON.stringify(message)).not.toContain("one");
  });

});
