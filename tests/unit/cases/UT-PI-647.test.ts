/**
 * Case ID: UT-PI-647  ·  STATUS: real
 *
 * 责任：参数 `context: PrefetchedSkillContext` 的 `每等价类合法值` 类（skill-prefetch.ts:262）
 * 维度坐标：`renderSkillContext` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-647.md（脚本的唯一依据）
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

describe("UT-PI-647 · renderSkillContext · 纯函数/无副作用 × 每等价类合法值", () => {
  it("renders both sections", async () => {
    // 步骤 2：调用 renderSkillContext
    const text = renderSkillContext({
      memory: [{ id: "m1", memory: "prior" }],
      docs: [{ id: "d1", content: "doc" }],
      memoryQuery: "q",
      docsQuery: "q",
      sources: { memory: "ok", docs: "ok" },
    } as never);

    // 步骤 3：断言返回值逐值对账——两节都在，条数也对
    expect(text).toContain("=== Context ===");
    expect(text).toContain("--- Prior experience (1 found) ---");
    expect(text).toContain("--- Project docs (1 found) ---");
  });

});
