/**
 * Case ID: UT-PI-651  ·  STATUS: real
 *
 * 责任：分支 L271 `? context.memory.length > 0 :`（ternary；skill-prefetch.ts）
 * 维度坐标：`renderSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-651.md（脚本的唯一依据）
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

describe("UT-PI-651 · renderSkillContext · 状态分支 × 合法迁移", () => {
  it("renders the memory entries when there are some", async () => {
    // 步骤 2：调用 renderSkillContext（记忆有内容）
    const text = renderSkillContext({
      memory: [{ id: "m1", memory: "prior" }],
      docs: [],
      memoryQuery: "q",
      docsQuery: "q",
      sources: { memory: "ok", docs: "empty" },
    } as never);

    // 步骤 3：断言返回值逐值对账——记忆被渲染出来
    expect(text).toContain("--- Prior experience (1 found) ---");
    expect(text).toContain("prior");
  });

});
