// scripts/mock-mem0.ts — minimal local mock matching Mem0 HTTP contract.
// For sandbox validation of piko Mem0Adapter independent of Mem0 Cloud.
// Run: MEM0_BASE_URL=http://127.0.0.1:${MOCK_PORT:-9999} tsx scripts/mock-mem0.ts
// Then: MEM0_BASE_URL=http://127.0.0.1:${MOCK_PORT:-9999} MEM0_API_KEY=anything tsx scripts/v0.1-day1-verify.ts
// POST /v1/memories/ → returns { results: [{ id }] } matching piko Mem0ApiError code path
// POST /v1/memories/search/ → returns ranked results, scoped per user_id

import http from "node:http";

interface Mem { id: string; memory: string; created_at: string; metadata: Record<string, any> }
const stores = new Map<string, Mem[]>();

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
      if (url.pathname === "/v1/memories/") {
        const m = JSON.parse(body);
        const user_id: string = m.user_id;
        const content: string = (m.messages ?? []).map((x: any) => x.content).join(" ");
        const mem: Mem = {
          id: `mem-${Math.random().toString(36).slice(2, 10)}`,
          memory: content,
          created_at: new Date().toISOString(),
          metadata: m.metadata ?? {},
        };
        if (!stores.has(user_id)) stores.set(user_id, []);
        stores.get(user_id)!.push(mem);
        res.writeHead(200);
        return res.end(JSON.stringify({ results: [{ id: mem.id, event: "ADD" }] }));
      }
      if (url.pathname === "/v1/memories/search/") {
        const m = JSON.parse(body);
        const user_id: string = m.user_id;
        const limit: number = m.limit ?? 5;
        const mems = stores.get(user_id) ?? [];
        const tokens = (m.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
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

const PORT = Number(process.env.MOCK_PORT ?? 9999);
server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`mock-mem0 listening on http://127.0.0.1:${PORT}\n`);
});
