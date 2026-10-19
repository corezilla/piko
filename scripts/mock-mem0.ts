// scripts/mock-mem0.ts — minimal local mock matching Mem0 HTTP contract.
// For sandbox validation of piko Mem0Adapter independent of Mem0 Cloud.
// Run: MOCK_PORT=9999 tsx scripts/mock-mem0.ts
// Then: MEM0_BASE_URL=http://127.0.0.1:${MOCK_PORT:-9999} MEM0_API_KEY=anything \
//       tsx scripts/v0.1-day1-verify.ts
//
// V0.1.1: Seeds role-scoped "career experience" memories on boot so an
// agent has history to recall. Mem0 seed content mirrors real lessons
// from `docs/91_reviews/v0.1-coding-notes-2026-10-18.md` and the
// Mem0 docs — these are the kind of short, role-anchored notes a real
// skill-experience workflow would accumulate. Disable via
// `MOCK_MEM0_SEED=0`.
//
// POST /v1/memories/        → { results: [{ id, event: "ADD" }] }
// POST /v1/memories/search/ → { results: Mem0SearchResult[] } sorted
//                              by token-overlap score, scoped per user_id

import http from "node:http";

interface Mem {
  id: string;
  memory: string;
  created_at: string;
  metadata: Record<string, any>;
}
const stores = new Map<string, Mem[]>();

interface Seed {
  user_id: string;
  memory: string;
  metadata: Record<string, any>;
}

const SEEDS: Seed[] = [
  // software_engineer lessons — what a SE on piko accumulates
  {
    user_id: "software_engineer:piko",
    memory:
      "## When wiring Piko config blocks: prefer sibling fields over provider-switch. V0.1 added `identity.doc_search` beside `identity.memory` because per-role short experience and project-wide corpus are different scopes — forcing one provider for both would break operators who need both.",
    metadata: { type: "skill_experience", role: "software_engineer", tags: ["piko-design", "config-schema"] },
  },
  {
    user_id: "software_engineer:piko",
    memory:
      "## HTTP contract authorship: when no off-the-shelf API exists, define the contract from the client side (request shape + auth + error mapping), document it in the mechanism doc, and let the operator deploy any backend that matches. piko-graphrag-impl.isd.md §11.3 is the canonical example.",
    metadata: { type: "skill_experience", role: "software_engineer", tags: ["api-design", "graphrag"] },
  },
  {
    user_id: "software_engineer:piko",
    memory:
      "## Skill-tool factory pattern: each tool's `execute()` must NEVER throw; it catches `Mem0ApiError` and returns a fallback content like `'memory unavailable: <code>'`. The piko skill-tools.ts Mem0Lookup/Mem0Record are the reference. Don't break this contract when extending.",
    metadata: { type: "skill_experience", role: "software_engineer", tags: ["mem0", "error-handling"] },
  },
  // tester lessons
  {
    user_id: "tester:piko",
    memory:
      "## Per-role isolation verified via day-1: tester writes, developer search returns []. user_id is `${role}:${project}`. Don't compose memories across roles or expose role-scoped entries from tool factory. The 5-check day-1 verify at scripts/v0.1-day1-verify.ts is the gate.",
    metadata: { type: "skill_experience", role: "tester", tags: ["mem0", "isolation"] },
  },
  {
    user_id: "tester:piko",
    memory:
      "## Day-1 gate failure = V0.1 否决. Per piko-skill-memory.md §13.3, any of the 5 checks failing on a real env is a V0.1 no-go. Don't paper over with mocks.",
    metadata: { type: "skill_experience", role: "tester", tags: ["go-no-go"] },
  },
  // developer lessons
  {
    user_id: "developer:piko",
    memory:
      "## Commit attribution: end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` per the user's session instruction. PR body should also use that attribution.",
    metadata: { type: "skill_experience", role: "developer", tags: ["process"] },
  },
  {
    user_id: "developer:piko",
    memory:
      "## Before any symbol edit, run `node .gitnexus/run.cjs impact <symbol> --direction upstream --repo piko` and warn the user on HIGH/CRITICAL risk. After the diff is staged, run `detect_changes --scope staged` before committing.",
    metadata: { type: "skill_experience", role: "developer", tags: ["process", "gitnexus"] },
  },
];

function seedOnBoot() {
  if (process.env.MOCK_MEM0_SEED === "0") return;
  for (const s of SEEDS) {
    if (!stores.has(s.user_id)) stores.set(s.user_id, []);
    const arr = stores.get(s.user_id)!;
    arr.push({
      id: `seed-${arr.length}-${Math.random().toString(36).slice(2, 8)}`,
      memory: s.memory,
      created_at: new Date().toISOString(),
      metadata: s.metadata,
    });
  }
}

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
    const url = new URL(req.url ?? "", "http://localhost");
    try {
      // v3: add endpoint is /v3/memories/add/ (distinct from /v3/memories/
      // which is a v3 search/list endpoint). Piko's client surfaces the
      // v3 `event_id` as ids[0] for backward compat with v1 callers.
      if (url.pathname === "/v3/memories/add/") {
        const m = JSON.parse(body);
        const user_id: string = m.user_id;
        const content: string = (m.messages ?? []).map((x: any) => x.content).join(" ");
        const event_id = `mem-${Math.random().toString(36).slice(2, 10)}`;
        // v3 returns synthetic memory_id = event_id (the mock doesn't
        // do real async extraction). Piko's client polls search() and
        // finds the just-stored entry by content match.
        const mem: Mem = {
          id: event_id,
          memory: content,
          created_at: new Date().toISOString(),
          metadata: m.metadata ?? {},
        };
        if (!stores.has(user_id)) stores.set(user_id, []);
        stores.get(user_id)!.push(mem);
        res.writeHead(200);
        return res.end(JSON.stringify({ event_id, status: "PENDING" }));
      }
      // v3: search/list uses /v3/memories/search/ (search w/ query)
      // and /v3/memories/ (list w/o query, just filters). We support
      // both for piko's adapter (which uses /v3/memories/search/) and
      // for the verify script's `spawn_mock_and_wait` probe path
      // (which can hit either).
      const isSearch = url.pathname === "/v3/memories/search/";
      const isList = url.pathname === "/v3/memories/";
      if (isSearch || isList) {
        const m = body ? JSON.parse(body) : {};
        // v3: user_id is inside `filters`, not top-level
        const user_id: string =
          m.filters?.user_id ?? m.user_id ?? "";
        // v3: top_k is the size field (search) or absent (list)
        const limit: number = m.top_k ?? m.size ?? 5;
        const mems = user_id ? stores.get(user_id) ?? [] : [];
        const query: string = m.query?.multi_match?.query ?? m.query ?? "";
        const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        const ranked = mems
          .map((mem) => {
            const hits = tokens.filter((t) => (mem.memory ?? "").toLowerCase().includes(t)).length;
            const score = tokens.length === 0 ? 0 : hits / tokens.length;
            return {
              id: mem.id,
              memory: mem.memory,
              score,
              metadata: mem.metadata ?? {},
              created_at: mem.created_at,
            };
          })
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        res.writeHead(200);
        // v3 search response: { results: [...] } (used by piko adapter)
        return res.end(JSON.stringify({ results: ranked }));
      }
      res.writeHead(404);
      return res.end(JSON.stringify({ message: `not found: ${url.pathname}` }));
    } catch (e: any) {
      res.writeHead(500);
      return res.end(JSON.stringify({ message: String(e?.message ?? e) }));
    }
  });
});

seedOnBoot();
const PORT = Number(process.env.MOCK_PORT ?? 9999);
server.listen(PORT, "127.0.0.1", () => {
  const counts = [...stores.entries()].map(([k, v]) => `${k}=${v.length}`).join(" ");
  process.stdout.write(`mock-mem0 listening on http://127.0.0.1:${PORT} (seeded: ${counts})\n`);
});
