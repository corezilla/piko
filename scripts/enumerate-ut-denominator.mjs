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
  // in-file numeric constants: `const MAX = 4096` — boundary values for params
  const constNums = new Map();
  {
    const walkC = (k) => {
      if (ts.isVariableDeclaration(k) && ts.isIdentifier(k.name) && k.initializer && ts.isNumericLiteral(k.initializer))
        constNums.set(k.name.getText(), k.initializer.getText());
      ts.forEachChild(k, walkC);
    };
    ts.forEachChild(sf, walkC);
  }
  // resolve a numeric expression: literal or in-file const name
  const numVal = (e) => {
    if (!e) return null;
    const s = e.getText().replace(/\s+/g, " ").trim();
    if (/^\d+$/.test(s)) return s;
    return constNums.get(s) ?? null;
  };
  const clip = (s, n = 72) => {
    s = s.replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  };

  // decision points inside `node`'s body, descending into closures but not
  // into nested class members (those are separate units)
  const branchesOf = (body) => {
    const out = [];
    const first = (b) => b ? clip(b.getText().slice(0, 120), 110) : null;
    const walk = (k) => {
      if (ts.isMethodDeclaration(k) || ts.isConstructorDeclaration(k) ||
          ts.isClassDeclaration(k) || ts.isFunctionDeclaration(k)) return;
      if (ts.isIfStatement(k)) {
        out.push({ line: lineOf(k.getStart()), kind: "if", cond: `if (${clip(k.expression.getText())})`,
          condText: clip(k.expression.getText(), 90),
          truthy: truthyOf(k.expression.getText()),
          falsy: falsyOf(k.expression.getText()),
          then: first(ts.isBlock(k.thenStatement) ? k.thenStatement.statements[0] : k.thenStatement),
          els: first(k.elseStatement ? (ts.isBlock(k.elseStatement) ? k.elseStatement.statements[0] : k.elseStatement) : null) });
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
        const recv = k.expression.getText();
        out.push({ line: lineOf(k.getStart()), kind: "?.", cond: clip(k.getText(), 60),
          condText: clip(recv, 90),
          truthy: `令 \`${recv}\` 为有效值（非 undefined／null）——可选链不短路`,
          falsy: `令 \`${recv}\` 为 undefined／null——可选链短路，取 undefined`,
          then: null, els: null });
      } else if (ts.isPrefixUnaryExpression(k) && k.operator === ts.SyntaxKind.ExclamationToken) {
        const operand = k.operand.getText();
        // `!x` is TRUE when x is falsy — the sides are the operand's, swapped
        out.push({ line: lineOf(k.getStart()), kind: "!", cond: `!${clip(operand, 60)}`,
          condText: clip(operand, 90),
          truthy: falsyOf(operand),
          falsy: truthyOf(operand),
          then: first(k.parent && ts.isIfStatement(k.parent) ? (ts.isBlock(k.parent.thenStatement) ? k.parent.thenStatement.statements[0] : k.parent.thenStatement) : null),
          els: null });
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
  // how to make a condition TRUE — the negated/literal form of the condition,
  // so a Case can state the concrete input instead of "构造取真的输入"
  const truthyOf = (exprText) => {
    const s = exprText.trim();
    // `!x` — the negation is true when x is falsy
    // `a || b` — the guard is true when EITHER operand holds
    const or = s.split(/\s*\|\|\s*/);
    if (or.length === 2 && or.length === 2 && !s.includes("&&")) {
      const left = or[0].trim(), right = or[1].trim();
      const leftHint = truthyOf(left), rightHint = truthyOf(right);
      return `满足任一分支即可：① ${leftHint}；或 ② ${rightHint}`;
    }
    const neg = s.match(/^!([\w.$]+)$/);
    if (neg) return `令 \`${neg[1]}\` 为假（空串／0／null／undefined）`;
    // `!x.m(...)` / `!x.has(...)` — the call must return false
    const negCall = s.match(/^!([\w.$]+)\((.*)\)$/);
    if (negCall) {
      const callee = negCall[1], arg = negCall[2];
      if (/timingSafeEqual|equals|compare|equal/.test(callee))
        return `令 \`${arg}\` 的两个参数不相等（传与期望不同的字节，如多一个字节）`;
      if (/\.(startsWith|includes|has|includes|endsWith)$/.test(callee))
        return `令 \`${callee}(${arg})\` 为假（如传不匹配的字符串：${arg.trim() ? `\`"__nomatch__"\`` : `空串`}）`;
      return `令 \`${callee}(${arg})\` 返回假（空数组／false／不命中项）`;
    }
    // `!a?.b(...)` — optional chain under a negation
    const negOpt = s.match(/^!([\w.$]+)\?\.([\w$]+)\((.*)\)$/);
    if (negOpt) {
      const [, recv, meth, arg] = negOpt;
      const lit = arg.trim().replace(/^["']|["']$/g, "");
      if (/^(startsWith|includes|endsWith)$/.test(meth))
        return `令 \`${recv}\` 为不以 \`${lit}\` 开头的字符串（如 \`"__nomatch__"\`）——\`${meth}\` 返回假`;
      return `令 \`${recv}\` 为 undefined／null（可选链短路，\`${meth}\` 不被调用）`;
    }
    // `a?.b(c)` — optional call
    const optCall = s.match(/^([\w.$]+)\?\.([\w$]+)\((.*)\)$/);
    if (optCall) {
      const [, recv, meth, arg] = optCall;
      if (/^(startsWith|includes|endsWith)$/.test(meth))
        return `令 \`${recv}\` 为以 \`${arg.trim().replace(/^["']|["']$/g, "")}\` 开头的字符串——\`${meth}\` 返回真`;
      return `令 \`${recv}\` 为有效值，\`${meth}(${arg})\` 返回真`;
    }
    // `a?.b` — optional member
    const optMember = s.match(/^([\w.$]+)\?\.([\w$]+)$/);
    if (optMember) return `令 \`${optMember[1]}\` 为有效值（可选链不短路）`;
    // `!a?.b` — optional member under a negation
    const negOptMember = s.match(/^!([\w.$]+)\?\.([\w$]+)$/);
    if (negOptMember) return `令 \`${negOptMember[1]}\` 为 undefined／null（可选链短路）`;
    // `!(a || b)` — at least one operand false
    const negGroup = s.match(/^!\((.*)\)$/);
    if (negGroup) return `令 \`${negGroup[1]}\` 为假（操作数之一不成立）`;
    const eq = s.match(/^(.+?)\s*(===|!==|==|!=)\s*(.+)$/);
    if (eq) {
      const [, left, op, right] = eq;
      const lit = right.trim().replace(/^["'`]|["'`]$/g, "");
      if (op === "===" || op === "==") return `令 \`${left.trim()}\` ＝ \`${right.trim()}\``;
      if (op === "!==" || op === "!=") return `令 \`${left.trim()}\` ≠ \`${right.trim()}\`（如 ${lit ? `"not_${lit}"` : "另一个值"}）`;
    }
    const cmp = s.match(/^(.+?)\s*(>=|<=|>|<)\s*(\d+)$/);
    if (cmp) {
      const [, left, op, num] = cmp;
      const v = { ">": +num + 1, ">=": +num, "<": +num - 1, "<=": +num }[op];
      return `令 \`${left.trim()}\` ＝ ${v}（越界一侧）`;
    }
    const optCallT = s.match(/^([\w.$]+)\?\.([\w$]+)\((.*)\)$/);
    if (optCallT) {
      const [, recv, meth, arg] = optCallT;
      if (/^(startsWith|includes|endsWith)$/.test(meth))
        return `令 \`${recv}\` 为不以 \`${arg.trim().replace(/^["']|["']$/g, "")}\` 开头的字符串——\`${meth}\` 返回假`;
      return `令 \`${recv}\` 为 undefined／null（可选链短路）或 \`${meth}(${arg})\` 返回假`;
    }
    if (/^\w+\??\.\w+$/.test(s)) return `令 \`${s}\` 为真（如非空字符串/真值）`;
    if (/^!?[\w.$]+\.[\w$]+\(/.test(s)) return `令 \`${s}\` 的被调方返回真值`;
    return `按 \`${s}\` 的语义取值`;
  };

  // how to make a condition FALSE — the opposite of truthyOf
  const falsyOf = (exprText) => {
    const s = exprText.trim();
    const neg = s.match(/^!([\w.$]+)$/);
    if (neg) return `令 \`${neg[1]}\` 为真`;
    const negCall = s.match(/^!([\w.$]+)\((.*)\)$/);
    if (negCall) {
      const callee = negCall[1], arg = negCall[2];
      if (/\.(startsWith|includes|endsWith)$/.test(callee))
        return `令 \`${callee}(${arg})\` 为真（如传匹配的字符串）`;
      return `令 \`${callee}(${arg})\` 返回真`;
    }
    const negOpt = s.match(/^!([\w.$]+)\?\.([\w$]+)\((.*)\)$/);
    if (negOpt) {
      const [, recv, meth, arg] = negOpt;
      if (/^(startsWith|includes|endsWith)$/.test(meth))
        return `令 \`${recv}\` 为以 \`${arg.trim().replace(/^["']|["']$/g, "")}\` 开头的字符串——${meth} 返回真`;
      return `令 \`${recv}\` 为有效值（可选链不短路）`;
    }
    const negOptMember = s.match(/^!([\w.$]+)\?\.([\w$]+)$/);
    if (negOptMember) return `令 \`${negOptMember[1]}\` 为有效值（可选链不短路）`;
    const negGroup = s.match(/^!\((.*)\)$/);
    if (negGroup) return `令 \`${negGroup[1]}\` 为真`;
    const eq = s.match(/^(.+?)\s*(===|!==|==|!=)\s*(.+)$/);
    if (eq) {
      const [, left, op, right] = eq;
      if (op === "===" || op === "==") return `令 \`${left.trim()}\` ≠ \`${right.trim()}\``;
      return `令 \`${left.trim()}\` ＝ \`${right.trim()}\``;
    }
    const cmp = s.match(/^(.+?)\s*(>=|<=|>|<)\s*(\d+)$/);
    if (cmp) {
      const [, left, op, num] = cmp;
      const v = { ">": +num, ">=": +num - 1, "<": +num, "<=": +num + 1 }[op];
      return `令 \`${left.trim()}\` ＝ ${v}（不越界一侧）`;
    }
    const optCallF = s.match(/^([\w.$]+)\?\.([\w$]+)\((.*)\)$/);
    if (optCallF) {
      const [, recv, meth, arg] = optCallF;
      if (/^(startsWith|includes|endsWith)$/.test(meth))
        return `令 \`${recv}\` 为不以 \`${arg.trim().replace(/^["']|["']$/g, "")}\` 开头的字符串——\`${meth}\` 返回假`;
      return `令 \`${recv}\` 为 undefined／null（可选链短路）或 \`${meth}(${arg})\` 返回假`;
    }
    if (/^\w+\??\.\w+$/.test(s)) return `令 \`${s}\` 为假（空串／0／null／undefined）`;
    if (/^!?[\w.$]+\.[\w$]+\(/.test(s)) return `令 \`${s}\` 的被调方返回假值`;
    return `按 \`${s}\` 的语义取反`;
  };

  const guardOf = (k) => {
    for (let a = k.parent; a; a = a.parent) {
      if (ts.isIfStatement(a)) return `if (${clip(a.expression.getText(), 120)})`;
      if (ts.isConditionalExpression(a)) return `? ${clip(a.condition.getText(), 120)} :`;
      if (ts.isCatchClause(a)) return "catch";
      if (ts.isBinaryExpression(a) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarOrToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(a.operatorToken.kind))
        return clip(a.getText(), 120);
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
      const stmtText = ts.isThrowStatement(k) ? k.getText() : (expr?.getText() ?? k.getText());
      const guard = guardOf(k);
      const cond = guard.match(/^if \((.*)\)$/)?.[1] ?? guard;
      return { kind: "throw", code, guard, stmt: clip(stmtText, 110),
               how: guard === "unconditional" ? "无条件抛出（直接调用即命中）" : truthyOf(cond) };
    }
    if (ts.isCallExpression(k) && k.expression.getText().endsWith("Promise.reject"))
      return { kind: "throw", code: "reject", guard: guardOf(k) };
    return null;
  };
  const isState = (k) => {
    if (ts.isBinaryExpression(k) && k.operatorToken.kind === ts.SyntaxKind.EqualsToken && k.left.getText().startsWith("this."))
      return { kind: "state", target: k.left.getText(), stmt: clip(k.getText(), 110) };
    if (ts.isCallExpression(k) && /\.(run|exec|save)\(/.test(k.expression.getText() + "("))
      return { kind: "state", target: "db", stmt: clip(k.getText(), 110) };
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
    return m ? { kind: "resource", op: m[1], stmt: clip(k.getText(), 140) } : null;
  };

  const register = (node, kind, visibility, name) => {
    // a variable statement carries its initializer on the declaration, not on
    // the statement — reading node.initializer there silently dropped every
    // object-literal unit (export const systemClock: Clock = { ... }).
    const body = node.body ?? node.initializer ??
      (node.declarationList?.declarations?.[0]?.initializer ?? null);
    if (!body) return;
    const txt0 = body.getText();
    const params = (node.parameters ?? node.initializer?.parameters ?? []).map((p) => {
      const name = p.name.getText().replace(/\?$/, "").replace(/[{:[].*$/s, "").trim() || "<destructured>";
      // statements that validate this param: mention it AND compare/throw
      const stmts = [];
      const walkP = (k) => {
        if (ts.isMethodDeclaration(k) || ts.isClassDeclaration(k) || ts.isFunctionDeclaration(k)) return;
        if ((ts.isIfStatement(k) || ts.isThrowStatement(k) || ts.isBinaryExpression(k) &&
             [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(k.operatorToken.kind)) &&
             new RegExp(`\\b${name.replace(/[^\w]/g, "")}\\b`).test(k.getText()) && stmts.length < 3)
          stmts.push(clip(k.getText(), 110));
        ts.forEachChild(k, walkP);
      };
      if (/^\w+$/.test(name)) ts.forEachChild(body, walkP);
      // boundary literals compared against the param (x > 4096 / x.length >= MAX)
      const bounds = [];
      const walkB = (k) => {
        if (ts.isBinaryExpression(k) &&
            [ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.GreaterThanEqualsToken, ts.SyntaxKind.LessThanToken,
             ts.SyntaxKind.LessThanEqualsToken].includes(k.operatorToken.kind) &&
            new RegExp(`\\b${name}\\b`).test(k.left.getText())) {
          const v = numVal(k.right);
          if (v && !bounds.includes(v)) bounds.push(v);
        }
        ts.forEachChild(k, walkB);
      };
      if (/^\w+$/.test(name)) ts.forEachChild(body, walkB);
      return {
        name,
        optional: !!p.questionToken || !!p.initializer || p.getText().includes("?"),
        type: p.type ? p.type.getText().replace(/\s+/g, " ").slice(0, 60) : "inferred",
        checks: stmts, bounds,
      };
    });
    const txt = txt0;
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
    } else if (ts.isConstructorDeclaration(node)) {
      const cls = node.parent && ts.isClassDeclaration(node.parent) ? node.parent.name?.getText() ?? "<anon>" : "<anon>";
      register(node, "ctor", "public", `${cls}.constructor`);
    }
    else if (ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node))
      register(node, "accessor", "public", (node.getText().match(/\b(get|set)\s+(\w+)/) ?? [])[2] ?? "<anon>");
    else if (ts.isVariableStatement(node)) {
      for (const d of node.declarationList.declarations) {
        const init = d?.initializer;
        if (!init) continue;
        // an object literal that implements a behaviour (e.g. `export const systemClock: Clock = { ... }`)
        // carries its behaviour in its property functions — register each of
        // them as a unit (`systemClock.now`), the way class methods are units.
        if (ts.isObjectLiteralExpression(init)) {
          const mods = ts.getModifiers(node.declarationList) ?? [];
          const vis = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ? "exported" : "module-private";
          for (const prop of init.properties) {
            if (!ts.isPropertyAssignment(prop)) continue;
            const pi = prop.initializer;
            if (!pi || !(ts.isArrowFunction(pi) || ts.isFunctionExpression(pi))) continue;
            const name = prop.name.getText().replace(/^["'`]|["'`]$/g, "");
            register(prop, "fn", vis, `${d.name.getText()}.${name}`);
          }
          continue;
        }
        if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
          const mods = ts.getModifiers(node.declarationList) ?? [];
          const vis = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ? "exported" : "module-private";
          register(node.declarationList, "fn", vis, d.name.getText());
        }
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
