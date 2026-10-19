// scripts/mock-graphrag.ts — minimal local mock matching GraphRAG HTTP contract.
//
// V0.1.1: Seeds a small corpus of piko design docs + STD template
// references so a software_engineer agent has context to recall when
// writing piko code. Disable seeds via MOCK_GRAPH_SEED=0.
//
// Run: MOCK_GRAPH_PORT=8765 tsx scripts/mock-graphrag.ts
// Then point piko at:
//   MEM0_BASE_URL=http://127.0.0.1:9999  (mock-mem0)
//   identity.doc_search.base_url=http://127.0.0.1:8765  (this file)
//
// POST /v1/search  → { results: GraphRAGSearchResult[] }
//
// Each result exposes the source chunk (`metadata.section`,
// `metadata.doc`) so the agent can cite where it learned from.

import http from "node:http";

interface Chunk {
  id: string;
  content: string;
  scope: string;
  metadata: Record<string, any>;
}

const CORPUS: Chunk[] = [
  {
    id: "piko-skill-memory-mech-1",
    scope: "piko-design-docs",
    content:
      "## V0.1 Skill Experience\n\nPiko agent通过对接外部agent记忆系统（Mem0）获得职业技能经验的持久化能力。" +
      "每个 role（developer / tester / PM）只记录自己工作相关的经验，下次执行任务时可以查这些经验，避免重复踩坑。\n\n" +
      "经验 ≠ 角色行为：经验是具体问题+教训；行为是通用方法论（V2+ 训练）。\n\n" +
      "两个工具：`mem0_lookup(query)` / `mem0_record(content, tags?)`。\n" +
      "Per-role 隔离，user_id 形如 `${role}:${project}`。",
    metadata: { doc: "docs/20_system_design/mechanisms/piko-skill-memory.md", section: "1.2 / 3.2", chunk: 1 },
  },
  {
    id: "piko-skill-memory-mech-2",
    scope: "piko-design-docs",
    content:
      "## Day-1 验证清单（V0.1 立项否决线）\n\n" +
      "1. per-role 隔离：tester:piko写入memory，developer:piko是否真看不到。失败则V0.1立项否决。\n" +
      "2. metadata 保留：写入 type / role / tags，search回来是否一致。\n" +
      "3. filters 字段：能否精确按metadata过滤。\n" +
      "4. infer 自动抽取：行为是否稳定。\n" +
      "5. 部署依赖：自托管需要哪些（Qdrant / OpenAI / etc.）。\n\n" +
      "Day-1 script: `scripts/v0.1-day1-verify.ts`。",
    metadata: { doc: "docs/20_system_design/mechanisms/piko-skill-memory.md", section: "13.3", chunk: 2 },
  },
  {
    id: "piko-skill-memory-tool-pattern",
    scope: "piko-design-docs",
    content:
      "## Tool factory pattern (V0.1)\n\n" +
      "skill-tools.ts exports `createMem0LookupTool` and `createMem0RecordTool`. Pattern:\n" +
      "1. 构造时 `validateContext(deps.context)` fail-fast（role / projectName 校验）。\n" +
      "2. `execute()` 内部 try / catch：catch (e instanceof Mem0ApiError) 走 fallback content；其他异常 throw。\n" +
      "3. user_id 在工厂侧 `${role}:${projectName}` 构造，agent 不可控。\n\n" +
      "V0.1.1 GraphRAG 平行模式：`createGraphragSearchTool` / `validateDocSearchContext` / 同 fallback 模式（fallback 文案 'doc search unavailable: <code>'）。",
    metadata: { doc: "docs/20_system_design/mechanisms/piko-skill-memory.md", section: "6.1", chunk: 3 },
  },
  {
    id: "piko-doc-search-mech-1",
    scope: "piko-design-docs",
    content:
      "## GraphRAG 集成设计（V0.1）\n\n" +
      "Backend: GraphRAG-style HTTP 后端（operator 自部署或自费商用）。Piko 端不绑实现，只对接 `POST {base_url}/v1/search` 契约。\n\n" +
      "HTTP 契约：\n" +
      "  Body: { query: string(1-500), scope?: string, filters?: object, max_results?: number[1,20] }\n" +
      "  Response 200: { results: Array<{ id, content, score, metadata, created_at }> }\n\n" +
      "scope 由后端定义。V0.1 仅暴露 `graphrag_search` 工具（不暴露 index——indexing 离线运维动作）。",
    metadata: { doc: "docs/20_system_design/mechanisms/piko-doc-search.md", section: "5.3", chunk: 4 },
  },
  {
    id: "piko-doc-search-mech-2",
    scope: "piko-design-docs",
    content:
      "## Network host policy (V0.1.1 / H2 fix)\n\n" +
      "Per RFC `docs/91_reviews/v0.1-rfc-network-hosts-enforcement.md`:\n" +
      "  - `policy.permissions.network_hosts` allowlist 由 `applyToolRecoveryPolicy` 在 `execute()` 外壳包 enforce。\n" +
      "  - `policyFetch` 全局安装；host 不在 allowlist → `PolicyViolationError` → Mem0ApiError(0, 'network') → tool fallback。\n" +
      "  - 决策锁定（5ed6cc3）：空 list = 不 enforce；per-PiRuntime install；无 env opt-out。",
    metadata: { doc: "docs/91_reviews/v0.1-rfc-network-hosts-enforcement.md", section: "3", chunk: 5 },
  },
  {
    id: "std-template-unit-scheme",
    scope: "std-templates",
    content:
      "STD template ID `tests.unit-test-scheme`: defines a test scheme " +
      "—— 必含 `## Setup` / `## Cases` / `## Mock configuration` sections. " +
      "When piko writes a unit-test plan via `TaskRequest.std_templates.scheme = " +
      "'tests.unit-test-scheme'`, output must conform to this skeleton.",
    metadata: { doc: "STD/templates/tests.unit-test-scheme.md", section: "skeleton", chunk: 6 },
  },
  {
    id: "std-template-unit-case",
    scope: "std-templates",
    content:
      "STD template ID `tests.unit-case`: per-case shape — " +
      "`### Case <name>` / `  Given: ...` / `  When: ...` / `  Then: ...`. " +
      "piko's `mem0_record` for tester role examples used `## Situation / ## Failure / ## Lesson` — same template philosophy.",
    metadata: { doc: "STD/templates/tests.unit-case.md", section: "shape", chunk: 7 },
  },
  {
    id: "piko-claude-md",
    scope: "piko-design-docs",
    content:
      "## CLAUDE.md project rules (always do)\n\n" +
      "- MUST run `node .gitnexus/run.cjs impact <symbol> --direction upstream --repo piko` before editing any function/class/method.\n" +
      "- MUST run `detect_changes()` before committing.\n" +
      "- MUST warn the user on HIGH/CRITICAL risk before proceeding.\n" +
      "- Use `query({search_query})` to find execution flows instead of grep.\n" +
      "- Use `context({name})` for symbol callers/callees.\n" +
      "Never rename with find-and-replace — `rename` understands the call graph.",
    metadata: { doc: "CLAUDE.md (project root)", section: "always", chunk: 8 },
  },
];

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  if (req.method !== "POST") {
    res.writeHead(405);
    return res.end(JSON.stringify({ message: "method not allowed" }));
  }

  let body = "";
  req.on("data", (c) => (body += c.toString()));
  req.on("end", () => {
    try {
      const url = new URL(req.url ?? "", "http://localhost");
      if (url.pathname !== "/v1/search") {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: `not found: ${url.pathname}` }));
      }
      const m = JSON.parse(body);
      const query: string = m.query ?? "";
      const scope: string = m.scope ?? "all";
      const limit: number = m.limit ?? 5;

      // Seedless mode
      let pool = CORPUS;
      if (process.env.MOCK_GRAPH_SEED === "0") pool = [];
      // Scope filter
      const filtered =
        scope === "all"
          ? pool
          : pool.filter((c) => c.scope === scope);

      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      const ranked = filtered
        .map((c) => {
          const txt = c.content.toLowerCase();
          const hits = tokens.filter((t) => txt.includes(t)).length;
          const score = tokens.length === 0 ? 0 : hits / tokens.length;
          return {
            id: c.id,
            content: c.content,
            score,
            metadata: c.metadata,
            created_at: "2026-10-18T00:00:00Z",
          };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      res.writeHead(200);
      return res.end(JSON.stringify({ results: ranked }));
    } catch (e: any) {
      res.writeHead(500);
      return res.end(JSON.stringify({ message: String(e?.message ?? e) }));
    }
  });
});

const PORT = Number(process.env.MOCK_GRAPH_PORT ?? 8765);
const SEED_ON =
  process.env.MOCK_GRAPH_SEED === "0" ? "off" : `on (${CORPUS.length} chunks)`;
server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(
    `mock-graphrag listening on http://127.0.0.1:${PORT} (seed: ${SEED_ON})\n`,
  );
});
