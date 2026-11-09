/**
 * Case ID: UT-PI-639  ·  STATUS: real
 *
 * 责任：参数 `entry: GraphRAGSearchResult` 的 `非法值` 类（skill-prefetch.ts:249）
 * 维度坐标：`renderDocEntry` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-639.md（脚本的唯一依据）
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
import {
  cacheKey,
  clearPrefetchCache,
  prefetchCacheSize,
  prefetchSkillContext,
  renderDocEntry,
  renderMemoryEntry,
  renderSkillContext,
  withTimeout,
} from "../../../src/skill-prefetch.js";
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-639 · renderDocEntry · 纯函数/无副作用 × 非法值", () => {
  it("does not validate the entry", async () => {
    // 步骤 2：调用 renderDocEntry（entry 是字符串）
    const line = renderDocEntry("not-an-entry" as never);

    // 步骤 3：断言返回值逐值对账——该参数不校验，来源与正文都回退到空，
    //         故来源为空即不写 "source: " 前缀
    expect(line).toBe("- ");
  });

});
