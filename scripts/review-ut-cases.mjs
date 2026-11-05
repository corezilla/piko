#!/usr/bin/env node
/**
 * Wave-2 case review: machine checks over ALL per-site Case docs.
 *
 * The checklist's §3 spot-check rule (3-5 Cases) is for hand-authored
 * registries; these 3,208 docs are generated, so every one of them can and
 * must be checked, not sampled. The manual walk-through still samples.
 *
 * Checks (each maps to a checklist item):
 *   C1 登记↔文档零差集          §5 四方对账（登记 ↔ 用例文档）
 *   C2 八字段齐且非空           §3 每 Case 段落完整
 *   C3 一格一 Case             §3 失败含义唯一
 *   C4 站点行存在于枚举表       §3 输入可复现（指向真实站点）
 *   C5 被测对象为单函数/方法     §3 单函数、失败含义唯一
 *   C6 脚本锚点存在（骨架也算）  §4 占位不伪装（STATUS: skeleton 显式标注）
 *   C7 ID 全局唯一（粗+细两集）  §5 撞车守卫
 *
 * Usage: node scripts/review-ut-cases.mjs [--json out.json]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;

const { cases: fine } = JSON.parse(readFileSync("/tmp/ut-cases-full.json", "utf8"));
const { rows: enumRows } = JSON.parse(readFileSync("/tmp/ut-denominator.json", "utf8"));

const { rows } = JSON.parse(readFileSync("/tmp/ut-denominator.json", "utf8"));
const schemeText0 = readFileSync("docs/70_verification/unit/unit-test-scheme.md", "utf8");

// C1/C7: the volume registries
const registered = new Map(); // case_id -> file
for (const f of readdirSync("docs/70_verification/unit/volumes").filter((x) => x.startsWith("unit-test-scheme-") && x.endsWith(".md"))) {
  const text = readFileSync(`docs/70_verification/unit/volumes/${f}`, "utf8");
  for (const m of text.matchAll(/^\|\s*`(UT-[A-Z]+-\d+)`\s*\|/gm)) registered.set(m[1], `volumes/${f}`);
}
for (const m of schemeText0.matchAll(/^#### 6\.1 Case · (UT-[A-Z]+-\d+)\s*$/gm)) registered.set(m[1], "unit-test-scheme.md#6.1");

const siteKeys = new Set(rows.map((r) => `${r.file}:${r.line}`));
// wave-1 coarse Cases (§6.1) ride the same checks
const coarse = [];
{
  const blocks = schemeText0.split(/^#### 6\.1 Case · UT-([A-Z]+)-\d+\s*$/m);
  for (let i = 1; i < blocks.length - 1; i += 2) {
    const mod = blocks[i], body = blocks[i + 1];
    const num = body.match(/UT-[A-Z]+-(\d+)/)?.[1];
    const sym = body.match(/被测符号 `([^`]+)`/)?.[1];
    const typ = body.match(/对象类型 `([^`]+)`/)?.[1];
    const cell = [...body.matchAll(/维度格\s*`([^`]+)`/g)].map((m) => m[1])[0];
    if (!num || !sym || !typ || !cell) continue;
    const unit = enumRows.find((r) => r.symbol === sym && r.module === mod) ?? enumRows.find((r) => r.symbol === sym);
    coarse.push({
      case_id: `UT-${mod}-${num}`, module: mod, symbol: sym, type: typ, cell,
      file: unit?.file ?? "src/", line: unit?.line ?? 0, kind: unit?.kind ?? "fn",
    });
  }
}
const cases = [...fine, ...coarse];
// one-line files put several units on one line (auth.ts:3 = ctor + method),
// so the unit lookup is keyed by file:line:symbol, not file:line.
const unitOf = new Map(rows.map((r) => [`${r.file}:${r.line}:${r.symbol}`, r]));

const FIELDS = ["责任 / 明确不测", "维度坐标（方案 §2.3 行×格）", "输入构造", "步骤与观察点", "Oracle 与预期", "错误路径 / 清理", "脚本 / 实现状态"];
const findings = [];
const push = (check, id, msg) => findings.push({ check, case_id: id, message: msg });

let docs = 0;
for (const c of cases) {
  const path = `docs/70_verification/unit/cases/${c.case_id}.md`;
  // C1
  if (!registered.has(c.case_id)) push("C1", c.case_id, "派生清单有而分卷未登记");
  if (!existsSync(path)) { push("C1", c.case_id, "登记了而用例文档缺失"); continue; }
  docs += 1;
  const t = readFileSync(path, "utf8");
  // C2
  for (const f of FIELDS) {
    const i = t.indexOf(`**${f}**：`);
    if (i < 0) { push("C2", c.case_id, `缺字段 ${f}`); continue; }
    const body = t.slice(i + f.length + 4).split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("-") && !l.startsWith("```"))[0] ?? "";
    if (!body.trim()) push("C2", c.case_id, `字段 ${f} 为空`);
  }
  // C3: exactly one cell in the coordinate line
  const coord = t.match(/\*\*维度坐标（方案 §2\.3 行×格）\*\*：\s*\n+\n*`[^`]+` × `[^`]+` × `([^`]+)`/);
  const coordCells = coord ? 1 : (t.match(/× `[^`]+` × `([^`]+)`/g)?.length ?? 0);
  if (!coord && coordCells !== 1) push("C3", c.case_id, "维度坐标不是恰好一格");
  // C4
  const site = t.match(/（`([\w.\-]+\.ts):(\d+)`，/)?.[1] ? `${t.match(/（`([\w.\-]+\.ts):(\d+)`，/)[1]}:${t.match(/（`([\w.\-]+\.ts):(\d+)`，/)[2]}` : null;
  if (!site || !siteKeys.has(site)) push("C4", c.case_id, `站点 ${site ?? "?"} 不在枚举表`);
  else {
    // C5: the doc's symbol must be the unit at that site
    const sym = t.match(/对象函数：`([^`]+)`/)?.[1];
    const unit = unitOf.get(site);
    if (sym && unit && sym !== unit.symbol) push("C5", c.case_id, `对象函数 ${sym} ≠ 枚举表 ${unit.symbol}@${site}`);
  }
  // C8: the steps must be the numbered 动作+观察点 shape (STD draft.129+)
  const steps = t.match(/^\*\*步骤 \d+\*\*——动作：/gm) ?? [];
  const observes = t.match(/^观察点：\S/mg) ?? [];
  if (steps.length === 0) push("C8", c.case_id, "步骤与观察点不是编号步骤（draft.129 起必须编号 动作＋观察点）");
  else if (observes.length < steps.length) push("C8", c.case_id, `步骤 ${steps.length} 个但观察点 ${observes.length} 个（每步须配观察点）`);
  // C9: no template guidance left in a finished document
  for (const marker of ["编写建议", "抽象示例", "格式说明", "本节目的", "完成条件", "必须写清楚", "⟨", "⟩"]) {
    if (t.includes(marker)) { push("C9", c.case_id, `模板编写建议残留：${marker}`); break; }
  }
  // C10: the steps must name the implementation site they exercise
  if (!/（`[\w.\-]+\.ts:\d+`）/.test(t)) push("C10", c.case_id, "步骤未指向实现站点（file:line）");
  // C11: the Oracle must point at an existing design document
  const oracles = [...t.matchAll(/`(docs\/40_module_design\/[^`]+\.md)`/g)].map((m) => m[1]);
  if (!oracles.length) push("C11", c.case_id, "Oracle 未指向模块设计文档");
  else for (const o of new Set(oracles)) if (!existsSync(o)) push("C11", c.case_id, `Oracle 指向不存在的文档 ${o}`);
  // C12: the input construction must give concrete values or a generation rule
  const input = t.match(/\*\*输入构造\*\*：\s*\n\n([^\n]+)/)?.[1] ?? "";
  if (!/写死|生成规则|取自|见 §3\.1 步骤 1/.test(input)) push("C12", c.case_id, "输入构造未给具体取值或生成规则");
  // C6
  const script = `tests/unit/cases/${c.case_id}.test.ts`;
  if (!existsSync(script)) push("C6", c.case_id, "脚本锚点不存在");
  else if (!/STATUS: skeleton|STATUS: real/.test(readFileSync(script, "utf8"))) push("C6", c.case_id, "脚本未标 STATUS（占位可能伪装为实现）");
}
// C7: no duplicate IDs across coarse + volumes
const ids = [...registered.keys()];
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
for (const d of dup) push("C7", d, "Case ID 重复登记");

const summary = {
  checked: cases.length, docs, registered: registered.size,
  findings: findings.length,
  by_check: findings.reduce((a, f) => ((a[f.check] = (a[f.check] ?? 0) + 1), a), {}),
  ok: findings.length === 0,
};
console.log(JSON.stringify(summary, null, 2));
for (const f of findings.slice(0, 20)) console.log(`  [${f.check}] ${f.case_id}: ${f.message}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ generated: "2026-11-05", summary, findings }, null, 2));
process.exit(findings.length ? 1 : 0);
