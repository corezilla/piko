#!/usr/bin/env node
/**
 * Wave 2: derive the FULL per-site UT Case registry from the enumeration table.
 *
 * Granularity (user directive 2026-11-04): every function, every parameter
 * boundary, every internal branch, every return value gets its own Case —
 * anything UT can catch must not leak to MT.
 *
 * One Case per obligation site:
 *   param x class(合法/边界/非法)   -> by param type class
 *   branch site                     -> 状态分支/并发/时间域 by site shape
 *   throw site                      -> 错误路径 x <code>
 *   state-write site                -> 状态分支 x 合法迁移
 *   resource-op site                -> 资源获取/释放 x 对应格
 *   return site                     -> 纯函数/无副作用 x 每等价类合法值
 *
 * Output: per-module volume files (registry tables) + JSON index.
 * Usage: node scripts/derive-ut-cases-full.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const { rows } = JSON.parse(readFileSync("/tmp/ut-denominator.json", "utf8"));
const scheme = readFileSync("docs/70_verification/unit/unit-test-scheme.md", "utf8");
const VOLDIR = "docs/70_verification/unit/volumes";
mkdirSync(VOLDIR, { recursive: true });

// existing registrations: symbol::module -> Set(cell)
const existing = new Map();
const blocks = scheme.split(/^#### 6\.1 Case · UT-([A-Z]+)-\d+\s*$/m);
for (let i = 1; i < blocks.length - 1; i += 2) {
  const mod = blocks[i], body = blocks[i + 1];
  const sym = body.match(/被测符号 `([^`]+)`/)?.[1];
  const cell = body.match(/下的维度格 `([^`]+)`/)?.[1];
  if (!sym || !cell) continue;
  const k = `${sym}::${mod}`;
  if (!existing.has(k)) existing.set(k, new Set());
  existing.get(k).add(cell);
}
const taken = (sym, mod, cell) => existing.get(`${sym}::${mod}`)?.has(cell) ?? false;

const NUM = /^(number|bigint|DurationMs|Count|Bytes|Ms|Port|Timestamp|number\[\])$/i;
const STR = /^(string|RelPath|Path|Ref|Id|Token|Sha256|Cursor|RoomId|EventId|TxnId|Enum|Buffer|Uint8Array)/i;
const isNum = (t) => NUM.test(t) || /\bnumber\b/.test(t);
const isStr = (t) => STR.test(t) || /\bstring\b|Path|Ref|Id|Token|Sha|Cursor/.test(t);
const clip = (s, n = 58) => { s = s.replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

const ISD = {
  BOOT: "piko-bootstrap-impl.isd.md", IPC: "piko-bootstrap-impl.isd.md",
  MATRIX: "piko-matrix-adapter-impl.isd.md", OBS: "piko-observability-impl.isd.md",
  PI: "piko-pi-adapter-impl.isd.md", POLICY: "piko-policy-impl.isd.md",
  REPO: "piko-task-repository-impl.isd.md", SCHED: "piko-scheduler-impl.isd.md",
  TAPI: "piko-task-api-impl.isd.md", TRANSFER: "piko-transfer-impl.isd.md",
  USAGE: "piko-usage-impl.isd.md", WORKER: "piko-worker-impl.isd.md",
};

const cases = [];
for (const r of rows) {
  const add = (type, cell, summary, detail) => cases.push({
    module: r.module, symbol: r.symbol, type, cell,
    summary, site: `${r.file}:${r.line}`, file: r.file, line: r.line,
    kind: r.kind, visibility: r.visibility, async: r.async, detail: detail ?? null,
  });

  // 1) params x 3 mandatory classes
  for (const p of r.params) {
    const typ = isNum(p.type) ? "数值/长度上限参数" : isStr(p.type) ? "字符串/路径/枚举输入" : "纯函数/无副作用";
    const classes = typ === "数值/长度上限参数"
      ? ["恰好通过", "+1 拒绝", "−1 通过"]
      : typ === "字符串/路径/枚举输入"
        ? ["空", "超长", "注入字符"]
        : ["每等价类合法值", "边界(上/下/零/空/满)", "非法值"];
    for (const cell of classes)
      add(typ, cell, `参数 \`${p.name}: ${p.type}\` 的 \`${cell}\` 类（${r.file}:${r.line}）`,
        { what: "param", param: p.name, ptype: p.type, poptional: !!p.optional });
    if (p.optional) add(typ, "未知枚举", `可选参数 \`${p.name}\` 缺省/显式两态（${r.file}:${r.line}）`,
      { what: "param-optional", param: p.name, ptype: p.type });
  }
  // 2) branch sites — an if whose then-side is a throw IS the throw site
  // (counting it twice inflates the denominator with a duplicate Case)
  const throwLines = new Set(r.throwSites.map((s) => s.line));
  for (const b of r.branches) {
    if (b.kind === "if" && b.then && /^throw\b/.test(b.then) && throwLines.has(b.line)) continue;
    const typ = b.kind === "catch" ? "错误路径"
      : r.concurrency && /epoch|lease|claim|lock|slot|timer/.test(b.cond) ? "并发/可重入"
      : r.usesClock && /timer|timeout|deadline|elapsed|now|Date/.test(b.cond) ? "时间域行为"
      : "状态分支";
    const cell = typ === "错误路径" ? "每个 typed 错误码"
      : typ === "并发/可重入" ? "并发对偶/交错"
      : typ === "时间域行为" ? "超时边界 ±1 tick"
      : /^(if|ternary|case|default|loop|!|&&|\|\||\?\?|\?\.)$/.test(b.kind) && b.kind !== "else" ? "合法迁移" : "每个非法迁移拒绝";
    add(typ, cell, `分支 L${b.line} \`${clip(b.cond, 46)}\`（${b.kind}；${r.file}）`,
      { what: "branch", bline: b.line, bkind: b.kind, bcond: b.cond });
  }
  // 3) throw sites; async units without one still owe rejection propagation
  for (const s of r.throwSites)
    add("错误路径", `每个 typed 错误码`, `throw L${s.line} \`${s.code}\`（守卫 \`${clip(s.guard, 40)}\`；${r.file}）`,
      { what: "throw", tline: s.line, code: s.code, guard: s.guard });
  if (r.async && r.throwSites.length === 0) {
    const awaits = [...r.bodyText.matchAll(/await ([\w$.()\[\]{}'"`+ ,?!:]{0,60}?)[;)\n]/g)].map((m) => m[1].trim());
    const n = Math.max(awaits.length, 1);
    for (let k = 0; k < n; k += 1)
      add("错误路径", `每个 typed 错误码`, `await 拒绝传播 #${k + 1}：被调方 \`${awaits[k] ?? "被调方"}\` 拒绝必须 typed 化上抛（${r.file}:${r.line}）`,
        { what: "reject", awaitIndex: k + 1, target: awaits[k] ?? null });
  }
  // 4) state-write sites
  for (const s of r.stateSites)
    add(s.target === "db" ? "持久化/序列化" : "状态分支",
      s.target === "db" ? "round-trip" : "合法迁移",
      `状态写 L${s.line} → \`${s.target}\`（${r.file}）`,
      { what: "state", sline: s.line, target: s.target });
  // 5) resource-op sites
  for (const s of r.resourceSites)
    add("资源获取/释放", /^(rmSync|unlinkSync|clearTimeout|clearInterval|close|kill)$/.test(s.op) ? "正常释放" : "获取失败路径",
      `资源操作 L${s.line} \`${s.op}\`（${r.file}）`,
      { what: "resource", rline: s.line, op: s.op });
  // 6) return sites
  for (const s of r.returnSites)
    add("纯函数/无副作用", "每等价类合法值", `返回站点 L${s.line} 值 \`${clip(s.value, 40)}\` 逐值断言（${r.file}）`,
      { what: "return", retline: s.line, value: s.value });
}

// Wave 2 is per-site: a coarse wave-1 row registering symbol x cell once does
// NOT cover the individual sites of that cell (createOrGet has 12 throw sites
// with 12 different codes). Dedupe only against exact site collisions.
const seenKey = new Set();
const fresh = cases.filter((c) => {
  const k = `${c.module}::${c.symbol}::${c.cell}::${c.summary}`;
  if (seenKey.has(k)) return false;
  seenKey.add(k);
  return true;
});

// number per module continuing after existing max
const maxNum = {};
for (const m of scheme.matchAll(/^#### 6\.1 Case · UT-([A-Z]+)-(\d+)\s*$/gm))
  maxNum[m[1]] = Math.max(maxNum[m[1]] ?? 0, +m[2]);
const seq = { };
const byMod = {};
for (const c of fresh.sort((a, b) => a.site.localeCompare(b.site))) {
  seq[c.module] = (seq[c.module] ?? maxNum[c.module] ?? 0) + 1;
  c.case_id = `UT-${c.module}-${String(seq[c.module]).padStart(3, "0")}`;
  (byMod[c.module] ??= []).push(c);
}

// write volumes
let total = 0;
const index = [];
for (const [mod, list] of Object.entries(byMod)) {
  const L = [
    `# UT 分卷登记 · ${mod}（波次二：逐站点全量登记）`, "",
    "> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`",
    "> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；",
    "> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。",
    "> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`", "",
    `**本卷 Case 数：${list.length}**（对象类型分布：${Object.entries(list.reduce((a, c) => ((a[c.type] = (a[c.type] ?? 0) + 1), a), {})).map(([k, v]) => `${k} ${v}`).join("；")}）`, "",
    "| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |",
    "|---|---|---|---|---|",
  ];
  for (const c of list)
    L.push(`| \`${c.case_id}\` | \`${c.symbol}\`（\`${c.site}\`） | \`${c.type}\` × \`${c.cell}\` | ${c.summary.replace(/\|/g, "\\|")} | 待实现 |`);
  writeFileSync(join(VOLDIR, `unit-test-scheme-${mod.toLowerCase()}.md`), L.join("\n") + "\n");
  index.push({ module: mod, cases: list.length, file: `docs/70_verification/unit/volumes/unit-test-scheme-${mod.toLowerCase()}.md` });
  total += list.length;
}
index.sort((a, b) => b.cases - a.cases);
writeFileSync(`${VOLDIR}/case-index.json`, JSON.stringify({ generated: "2026-11-04", total, volumes: index }, null, 2));

// full machine-readable Case index for the layer (STD test-standard §5
// 大分量层义务, LLMTier shape): every registered Case, coarse (§6.1) and
// per-site (volumes), one row each, with the four-way reconciliation fields
// (design/script/report/scheme) read from disk — never hand-written.
import { readdirSync as _rd } from "node:fs";
const CASEDIR = "docs/70_verification/unit/cases";
const caseDoc = (id) => existsSync(`${CASEDIR}/${id}.md`) ? `${CASEDIR}/${id}.md` : "未完成";
// script = a test file that names the Case ID in its describe()/title
const scriptMap = new Map();
const scanTests = (dir) => {
  for (const e of _rd(dir, { withFileTypes: true })) {
    const f = `${dir}/${e.name}`;
    if (e.isDirectory()) { if (e.name !== "reports" && e.name !== "node_modules") scanTests(f); continue; }
    if (!/\.test\.ts$/.test(e.name)) continue;
    const text = readFileSync(f, "utf8");
    // a registered skeleton (test.todo, STATUS: skeleton) is NOT a script entry:
    // counting it would inflate the four-way reconciliation this file exists
    // to make honest (STD unit-case: 禁止计划中的测试函数冒充可执行入口).
    if (/STATUS: skeleton/.test(text)) continue;
    for (const m of text.matchAll(/UT-[A-Z]+-\d+/g))
      if (!scriptMap.has(m[0])) scriptMap.set(m[0], f);
  }
};
scanTests("tests");
// report = per-Case Run 报告 JSON（STD 状态分层：执行结果只在 Run 报告）
const reportMap = new Map();
if (existsSync("tests/unit/reports")) {
  const scanRuns = (dir) => {
    for (const e of _rd(dir, { withFileTypes: true })) {
      const f = `${dir}/${e.name}`;
      if (e.isDirectory()) { scanRuns(f); continue; }
      if (!e.name.endsWith(".json") || e.name.endsWith(".metadata.json")) continue;
      const id = e.name.replace(/\.json$/, "");
      if (/^UT-[A-Z]+-\d+$/.test(id)) reportMap.set(id, f);
    }
  };
  scanRuns("tests/unit/reports");
}
// 实现状态的唯一权威是用例文档（STD 状态分层：方案只持有设计状态）
const caseDocStatus = (id) => {
  const f = `${CASEDIR}/${id}.md`;
  if (!existsSync(f)) return "Planned";
  const m = readFileSync(f, "utf8").match(/测试代码实现状态\*\*：`[A-Za-z_]+`\s*\/\s*`([A-Za-z_]+)`/);
  return m?.[1] ?? "Planned";
};
const SCHEME_PATH = "docs/70_verification/unit/unit-test-scheme.md";
const rowFields = (id, schemePath) => ({
  design: caseDoc(id),
  script: scriptMap.get(id) ?? "未完成",
  report: reportMap.get(id) ?? "未完成",
  scheme: schemePath,
});
const coarse = [];
for (let i = 1; i < blocks.length - 1; i += 2) {
  const mod = blocks[i], body = blocks[i + 1];
  const num = body.match(/^6\.1\.\d+\s+Case · UT-([A-Z]+)-(\d+)/m)?.[2]
    ?? body.match(/UT-[A-Z]+-(\d+)/)?.[1];
  if (!num) continue;
  const id = `UT-${mod}-${num}`;
  const cells = [...body.matchAll(/维度格\s*`([^`]+)`/g)].map((m) => m[1]);
  coarse.push({
    id, case_id: id, module: mod,
    symbol: body.match(/被测符号 `([^`]+)`/)?.[1] ?? null,
    type: body.match(/对象类型 `([^`]+)`/)?.[1] ?? null,
    cell: cells[0] ?? null,
    summary: clip(body.match(/责任摘要[^：]*：(.+)/)?.[1] ?? "", 200),
    granularity: "symbol-x-cell",
    status: caseDocStatus(id),
    ...rowFields(id, SCHEME_PATH),
  });
}
const countBy = (list, key) => list.reduce((a, c) => ((a[c[key]] = (a[c[key]] ?? 0) + 1), a), {});
const fieldCount = (list, key) => list.filter((c) => c[key] !== "未完成").length;
const all = [
  ...coarse,
  ...fresh.map((c) => ({ id: c.case_id, case_id: c.case_id, module: c.module, symbol: c.symbol,
    type: c.type, cell: c.cell, summary: c.summary, site: c.site,
    granularity: "per-site", status: "Planned",
    ...rowFields(c.case_id, `docs/70_verification/unit/volumes/unit-test-scheme-${c.module.toLowerCase()}.md`) })),
];
const full = {
  document: "piko UT Case 索引", layer: "UT",
  generated_by: "scripts/derive-ut-cases-full.mjs",
  note: "本文件由脚本从磁盘登记生成，勿手改（STD test-standard §5 大分量层义务）。四方对账字段：design=用例文档存在；script=tests/ 下标题点名该 Case ID 的测试文件；report=逐 Case Run 报告 JSON（tests/unit/reports/**/<ID>.json）；scheme=该 Case 在方案/分卷里的登记位置。未生成的写字符串「未完成」，不用 null、不省略键。计划 §3 前检与四方对账按本文件复算，不手数表格。",
  total: all.length,
  granularity_counts: countBy(all, "granularity"),
  status_counts: countBy(all, "status"),
  module_counts: countBy(all, "module"),
  category_counts: countBy(all, "type"),
  field_counts: {
    design: fieldCount(all, "design"), script: fieldCount(all, "script"),
    report: fieldCount(all, "report"), scheme: all.length,
  },
  cases: all,
};
writeFileSync("docs/70_verification/unit/case-index.json", JSON.stringify(full, null, 2));
writeFileSync("/tmp/ut-cases-full.json", JSON.stringify({ generated: "2026-11-05", total: fresh.length, cases: fresh }, null, 2));
console.log(`derived ${total} new Cases across ${index.length} volumes`);
for (const v of index) console.log(`  ${String(v.cases).padStart(4)}  ${v.module}`);
