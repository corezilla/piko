/**
 * Case ID: UT-PI-645  ·  STATUS: real
 *
 * 责任：分支 L252 `? source :`（ternary；skill-prefetch.ts）
 * 维度坐标：`renderDocEntry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-645.md（脚本的唯一依据）
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

describe("UT-PI-645 · renderDocEntry · 状态分支 × 合法迁移", () => {
  it("omits the source when there is none", async () => {
    // 步骤 2：调用 renderDocEntry（来源全空）
    const line = renderDocEntry({ id: "", content: "body" } as never);

    // 步骤 3：断言返回值逐值对账——来源为空就只留正文
    expect(line).toBe("- body");
  });

});
