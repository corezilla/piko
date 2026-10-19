// scripts/mock-graphrag.ts — minimal local mock speaking OpenSearch /
// Elasticsearch `_search` JSON-over-HTTP. Compatible with piko's
// V0.1.2 GraphRAGAdapter after the OpenSearch _search migration.
//
// Seeds a small corpus of piko design docs + STD template refs so a
// software_engineer agent has context to recall when writing piko code.
// Disable seeds via MOCK_GRAPH_SEED=0.
//
// Run: MOCK_GRAPH_PORT=8765 tsx scripts/mock-graphrag.ts
// Then point piko at:
//   MEM0_BASE_URL=http://127.0.0.1:9999  (mock-mem0)
//   identity.doc_search.base_url=http://127.0.0.1:8765  (this file)
//
// Per piko-doc-search.md §5.3, the canonical OpenSearch _search contract:
//   POST /{index}/_search
//   Authorization: Bearer <api_key>   (ApiKey also accepted)
//   Body: { size, query: { multi_match: { query, fields, type }, bool?: { filter: [...] } } }
//   Response: { hits: { hits: [{ _id, _score, _source: { content, metadata, created_at } }] } }
//
// For "all" or "_all" index we serve the full corpus (the mock doesn't
// enforce strict per-index separation; scope is used as a soft filter
// so callers can still run cross-index queries).

import http from "node:http";

interface Chunk {
  id: string;
  scope: string;
  content: string;
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
      "## GraphRAG 集成设计（V0.1.2 / OpenSearch _search）\n\n" +
      "Backend: any OpenSearch / Elasticsearch deployment that's reachable from " +
      "piko. V0.1.2 选了 OpenSearch `_search` JSON-over-HTTP 作为契约，理由是它 " +
      "是行业主流的向量+全文搜索协议（Elasticsearch / OpenSearch / Bonsai / " +
      "AWS OpenSearch Service / 自托管 ES 都 speak）。\n\n" +
      "HTTP 契约：\n" +
      "  POST {base_url}/{index}/_search\n" +
      "  Body: { size, query: { multi_match: { query, fields }, bool?: { filter } } }\n" +
      "  Response 200: { hits: { hits: [{ _id, _score, _source: { content, metadata, created_at } }] } }\n\n" +
      "index（scope）由后端 operator 定义；piko 端不绑定 vendor。",
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

function tokenScore(haystack: string, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const lower = haystack.toLowerCase();
  const hits = tokens.filter((t) => lower.includes(t)).length;
  return hits / tokens.length;
}

function matchesAllFilters(
  chunk: Chunk,
  filterTerms: Array<{ key: string; value: unknown }>,
): boolean {
  for (const { key, value } of filterTerms) {
    // Walk the metadata chain first; fall back to top-level chunk fields.
    const segs = key.split(".");
    let cursor: unknown = chunk;
    for (const s of segs) {
      if (cursor && typeof cursor === "object" && s in (cursor as Record<string, unknown>)) {
        cursor = (cursor as Record<string, unknown>)[s];
      } else {
        cursor = undefined;
        break;
      }
    }
    if (cursor !== value) return false;
  }
  return true;
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type",
  );
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  if (req.method !== "POST") {
    res.writeHead(405);
    return res.end(JSON.stringify({ message: "method not allowed" }));
  }

  let raw = "";
  req.on("data", (c) => (raw += c.toString()));
  req.on("end", () => {
    try {
      // Path: /<index>/_search
      const url = new URL(req.url ?? "", "http://localhost");
      const m = url.pathname.match(/^\/([^/]+)\/_search\/?$/);
      if (!m) {
        res.writeHead(404);
        return res.end(
          JSON.stringify({
            error: { type: "not_found", reason: `not found: ${url.pathname}` },
          }),
        );
      }
      const indexName = decodeURIComponent(m[1]);
      if (indexName !== "_all" && indexName !== "all" && !CORPUS.find((c) => c.scope === indexName)) {
        res.writeHead(404);
        return res.end(
          JSON.stringify({
            error: { type: "index_not_found", reason: `index '${indexName}' not found` },
          }),
        );
      }

      const body = raw ? JSON.parse(raw) : {};
      const multiMatch = body?.query?.multi_match;
      if (!multiMatch || typeof multiMatch.query !== "string") {
        res.writeHead(400);
        return res.end(
          JSON.stringify({
            error: {
              type: "illegal_argument_exception",
              reason: "query.multi_match.query is required",
            },
          }),
        );
      }
      const query = multiMatch.query as string;
      const topK = Math.min(Math.max(body.size ?? 5, 1), 20);
      const boolFilter: Array<{ term: Record<string, unknown> }> = Array.isArray(
        body?.query?.bool?.filter,
      )
        ? body.query.bool.filter
        : [];
      const filterTerms = boolFilter
        .map((f) => {
          const [[key, value]] = Object.entries(f.term ?? {});
          return { key, value };
        })
        .filter((t) => t.key);

      const pool =
        process.env.MOCK_GRAPH_SEED === "0"
          ? []
          : indexName === "_all" || indexName === "all"
          ? CORPUS
          : CORPUS.filter((c) => c.scope === indexName);

      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      const ranked = pool
        .map((c) => ({
          id: c.id,
          content: c.content,
          score: tokenScore(c.content, tokens),
          metadata: c.metadata,
          created_at: "2026-10-18T00:00:00Z",
        }))
        .filter((r) => r.score > 0 && matchesAllFilters(r, filterTerms))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      // OpenSearch _search response shape
      res.writeHead(200);
      res.end(
        JSON.stringify({
          took: 0,
          timed_out: false,
          _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
          hits: {
            total: { value: ranked.length, relation: "eq" },
            max_score: ranked[0]?.score ?? null,
            hits: ranked.map((r) => ({
              _index: indexName,
              _id: r.id,
              _score: r.score,
              _source: {
                content: r.content,
                metadata: r.metadata,
                created_at: r.created_at,
              },
            })),
          },
        }),
      );
    } catch (e: any) {
      res.writeHead(500);
      res.end(JSON.stringify({ message: String(e?.message ?? e) }));
    }
  });
});

const PORT = Number(process.env.MOCK_GRAPH_PORT ?? 8765);
const SEED_ON =
  process.env.MOCK_GRAPH_SEED === "0" ? "off" : `on (${CORPUS.length} chunks)`;
server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(
    `mock-graphrag (OpenSearch _search) listening on http://127.0.0.1:${PORT} (seed: ${SEED_ON})\n`,
  );
});
