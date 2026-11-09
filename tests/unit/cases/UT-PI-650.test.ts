/**
 * Case ID: UT-PI-650  ·  STATUS: real
 *
 * 责任：分支 L265 `if (context.skipped)`（if；skill-prefetch.ts）
 * 维度坐标：`renderSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-650.md（脚本的唯一依据）
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

describe("UT-PI-650 · renderSkillContext · 状态分支 × 合法迁移", () => {
  it("renders the skip reason", async () => {
    // 步骤 2：调用 renderSkillContext（带 skipped）
    const text = renderSkillContext({
      memory: [],
      docs: [],
      memoryQuery: "",
      docsQuery: "",
      skipped: "no_backends",
      sources: { memory: "skipped", docs: "skipped" },
    } as never);

    // 步骤 3：断言返回值逐值对账——跳过原因被写出来，且不再渲染两节
    expect(text).toContain("(skipped: no_backends)");
    expect(text).not.toContain("Prior experience");
  });

});
