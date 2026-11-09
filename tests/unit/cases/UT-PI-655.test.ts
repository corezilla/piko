/**
 * Case ID: UT-PI-655  ·  STATUS: real
 *
 * 责任：返回站点 L267 值 `parts.join("")` 逐值断言（skill-prefetch.ts）
 * 维度坐标：`renderSkillContext` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-655.md（脚本的唯一依据）
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

describe("UT-PI-655 · renderSkillContext · 纯函数/无副作用 × 每等价类合法值", () => {
  it("joins the skipped parts", async () => {
    // 步骤 2：调用 renderSkillContext（带 skipped）
    const text = renderSkillContext({
      memory: [],
      docs: [],
      memoryQuery: "",
      docsQuery: "",
      skipped: "disabled",
      sources: { memory: "skipped", docs: "skipped" },
    } as never);

    // 步骤 3：断言返回值逐值对账——只有一段
    expect(text).toBe("\n=== Context ===\n(skipped: disabled)");
  });

});
