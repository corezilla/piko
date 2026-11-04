#!/usr/bin/env node
/**
 * Derive the UT Case list from the enumeration table (skill ut-denominator, step 3).
 *
 * Input : /tmp/ut-denominator.json  (output of enumerate-ut-denominator.mjs)
 *         docs/70_verification/unit/unit-test-scheme.md (existing §6.1 rows)
 * Output: JSON list of derived Cases {case_id, symbol, module, type, cell, summary, isd}
 *
 * Rule (STD "one cell, one Case"): for every behaviour unit, one Case per
 * applicable obligation dimension:
 *   params>0        -> parameter class by param type (numeric / string-path / pure)
 *   throws>0        -> 错误路径
 *   state>0         -> 状态分支
 *   resource>0      -> 资源获取/释放
 *   concurrency     -> 并发/可重入
 *   usesClock       -> 时间域行为
 *   serializes      -> 持久化/序列化
 * Units whose symbol already carries a Case of that type get no duplicate;
 * the 16 unregistered §2.3 cells are filled by the second/third cell of the
 * type on the units that already carry the first.
 *
 * Usage: node scripts/derive-ut-cases.mjs --out /tmp/ut-derived.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const arg = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const outPath = arg("--out") ?? "/tmp/ut-derived.json";

const { rows } = JSON.parse(readFileSync("/tmp/ut-denominator.json", "utf8"));
const scheme = readFileSync("docs/70_verification/unit/unit-test-scheme.md", "utf8");

// existing registrations: symbol -> Set(type), and per (module,type) the cells used
const existing = new Map();
const blocks = scheme.split(/^#### 6\.1 Case · UT-([A-Z]+)-\d+\s*$/m);
for (let i = 1; i < blocks.length - 1; i += 2) {
  const body = blocks[i + 1];
  const sym = body.match(/被测符号 `([^`]+)`/)?.[1];
  const typ = body.match(/对象类型 `([^`]+)`/)?.[1];
  const cell = body.match(/下的维度格 `([^`]+)`/)?.[1];
  if (!sym || !typ) continue;
  const key = `${sym}::${blocks[i]}`;
  if (!existing.has(key)) existing.set(key, new Set());
  existing.get(key).add(cell);
}
const has = (sym, mod, typ) => existing.get(`${sym}::${mod}`)?.has(typ) ?? false;

const NUMERIC = /^(number|bigint|DurationMs|Count|Bytes|Ms|Port)$/i;
const STRINGY = /^(string|RelPath|Path|Ref|Id|Token|Sha256|Cursor|RoomId|EventId|TxnId|Enum)/i;
const isNum = (t) => NUMERIC.test(t) || /\bnumber\b|\bnumber\[\]/.test(t);
const isStr = (t) => STRINGY.test(t) || /\bstring\b/.test(t) || /Path|Ref|Id|Token|Sha|Cursor/.test(t);

const ISD = {
  BOOT: "piko-bootstrap-impl.isd.md", IPC: "piko-bootstrap-impl.isd.md",
  MATRIX: "piko-matrix-adapter-impl.isd.md", OBS: "piko-observability-impl.isd.md",
  PI: "piko-pi-adapter-impl.isd.md", POLICY: "piko-policy-impl.isd.md",
  REPO: "piko-task-repository-impl.isd.md", SCHED: "piko-scheduler-impl.isd.md",
  TAPI: "piko-task-api-impl.isd.md", TRANSFER: "piko-transfer-impl.isd.md",
  USAGE: "piko-usage-impl.isd.md", WORKER: "piko-worker-impl.isd.md",
  TYPES: "piko-policy-impl.isd.md", OTHER: "piko-bootstrap-impl.isd.md",
};

const derived = [];
const nextNum = {};
for (const r of rows) {
  if (r.module === "TYPES") continue; // pure type declarations
  const num = (k) => (nextNum[k] = (nextNum[k] ?? 0) + 1);
  const push = (type, cell, summary) => derived.push({
    symbol: r.symbol, module: r.module, type, cell, summary,
    isd: ISD[r.module] ?? ISD.OTHER, line: r.line, file: r.file,
    branches: r.branches.length, throws: r.throws,
  });

  if (r.paramCount > 0) {
    const p = r.params[0];
    const t = p.type;
    if (isNum(t) && !has(r.symbol, r.module, "数值/长度上限参数"))
      push("数值/长度上限参数", "恰好通过",
        `\`${r.symbol}\` 首参 \`${p.name}: ${t}\` 在上限恰好通过（${r.file}:${r.line}，分支 ${r.branches.length} 点）`);
    else if (isStr(t) && !has(r.symbol, r.module, "字符串/路径/枚举输入"))
      push("字符串/路径/枚举输入", "空",
        `\`${r.symbol}\` 首参 \`${p.name}: ${t}\` 空值/缺省路径（${r.file}:${r.line}）`);
    else if (!has(r.symbol, r.module, "纯函数/无副作用"))
      push("纯函数/无副作用", "每等价类合法值",
        `\`${r.symbol}\` 全 ${r.paramCount} 参的合法等价类逐值对冻结期望（${r.file}:${r.line}，分支 ${r.branches.length} 点）`);
  }
  if (r.throws > 0 && !has(r.symbol, r.module, "错误路径"))
    push("错误路径", "每个 typed 错误码",
      `\`${r.symbol}\` 的 ${r.throws} 处 throw/reject 逐一 typed 化且保真传播（${r.file}:${r.line}）`);
  if (r.state > 0 && !has(r.symbol, r.module, "状态分支"))
    push("状态分支", "合法迁移",
      `\`${r.symbol}\` 的 ${r.state} 处状态写逐迁移断言权威表事实（${r.file}:${r.line}）`);
  if (r.resource > 0 && !has(r.symbol, r.module, "资源获取/释放"))
    push("资源获取/释放", "获取失败路径",
      `\`${r.symbol}\` 的 ${r.resource} 处 fs/子进程/定时器操作在获取失败时 typed 化且不残留（${r.file}:${r.line}）`);
  if (r.concurrency && !has(r.symbol, r.module, "并发/可重入"))
    push("并发/可重入", "并发对偶/交错",
      `\`${r.symbol}\` 的锁/租约/队列语义在交错下无双写（${r.file}:${r.line}）`);
  if (r.usesClock && !has(r.symbol, r.module, "时间域行为"))
    push("时间域行为", "超时边界 ±1 tick",
      `\`${r.symbol}\` 的时钟/超时边界 ±1 观测（${r.file}:${r.line}）`);
  if (r.serializes && !has(r.symbol, r.module, "持久化/序列化"))
    push("持久化/序列化", "round-trip",
      `\`${r.symbol}\` 的序列化 round-trip 逐值对账（${r.file}:${r.line}）`);
}

// ---- wave 1: fill the unregistered §2.3 cells (one representative unit each)
// §2.3 cells per type, as registered in the scheme (authoritative list)
const CELLS = {
  "纯函数/无副作用": ["每等价类合法值", "边界(上/下/零/空/满)", "非法值"],
  "数值/长度上限参数": ["恰好通过", "+1 拒绝", "−1 通过", "多上限各自成套"],
  "字符串/路径/枚举输入": ["空", "超长", "注入字符", "未知枚举", "路径穿越"],
  "错误路径": ["每个 typed 错误码"],
  "资源获取/释放": ["获取失败路径", "正常释放", "异常中途释放"],
  "并发/可重入": ["并发对偶/交错", "交错枚举（容量 N−1/N/N+1）"],
  "状态分支": ["合法迁移", "每个非法迁移拒绝"],
  "时间域行为": ["超时边界 ±1 tick", "定时器触发序"],
  "持久化/序列化": ["round-trip", "截断/损坏", "版本不符"],
};
const registeredCells = new Map(); // type -> Set(cell)
for (const m of scheme.matchAll(/^#### 6\.1 Case · UT-[A-Z]+-\d+\s*$/gm)) {
  const start = m.index;
  const end = scheme.indexOf("#### 6.1 Case", start + 10) < 0 ? scheme.length : scheme.indexOf("#### 6.1 Case", start + 10);
  const body = scheme.slice(start, Math.min(end, start + 1200));
  const typ = body.match(/对象类型 `([^`]+)`/)?.[1];
  const cell = body.match(/下的维度格 `([^`]+)`/)?.[1];
  if (typ && cell) {
    if (!registeredCells.has(typ)) registeredCells.set(typ, new Set());
    registeredCells.get(typ).add(cell);
  }
}
const flagFor = {
  "纯函数/无副作用": (r) => r.paramCount > 0,
  "数值/长度上限参数": (r) => r.params.some((x) => isNum(x.type)),
  "字符串/路径/枚举输入": (r) => r.params.some((x) => isStr(x.type)),
  "错误路径": (r) => r.throws > 0,
  "资源获取/释放": (r) => r.resource > 0,
  "并发/可重入": (r) => r.concurrency,
  "状态分支": (r) => r.state > 0 || r.concurrency,
  "时间域行为": (r) => r.usesClock,
  "持久化/序列化": (r) => r.serializes || r.touchesDb,
};
const usedForWave1 = new Set();
for (const [typ, cells] of Object.entries(CELLS)) {
  const missing = cells.filter((c) => !(registeredCells.get(typ)?.has(c)));
  if (!missing.length) continue;
  const pool = rows.filter((r) => r.module !== "TYPES" && flagFor[typ]?.(r))
    .sort((a, b) => b.branches.length - a.branches.length);
  for (const cell of missing) {
    const unit = pool.find((r) => !usedForWave1.has(`${r.module}::${r.symbol}::${r.line}`) &&
      !(existing.get(`${r.symbol}::${r.module}`)?.has(cell)));
    if (!unit) continue;
    usedForWave1.add(`${unit.module}::${unit.symbol}::${unit.line}`);
    derived.push({
      symbol: unit.symbol, module: unit.module, type: typ, cell,
      summary: `\`${unit.symbol}\` × \`${typ}\` 格 \`${cell}\`（波次一：补齐 §2.3 未登记格；${unit.file}:${unit.line}，分支 ${unit.branches.length} 点）`,
      isd: ISD[unit.module] ?? ISD.OTHER, line: unit.line, file: unit.file,
      branches: unit.branches.length, throws: unit.throws, wave: 1,
    });
  }
}
// ---- wave 1b: units with real branches but no flag-matched dimension ----
// A guard branch (if (this.timer)), an idempotency check (previousFetch !== null)
// or a swallowed catch IS an obligation cell: STD's 状态分支/错误路径 dimensions
// are about behaviour, not about whether the unit takes a parameter.
for (const r of rows) {
  if (r.module === "TYPES" || !r.branches.length) continue;
  const anyCase = derived.some((d) => d.module === r.module && d.symbol === r.symbol) ||
    existing.has(`${r.symbol}::${r.module}`);
  if (anyCase) continue;
  const isErr = r.branches.some((b) => b.kind === "catch") || r.throws > 0;
  const typ = isErr ? "错误路径" : "状态分支";
  const cell = isErr ? "每个 typed 错误码" : "合法迁移";
  derived.push({
    symbol: r.symbol, module: r.module, type: typ, cell, wave: 1,
    summary: `\`${r.symbol}\` 的 ${r.branches.length} 个守卫/幂等分支逐路径断言（${r.file}:${r.line}${isErr ? "，含 catch" : ""}）`,
    isd: ISD[r.module] ?? ISD.OTHER, line: r.line, file: r.file,
    branches: r.branches.length, throws: r.throws,
  });
}
for (const d of derived) d.wave ??= 2;

// units that carry NO obligation dimension at all must be disposed explicitly
const covered = new Set([...rows.filter((r) => r.module !== "TYPES").map((r) => `${r.module}::${r.symbol}::${r.line}`)]);
const derivedUnits = new Set(derived.map((d) => `${d.module}::${d.symbol}`));
const skipped = rows.filter((r) => r.module !== "TYPES" && !derivedUnits.has(`${r.module}::${r.symbol}`))
  .map((r) => ({ module: r.module, file: r.file, line: r.line, symbol: r.symbol, kind: r.kind, visibility: r.visibility, params: r.paramCount, branches: r.branches.length }));

// number the derived cases per module, continuing after existing max
const maxNum = {};
for (const m of scheme.matchAll(/^#### 6\.1 Case · UT-([A-Z]+)-(\d+)\s*$/gm))
  maxNum[m[1]] = Math.max(maxNum[m[1]] ?? 0, +m[2]);
const seq = {};
for (const d of derived.sort((a, b) => (a.wave - b.wave) || a.module.localeCompare(b.module) || a.line - b.line)) {
  seq[d.module] = (seq[d.module] ?? maxNum[d.module] ?? 0) + 1;
  d.case_id = `UT-${d.module}-${String(seq[d.module]).padStart(3, "0")}`;
}
// guard: no duplicate case ids
const seen = new Set();
for (const d of derived) {
  if (seen.has(d.case_id)) throw new Error(`duplicate case id ${d.case_id}`);
  seen.add(d.case_id);
}

writeFileSync(outPath, JSON.stringify({ derived, skipped }, null, 2));
const byType = derived.reduce((a, d) => ((a[d.type] = (a[d.type] ?? 0) + 1), a), {});
console.log(`derived ${derived.length} new Cases (wave1 ${derived.filter((d) => d.wave === 1).length}, wave2 ${derived.filter((d) => d.wave === 2).length}); skipped units with no obligation dimension: ${skipped.length}`);
for (const [k, v] of Object.entries(byType)) console.log(`  ${String(v).padStart(4)}  ${k}`);
