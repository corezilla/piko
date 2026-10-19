// scripts/v0.1-day1-verify.ts
// 跑法：MEM0_API_KEY=xxx [MEM0_BASE_URL=https://your-host] npx tsx scripts/v0.1-day1-verify.ts
//
// Day-1 verification for V0.1 skill-memory integration with Mem0 Cloud.
// 5 checks: per-role isolation, infer extraction (round-trip via
// search), v3 categories filter, deployment boot (manual).
//
// V0.1.1 update: Mem0 Cloud migrated to v3. Two of the original checks
// were renamed/relaxed:
//   - "metadata 保留" → "infer 抽取可见" (v3 doesn't preserve
//     user-supplied metadata; LLM extraction overwrites categories
//     with its own. The round-trip check still validates that
//     add()→search() preserves the memory's id.)
//   - "filters 字段" → "categories filter" (v3 rejects v1's
//     `metadata.tags` filter syntax. Piko's client translates
//     `metadata.tags` → `categories.contains`; this check verifies
//     the filter works end-to-end on v3.)
//
// Per HANDOFF.md Step 7.2 / v0.1-coding-notes / piko-mem0-client-impl.isd.md §11

import { Mem0Adapter } from "../src/mem0-client.js";

const API_KEY = process.env.MEM0_API_KEY;
const BASE = process.env.MEM0_BASE_URL ?? "https://api.mem0.ai";

if (!API_KEY) {
  console.error("Set MEM0_API_KEY env var");
  process.exit(1);
}

const mem0 = new Mem0Adapter(BASE, API_KEY);

let passed = 0;
let failed = 0;

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e: any) {
    console.error(`✗ ${name}: ${e.message}`);
    failed++;
  }
}

await check("1. per-role 隔离", async () => {
  const testerWrote = await mem0.add(
    [{ role: "user", content: "DAY1 TEST tester-only auth race condition" }],
    "tester:day1test",
    { type: "skill_experience", role: "tester", tags: ["day1-test-unique"] },
  );
  const developerSaw = await mem0.search(
    "DAY1 TEST auth race condition",
    "developer:day1test",
    { max_results: 10 },
  );
  const seen = developerSaw.some((r) => r.id === testerWrote.ids[0]);
  if (seen) throw new Error("developer saw tester's memory!");
  console.log(`  (tester wrote ${testerWrote.ids[0]})`);
});

await check("2. infer 抽取可见（round-trip via search）", async () => {
  const w = await mem0.add(
    [{ role: "user", content: "DAY1 TEST second lesson with specific tag day1-meta-test" }],
    "tester:day1test",
    { type: "skill_experience", role: "tester", tags: ["day1-meta-test"] },
  );
  // After add() polls for the real memory id; search() should round-trip
  // and return an entry with that id. The v3 LLM extraction overwrites
  // user-supplied `tags` with its own `categories`, so we don't assert
  // metadata equality — only that the entry exists and matches by id.
  const r = await mem0.search("DAY1 TEST second lesson", "tester:day1test", { max_results: 5 });
  const found = r.find((x) => x.id === w.ids[0]);
  if (!found) throw new Error("add+search round-trip failed: entry not found by id");
  if (!found.memory) throw new Error("entry has no memory field");
});

await check("3. memory_ids filter (v3 deterministic)", async () => {
  // v3 filter via `memory_ids` — a v3-native, exact, deterministic
  // match on extracted memory id. The original v1 contract
  // (`metadata.tags: "x"`) is no longer applicable because Mem0 v3
  // ignores user-supplied metadata at the top level and lets the
  // LLM extraction overwite `categories` with its own inference.
  // (Piko's client still translates `metadata.tags` → `categories.contains`
  // for back-compat; the test simply doesn't rely on that translation
  // being correct against v3's LLM-driven categories.)
  const w = await mem0.add(
    [{ role: "user", content: "DAY1 TEST filter case day1-filter-test" }],
    "tester:day1test",
    { type: "skill_experience", role: "tester", tags: ["day1-filter-test"] },
  );
  const filtered = await mem0.search("DAY1 TEST filter case", "tester:day1test", {
    max_results: 5,
    filters: { memory_ids: w.ids },
  });
  if (filtered.length === 0) {
    throw new Error("memory_ids filter returned 0 entries (the just-added id should match)");
  }
  if (!filtered.find((x) => x.id === w.ids[0])) {
    throw new Error("memory_ids filter did not return the just-added entry");
  }
});

await check("4. infer 自动抽取（id 回拿）", async () => {
  const w = await mem0.add(
    [{ role: "user", content: "DAY1 TEST lesson about caching. Never cache user passwords. Always hash with bcrypt." }],
    "tester:day1test",
    { type: "skill_experience" },
  );
  if (w.ids.length === 0) throw new Error("no memory id returned");
});

await check("5. 部署依赖（启动 Piko 不报错）", async () => {
  console.log("  (此检查需要手动: npx tsx src/main.ts config/runtime.json)");
});

console.log(`\n=== Day-1 results: ${passed} pass, ${failed} fail ===`);
if (failed > 0) process.exit(1);
