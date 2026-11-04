#!/usr/bin/env node
/**
 * Enumerate the real UT denominator from the implementation: every behaviour
 * unit in src/ with its parameter count and its FULL list of branch points.
 *
 * STD docs/test-standard.md §4 pins "ISD 受辖函数" to the implementation-side
 * set -- functions AND methods, private members included -- and says the
 * denominator must be enumerable by AST, never counted back from the Cases
 * that were written. Counting Cases to get the denominator is circular: a
 * scheme shrinks its own obligation by registering fewer Cases.
 *
 * For every behaviour unit this records:
 *   params    declared parameters (each owes the 合法/边界/非法 classes)
 *   branches  every decision point INSIDE the unit (nested closures included,
 *             nested class members excluded): if/else, ternary, switch case,
 *             loop, catch, && || ?? ?., early return/throw -- each with its
 *             line and the condition text, so a Case can name the exact path
 *   throws    throw / Promise.reject sites (the typed-error obligation)
 *   state     this.* writes and db run/exec calls (状态分支/持久化 obligation)
 *   resource  fs/child_process/timer/env touches (资源获取/释放、时间域行为)
 *
 * Usage:
 *   node scripts/enumerate-ut-denominator.mjs --md <out.md> [--json <out.json>]
 */
import ts from "typescript";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const args = process.argv.slice(2);
const arg = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const mdPath = arg("--md");
const jsonPath = arg("--json");
if (!mdPath && !jsonPath) {
  console.error("usage: enumerate-ut-denominator.mjs --md out.md [--json out.json]");
  process.exit(2);
}

// src file -> module short name (same table as unit-test-scheme §1.1)
const MODULE_OF = {
  "main.ts": "BOOT", "config.ts": "BOOT", "durable-fs.ts": "BOOT",
  "provider-prefetch.ts": "PI", "provider-preflight.ts": "PI", "semantic.ts": "USAGE",
  "server.ts": "TAPI", "auth.ts": "TAPI",
  "policy.ts": "POLICY", "workspace.ts": "POLICY", "task-equality.ts": "POLICY",
  "store.ts": "REPO",
  "scheduler.ts": "SCHED",
  "worker.ts": "WORKER", "exec-process.ts": "WORKER", "supervisor.ts": "IPC",
  "ipc.ts": "IPC", "tool-recovery.ts": "WORKER",
  "tool-exec-policy.ts": "PI", "tool-host-policy.ts": "PI",
  "skill-prefetch.ts": "PI", "skill-tools.ts": "PI", "pi-runtime.ts": "PI",
  "matrix.ts": "MATRIX",
  "transfer.ts": "TRANSFER", "remote-exec.ts": "TRANSFER", "remote-exec-tools.ts": "TRANSFER",
  "execution-facts.ts": "WORKER", "test-evidence.ts": "WORKER",
  "observability.ts": "OBS", "clock.ts": "OBS",
  "graphrag-client.ts": "PI", "graphrag-tools.ts": "PI", "mem0-client.ts": "PI",
  "types.ts": "IPC",
};

const files = readdirSync(SRC).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).sort();
const rows = [];

for (const file of files) {
  const path = join(SRC, file);
  const text = readFileSync(path, "utf8");
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
  const lineOf = (pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const clip = (s, n = 72) => {
    s = s.replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  };

  // decision points inside `node`'s body, descending into closures but not
  // into nested class members (those are separate units)
  const branchesOf = (body) => {
    const out = [];
    const walk = (k) => {
      if (ts.isMethodDeclaration(k) || ts.isConstructorDeclaration(k) ||
          ts.isClassDeclaration(k) || ts.isFunctionDeclaration(k)) return;
      if (ts.isIfStatement(k)) {
        out.push({ line: lineOf(k.getStart()), kind: "if", cond: `if (${clip(k.expression.getText())})` });
        if (k.elseStatement) out.push({ line: lineOf(k.elseStatement.getStart()), kind: "else", cond: clip(k.elseStatement.getText(), 40) });
      } else if (ts.isConditionalExpression(k)) {
        out.push({ line: lineOf(k.getStart()), kind: "ternary", cond: `? ${clip(k.condition.getText(), 50)} :` });
      } else if (ts.isCaseClause(k)) {
        out.push({ line: lineOf(k.getStart()), kind: "case", cond: `case ${clip(k.expression.getText(), 50)}` });
      } else if (ts.isDefaultClause(k)) {
        out.push({ line: lineOf(k.getStart()), kind: "default", cond: "default" });
      } else if (ts.isForStatement(k) || ts.isForOfStatement(k) || ts.isForInStatement(k) ||
                 ts.isWhileStatement(k) || ts.isDoStatement(k)) {
        const c = k.expression ? k.expression.getText() : k.statement?.expression?.getText() ?? "";
        out.push({ line: lineOf(k.getStart()), kind: "loop", cond: `loop (${clip(c, 50)})` });
      } else if (ts.isCatchClause(k)) {
        out.push({ line: lineOf(k.getStart()), kind: "catch", cond: `catch (${clip(k.getFullText().match(/\(([^)]*)\)/)?.[1] ?? "", 40)})` });
      } else if (ts.isBinaryExpression(k) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(k.operatorToken.kind)) {
        out.push({ line: lineOf(k.getStart()), kind: k.operatorToken.getText(), cond: clip(k.getText(), 60) });
      } else if (ts.isPropertyAccessExpression(k) && k.questionDotToken) {
        out.push({ line: lineOf(k.getStart()), kind: "?.", cond: clip(k.getText(), 60) });
      } else if (ts.isPrefixUnaryExpression(k) && k.operator === ts.SyntaxKind.ExclamationToken) {
        out.push({ line: lineOf(k.getStart()), kind: "!", cond: `!${clip(k.operand.getText(), 60)}` });
      }
      ts.forEachChild(k, walk);
    };
    ts.forEachChild(body, walk);
    return out;
  };

  const collect = (node, tests) => {
    const sites = [];
    const walk = (k) => {
      if (ts.isMethodDeclaration(k) || ts.isClassDeclaration(k) || ts.isFunctionDeclaration(k)) {
        // nested class members are separate units; skip their bodies
        if (ts.isMethodDeclaration(k) || ts.isClassDeclaration(k)) return;
      }
      for (const test of tests) { const s = test(k); if (s) sites.push({ line: lineOf(k.getStart()), ...s }); }
      ts.forEachChild(k, walk);
    };
    ts.forEachChild(node, walk);
    return sites;
  };
  // the guard condition a throw sits in, when there is one
  const guardOf = (k) => {
    for (let a = k.parent; a; a = a.parent) {
      if (ts.isIfStatement(a)) return `if (${clip(a.expression.getText(), 56)})`;
      if (ts.isConditionalExpression(a)) return `? ${clip(a.condition.getText(), 56)} :`;
      if (ts.isCatchClause(a)) return "catch";
      if (ts.isBinaryExpression(a) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(a.operatorToken.kind))
        return clip(a.getText(), 56);
      if (ts.isBlock(a) && a.parent && (ts.isForStatement(a.parent) || ts.isForOfStatement(a.parent) || ts.isWhileStatement(a.parent)))
        return `loop (${clip(a.parent.expression?.getText() ?? "", 48)})`;
    }
    return "unconditional";
  };
  const isThrow = (k) => {
    if (ts.isThrowStatement(k) || k.kind === ts.SyntaxKind.ThrowExpression) {
      const expr = ts.isThrowStatement(k) ? k.expression : k.expression;
      const code = expr?.getText().match(/new\s+\w*Error\(\s*"([^"]+)"/)?.[1] ??
        expr?.getText().match(/Promise\.reject\(\s*new\s+\w*Error\(\s*"([^"]+)"/)?.[1] ?? "reject";
      return { kind: "throw", code, guard: guardOf(k) };
    }
    if (ts.isCallExpression(k) && k.expression.getText().endsWith("Promise.reject"))
      return { kind: "throw", code: "reject", guard: guardOf(k) };
    return null;
  };
  const isState = (k) => {
    if (ts.isBinaryExpression(k) && k.operatorToken.kind === ts.SyntaxKind.EqualsToken && k.left.getText().startsWith("this."))
      return { kind: "state", target: k.left.getText() };
    if (ts.isCallExpression(k) && /\.(run|exec|save)\(/.test(k.expression.getText() + "("))
      return { kind: "state", target: "db" };
    return null;
  };
  const isReturn = (k) => {
    if (!ts.isReturnStatement(k)) return null;
    const e = k.expression;
    if (!e) return { kind: "return", value: "（无值 return：提前退出）" };
    let v = e.getText().replace(/\s+/g, " ").trim();
    if (v.length > 46) v = v.slice(0, 45) + "…";
    return { kind: "return", value: v };
  };
  const isResource = (k) => {
    if (!ts.isCallExpression(k)) return null;
    const m = k.expression.getText().match(/^(readFileSync|writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync|renameSync|copyFileSync|statSync|existsSync|openSync|spawn|execFile|execFileSync|fork|setTimeout|setInterval|clearTimeout|clearInterval|createHash|createCipheriv|createDecipheriv|publicKey|privateKey)\b/);
    return m ? { kind: "resource", op: m[1] } : null;
  };

  const register = (node, kind, visibility, name) => {
    const body = node.body ?? node.initializer;
    if (!body) return;
    const params = (node.parameters ?? node.initializer?.parameters ?? []).map((p) => ({
      name: p.name.getText().replace(/\?$/, "").replace(/[{:[].*$/s, "").trim() || "<destructured>",
      optional: !!p.questionToken || !!p.initializer || p.getText().includes("?"),
      type: p.type ? p.type.getText().replace(/\s+/g, " ").slice(0, 60) : "inferred",
    }));
    const txt = body.getText();
    rows.push({
      module: MODULE_OF[file] ?? "OTHER",
      file, line: lineOf(node.getStart()), symbol: name, kind, visibility,
      params,
      paramCount: params.length,
      returnSites: collect(body, [isReturn]),
      throwSites: collect(body, [isThrow]),
      stateSites: collect(body, [isState]),
      resourceSites: collect(body, [isResource]),
      async: /^\s*(?:private\s+|protected\s+|public\s+|static\s+|readonly\s+|override\s+)*async\s|Promise<|await\s|\.then\(|\.catch\(/.test(node.getFullText().slice(0, 200) + txt.slice(0, 0)) || /\bawait\b/.test(txt) || /Promise<|\.then\(|\.catch\(/.test(node.getFullText().slice(0, 200)),
      usesClock: /\b(clock|Date\.now|performance\.now|setTimeout|setInterval|deadline|elapsed|timeout)\b/i.test(txt),
      serializes: /\b(JSON\.(parse|stringify)|serialize|deserialize|encode|decode|digest|createHash|canonical)\b/.test(txt),
      touchesDb: /\b(db|stmt|prepare|\.run\(|\.get\(|\.all\()\b/.test(txt),
      concurrency: /\b(lock|epoch|lease|claim|renew|fence|mutex|queue|slot)\b/i.test(txt),
      bodyText: body.getText().slice(0, 20000),
      branches: branchesOf(body),
      throws: 0, state: 0, resource: 0, returns: 0, // filled below from sites
    });
    const last = rows[rows.length - 1];
    last.throws = last.throwSites.length; last.state = last.stateSites.length;
    last.resource = last.resourceSites.length; last.returns = last.returnSites.length;
  };

  const walk = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) register(node, "fn", "exported", node.name.getText());
    else if (ts.isMethodDeclaration(node) && node.name) {
      const mods = ts.getModifiers(node) ?? [];
      const vis = mods.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword) ? "private"
        : mods.some((m) => m.kind === ts.SyntaxKind.ProtectedKeyword) ? "protected" : "public";
      register(node, "method", vis, node.name.getText());
    } else if (ts.isConstructorDeclaration(node)) register(node, "ctor", "public", "constructor");
    else if (ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node))
      register(node, "accessor", "public", (node.getText().match(/\b(get|set)\s+(\w+)/) ?? [])[2] ?? "<anon>");
    else if (ts.isVariableStatement(node)) {
      const d = node.declarationList.declarations[0];
      const init = d?.initializer;
      if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
        const mods = ts.getModifiers(node.declarationList) ?? [];
        const vis = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ? "exported" : "module-private";
        register(node.declarationList, "fn", vis, d.name.getText());
      }
    }
    ts.forEachChild(node, walk);
  };
  ts.forEachChild(sf, walk);
}

rows.sort((a, b) => a.module.localeCompare(b.module) || a.file.localeCompare(b.file) || a.line - b.line);
const T = rows.reduce((a, r) => {
  a.units += 1; a.params += r.paramCount; a.branches += r.branches.length;
  a.throws += r.throws; a.state += r.state; a.resource += r.resource; a.returns += r.returns;
  return a;
}, { units: 0, params: 0, branches: 0, throws: 0, state: 0, resource: 0, returns: 0 });

if (jsonPath) writeFileSync(jsonPath, JSON.stringify({ totals: T, rows }, null, 2));

if (mdPath) {
  const L = [];
  L.push("# UT 分母枚举表（机器权威源）", "",
    "> 由 `scripts/enumerate-ut-denominator.mjs` 从 `src/`（不含 `*.test.ts`）AST 枚举生成，**不是手写**。",
    "> 重新生成：`node scripts/enumerate-ut-denominator.mjs --md docs/70_verification/unit/ut-denominator.md --json /tmp/ut-denominator.json`",
    "> 口径＝STD `docs/test-standard.md` §4「ISD 受辖函数」＝实现侧函数＋方法全集（含私有成员与访问器）。",
    "> 本表是 UT 分母的**枚举源**：方案 §1.1/§5.2 的符号集与本表对账，差集必须为零；",
    "> 每条 Case 的「维度坐标」必须能指到本表某行的一个分支路径。", "",
    `**合计**：${T.units} 个行为单元 · 参数 ${T.params} · 分支点 ${T.branches} · throw/reject ${T.throws} · 状态写 ${T.state} · 资源操作 ${T.resource} · 返回站点 ${T.returns}`, "",
    `**逐站点义务格（本层分母）**：Σ(参数×必测类 3 ＋ 分支 ＋ throw 站点 ＋ 状态写站点 ＋ 资源操作站点 ＋ 返回站点)`, "",
    "| 模块 | 文件:行 | 符号 | 种类/可见性 | 参数 | 分支 | throw | 状态写 | 资源 | 返回 | 义务旗标 | 格数 |",
    "|---|---|---|---|--:|--:|--:|--:|--:|--:|---|--:|");
  let cells = 0;
  for (const r of rows) {
    const c = r.paramCount * 3 + r.branches.length + r.throws + r.state + r.resource + r.returns;
    cells += c;
    const flags = [r.async && "async", r.usesClock && "clock", r.serializes && "serial", r.touchesDb && "db", r.concurrency && "concur"].filter(Boolean).join(",") || "—";
    L.push(`| ${r.module} | \`${r.file}:${r.line}\` | \`${r.symbol}\` | ${r.kind}/${r.visibility} | ${r.paramCount} | ${r.branches.length} | ${r.throws} | ${r.state} | ${r.resource} | ${r.returns} | ${flags} | ${c} |`);
  }
  L.push("", `**公式格数合计：${cells}**（这是 UT 层的义务格总数；已登记 Case 数与本表对账即为覆盖率）。`);
  L.push("", "---", "", "## 逐函数分支路径明细", "",
    "每行＝该函数的一个分支路径；Case 的维度坐标必须指到这里。", "");
  for (const r of rows) {
    if (!r.branches.length) continue;
    L.push(`### \`${r.symbol}\` — \`${r.file}:${r.line}\`（${r.module}，${r.kind}/${r.visibility}，参数 ${r.paramCount}）`, "",
      "参数：" + (r.params.map((x) => `\`${x.name}: ${x.type}${x.optional ? "?" : ""}\``).join(" · ") || "（无）"), "",
      "| 行 | 类型 | 条件 |", "|--:|---|---|");
    for (const b of r.branches) L.push(`| ${b.line} | ${b.kind} | \`${b.cond.replace(/\|/g, "\\|")}\` |`);
    L.push("");
  }
  writeFileSync(mdPath, L.join("\n"));
}

console.log(`enumerated ${T.units} units: params=${T.params} branches=${T.branches} throws=${T.throws} state=${T.state} resource=${T.resource}`);
