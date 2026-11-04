#!/usr/bin/env node
/**
 * Wave 2 step-4: generate the per-Case script registry under
 * `tests/unit/cases/` — one file per Case ID (STD: 段落锚点＝脚本名).
 *
 * Two tiers, kept machine-distinguishable so no skeleton can count as an
 * executable entry (STD unit-case 状态语义: 禁止计划中的测试函数冒充可执行入口):
 *
 *   skeleton  `STATUS: skeleton` header + `test.todo()` — a registered,
 *             pending entry that states its observation points in comments
 *             and asserts nothing.
 *   real      hand/agent-authored body, `STATUS: real`, asserts something.
 *
 * Usage: node scripts/gen-ut-case-scripts.mjs [--limit N] [--force]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const limit = Number(args[args.indexOf("--limit") + 1] ?? 0);
const force = args.includes("--force");
const { cases } = JSON.parse(readFileSync("/tmp/ut-cases-full.json", "utf8"));
const { rows } = JSON.parse(readFileSync("/tmp/ut-denominator.json", "utf8"));

// the wave-1 coarse Cases ride the same generator: one script per Case
const schemeText = readFileSync("docs/70_verification/unit/unit-test-scheme.md", "utf8");
const coarseCases = [];
{
  const blocks = schemeText.split(/^#### 6\.1 Case · UT-([A-Z]+)-\d+\s*$/m);
  for (let i = 1; i < blocks.length - 1; i += 2) {
    const mod = blocks[i], body = blocks[i + 1];
    const num = body.match(/UT-[A-Z]+-(\d+)/)?.[1];
    const sym = body.match(/被测符号 `([^`]+)`/)?.[1];
    const typ = body.match(/对象类型 `([^`]+)`/)?.[1];
    const cell = [...body.matchAll(/维度格\s*`([^`]+)`/g)].map((m) => m[1])[0];
    if (!num || !sym || !typ || !cell) continue;
    const unit = rows.find((r) => r.symbol === sym && r.module === mod) ?? rows.find((r) => r.symbol === sym);
    coarseCases.push({
      case_id: `UT-${mod}-${num}`, module: mod, symbol: sym, type: typ, cell,
      summary: `\`${sym}\` × \`${typ}\` × \`${cell}\`（粗粒度登记）`,
      file: unit?.file ?? "src/", line: unit?.line ?? 0, kind: unit?.kind ?? "fn",
      detail: { what: "coarse" },
    });
  }
}
let list = [...cases, ...coarseCases];
if (limit > 0) list = list.slice(0, limit);
const DIR = "tests/unit/cases";
mkdirSync(DIR, { recursive: true });

const SRC = (file) => file.replace(/\.ts$/, "");
const clip = (s, n) => { s = (s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

function body(c) {
  const d = c.detail ?? {};
  const call = c.kind === "ctor" ? `new ${c.symbol}(/* 构造参数 */)` : `${c.symbol}(/* 参数 */)`;
  const L = [];
  switch (d.what) {
    case "param": case "param-optional":
      L.push(`// 输入构造：按 \`${c.cell}\` 类构造 \`${d.param}: ${d.ptype}\`，其余参数取合法等价类（${c.file}:${c.line}）`,
        `// 观察点：该类的预期语义（合法＝正常返回；边界＝按 ISD 语义；非法＝typed 错误且无副作用${d.poptional ? "；缺省态＝与显式默认值同构" : ""}）`,
        `// 待实现：构造输入 → ${call} → 逐值断言（Oracle：${c.case_id} 用例文档 §3）`);
      break;
    case "branch":
      L.push(`// 输入构造：使 ${c.file}:${d.bline} 的分支（${d.bkind}：${clip(d.bcond, 70)}）取真，与取假成对`,
        `// 观察点：两侧各自的可观测结果（返回值/状态/副作用）与设计一致`,
        `// 待实现：${call} 分别命中两侧 → 断言（Oracle：用例文档 §3）`);
      break;
    case "throw":
      L.push(`// 输入构造：触发 ${c.file}:${d.tline} 的 throw（code \`${d.code}\`，守卫 ${clip(d.guard, 60)}）`,
        `// 观察点：typed 错误 code 逐值等于 \`${d.code}\`，消息可判别，无部分写入`,
        `// 待实现：${call} 命中守卫 → expect(...).rejects/toThrow（Oracle：用例文档 §3）`);
      break;
    case "reject":
      L.push(`// 输入构造：注入第 ${d.awaitIndex} 个被调方（${c.symbol} 的 await 目标）拒绝`,
        `// 观察点：拒绝按设计声明的 typed 错误上抛，不吞错、不降级为成功`,
        `// 待实现：注入拒绝 → 调用 → 断言上抛（Oracle：用例文档 §3）`);
      break;
    case "state":
      L.push(`// 输入构造：使 ${c.file}:${d.sline} 对 \`${d.target}\` 的写被执行`,
        `// 观察点：写后读回权威事实源（${d.target === "db" ? "SQLite 行" : "对象状态"}）逐值对账`,
        `// 待实现：${call} → 读回对账（Oracle：用例文档 §3）`);
      break;
    case "resource":
      L.push(`// 输入构造：使 ${c.file}:${d.rline} 的资源操作（\`${d.op}\`）执行；另构造失败注入`,
        `// 观察点：正常路径资源被使用且释放；失败注入 typed 错误且无泄漏`,
        `// 待实现：${call} 两路 → 断言（Oracle：用例文档 §3）`);
      break;
    case "return":
      L.push(`// 输入构造：使 ${c.file}:${d.retline} 的返回站点（值 ${clip(d.value, 60)}）被到达`,
        `// 观察点：该返回路径的返回值逐值对账（结构、字段、顺序），无未声明副作用`,
        `// 待实现：${call} → 断言（Oracle：用例文档 §3）`);
      break;
    default:
      L.push(`// 输入构造：按 \`${c.type}\` × \`${c.cell}\` 展开规则构造（${c.file}:${c.line}）`,
        `// 观察点：返回值、typed 错误码、持久化副作用与资源释放`,
        `// 待实现：${call} → 断言（Oracle：用例文档 §3）`);
  }
  return L.map((l) => l.replace(/^\/\/\s*/, ""));
}

let made = 0, skipped = 0;
for (const c of list) {
  const path = join(DIR, `${c.case_id}.test.ts`);
  if (existsSync(path) && !force) {
    // a hand-written script (STATUS: real) is never overwritten by the
    // skeleton generator; a stale skeleton is rewritten
    const prev = readFileSync(path, "utf8");
    if (/STATUS: real/.test(prev)) { skipped += 1; continue; }
  }
  const L = [
    `/**`,
    ` * Case ID: ${c.case_id}  ·  STATUS: skeleton`,
    ` *`,
    ` * 责任：${c.summary}`,
    ` * 维度坐标：\`${c.symbol}\` × \`${c.type}\` × \`${c.cell}\`（方案 §6.1A 分卷 \`${c.module}\`）`,
    ` * 用例文档：docs/70_verification/unit/cases/${c.case_id}.md（脚本的唯一依据）`,
    ` *`,
    ` * STATUS: skeleton ＝ 已登记的待实现入口（G-EXEC-UT-3）：test.todo 不执行、`,
    ` * 不判定，禁止改成会通过的空断言冒充 Implemented。`,
    ` */`,
    `import { describe, test } from "vitest";`,
    ``,
    `describe("${c.case_id} · ${c.symbol}（${c.file}:${c.line}）", () => {`,
    `  test.todo(${JSON.stringify(`${c.type} × ${c.cell}`)});`,
    ...body(c).map((l) => `  // ${l}`),
    `});`,
    ``,
  ];
  writeFileSync(path, L.join("\n"));
  made += 1;
}
console.log(`scripts: ${made} written, ${skipped} existing`);
