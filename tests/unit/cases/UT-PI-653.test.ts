/**
 * Case ID: UT-PI-653  ·  STATUS: real
 *
 * 责任：分支 L275 `? context.docs.length > 0 :`（ternary；skill-prefetch.ts）
 * 维度坐标：`renderSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-653.md（脚本的唯一依据）
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

describe("UT-PI-653 · renderSkillContext · 状态分支 × 合法迁移", () => {
  it("renders the doc entries when there are some", async () => {
    // 步骤 2：调用 renderSkillContext（文档有内容）
    const text = renderSkillContext({
      memory: [],
      docs: [{ id: "d1", content: "doc" }],
      memoryQuery: "q",
      docsQuery: "q",
      sources: { memory: "empty", docs: "ok" },
    } as never);

    // 步骤 3：断言返回值逐值对账——文档被渲染出来
    expect(text).toContain("--- Project docs (1 found) ---");
    expect(text).toContain("doc");
  });

});
