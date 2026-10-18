// scripts/v0.1-day1-verify.ts
// 跑法：MEM0_API_KEY=xxx npx tsx scripts/v0.1-day1-verify.ts
//
// Day-1 verification for V0.1 skill-memory integration with Mem0 Cloud.
// 5 checks: per-role isolation, metadata preservation, filters field,
// infer extraction, deployment boot (manually verified).
//
// Per HANDOFF.md Step 7.2 / v0.1-coding-notes / piko-mem0-client-impl.isd.md §11

import { Mem0Adapter } from "../src/mem0-client.js";

const API_KEY = process.env.MEM0_API_KEY;
const BASE = process.env.MEM0_BASE ?? "https://api.mem0.ai";

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

await check("2. metadata 保留", async () => {
  const w = await mem0.add(
    [{ role: "user", content: "DAY1 TEST second lesson with specific tag day1-meta-test" }],
    "tester:day1test",
    { type: "skill_experience", role: "tester", tags: ["day1-meta-test"] },
  );
  const r = await mem0.search("DAY1 TEST second lesson", "tester:day1test", { max_results: 5 });
  const found = r.find((x) => x.id === w.ids[0]);
  if (!found?.metadata?.tags?.includes("day1-meta-test")) throw new Error("tags not preserved");
});

await check("3. filters 字段", async () => {
  const w = await mem0.add(
    [{ role: "user", content: "DAY1 TEST filter case day1-filter-test" }],
    "tester:day1test",
    { type: "skill_experience", role: "tester", tags: ["day1-filter-test"] },
  );
  const r = await mem0.search(
    "DAY1 TEST filter case",
    "tester:day1test",
    { max_results: 5, filters: { "metadata.tags": "day1-filter-test" } },
  );
  const found = r.find((x) => x.id === w.ids[0]);
  if (!found) throw new Error("filter didn't return matching memory");
});

await check("4. infer 自动抽取", async () => {
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
