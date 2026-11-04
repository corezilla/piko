#!/usr/bin/env node
/**
 * Wave 2 step-2: generate every UT 用例说明书.
 *
 * Shape (STD tests.unit-case 3.3.0, draft.130): **one Case one document**
 * (Document ID == Case ID == UT-<module>-<NNN>) and **one Case one script**
 * (file name == Case ID). Common fixtures / fakes / vectors are referenced
 * from the common documents, never copied in.
 *
 * 步骤与观察点 follows the template's numbered shape (每步「动作＋观察点」成对,
 * 执行者不猜下一步): steps are built from the AST enumeration table, so the
 * guards, then/else actions, throw statements, await targets and boundary
 * literals in them are read out of the implementation, not invented.
 *
 * Usage: node scripts/gen-ut-case-docs.mjs [--limit N]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const limit = Number(args[args.indexOf("--limit") + 1] ?? 0);
const { cases } = JSON.parse(readFileSync("/tmp/ut-cases-full.json", "utf8"));
const { rows } = JSON.parse(readFileSync("/tmp/ut-denominator.json", "utf8"));

const unitOf = new Map(rows.map((r) => [`${r.file}:${r.line}:${r.symbol}`, r]));

// wave-1 coarse Cases (§6.1 rows: symbol × type × cell) ride the same
// generator — one shape for the whole layer.
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
      summary: `\`${sym}\` × \`${typ}\` × \`${cell}\`（波次一粗粒度登记${unit ? `；${unit.file}:${unit.line}` : ""}）`,
      site: unit ? `${unit.file}:${unit.line}` : null, file: unit?.file ?? null, line: unit?.line ?? 0,
      kind: unit?.kind ?? "fn", visibility: unit?.visibility ?? "exported", async: unit?.async ?? false,
      detail: { what: "coarse" },
    });
  }
}

let list = [...cases, ...coarseCases];
if (limit > 0) list = list.slice(0, limit);

const MODULE_OF = {
  BOOT: "piko-bootstrap", IPC: "piko-bootstrap", MATRIX: "piko-matrix-adapter",
  OBS: "piko-observability", PI: "piko-pi-adapter", POLICY: "piko-policy",
  REPO: "piko-task-repository", SCHED: "piko-scheduler", TAPI: "piko-task-api",
  TRANSFER: "piko-transfer", USAGE: "piko-usage", WORKER: "piko-worker",
};
const designOf = (m) => `docs/40_module_design/${MODULE_OF[m]}-design.md`;
const clip = (s, n) => { s = (s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const q = (s) => `\`${clip(s, 100)}\``;

const EMPTY = "''（空串）、undefined（缺省）、null（显式空值）三态";
const LONG = "长度 2×上限 的字符串（上限取该参数在源码中的比较常量，无则 4096）";
const INJECT = "含 `../` 与绝对路径的穿越串；含控制字符与 SQL/命令元字符的注入串；超长＋注入组合串";

function stepsFor(c, unit) {
  const d = c.detail ?? {};
  const call = c.kind === "ctor" ? `new ${c.symbol.replace(/\.constructor$/, "")}(…)` : `${c.symbol}(…)`;
  const S = [];
  const step = (action, observe) => S.push({ action, observe });
  switch (d.what) {
    case "param": {
      const cls = c.cell;
      const p = unit?.params.find((x) => x.name === d.param);
      const bound = (p?.bounds ?? [])[0] ?? null;
      const checks = p?.checks ?? [];
      const inputs = cls === "空" ? EMPTY : cls === "超长" ? LONG : cls === "注入字符" ? INJECT
        : cls === "恰好通过" ? (bound ? `边界值 ${bound}（源码比较常量）` : "边界值（取源码比较常量；无显式常量则取类型定义边界）")
        : cls === "+1 拒绝" ? (bound ? `边界值 +1（${bound}+1）` : "边界值 +1")
        : cls === "−1 通过" ? (bound ? `边界值 −1（${bound}−1）` : "边界值 −1")
        : cls === "未知枚举" ? "缺省（不传）、显式默认值、未知枚举值三态" : "每个等价类一个代表值（取自类型定义/ISD 枚举表）";
      step(`按 \`${cls}\` 类构造参数 \`${d.param}: ${d.ptype}\`：${inputs}；其余参数取合法等价类。${checks.length ? `该参数在源码中的校验语句：${checks.map(q).join("；")}` : "该参数无显式校验语句——预期语义以 ISD/模块设计声明为准，实现缺校验即记缺陷"}`,
        "构造完成，输入可复现（取值全部写死或给生成规则）");
      step(`调用 ${call}（${c.file}:${c.line}）`, "返回值或抛出的错误");
      step(`断言：${["空", "超长", "注入字符", "非法值", "+1 拒绝"].includes(cls) ? "被拒绝时抛 typed 错误（code 逐值对 ISD 错误表），且无状态写/资源残留" : "被接受时返回值/状态与设计声明一致，逐值对账"}`,
        "断言全部通过；失败含义＝该参数类语义与设计脱节");
      break;
    }
    case "param-optional":
      step(`对可选参数 \`${d.param}\` 构造三态：缺省（不传）、显式传默认值、未知枚举值`, "三组输入就绪");
      step(`分别调用 ${call}（${c.file}:${c.line}）`, "三次返回值/错误逐一比对");
      step("断言缺省态与显式默认值同构；未知枚举值按 ISD 声明拒绝且 typed 化", "断言通过");
      break;
    case "branch":
      step(`构造使 ${c.file}:${d.bline} 的分支（${d.bkind}：${q(d.bcond)}）取真的输入${d.then ? `——该侧动作：${q(d.then)}` : ""}`, "分支取真路径被到达");
      step(`调用 ${call} 并断言该侧可观测结果（返回值/状态/副作用）与设计一致`, "断言通过");
      step(`构造使该分支取假的输入${d.els ? `——该侧动作：${q(d.els)}` : "（无显式 else：取假即跳过该块，断言块内副作用不发生）"}`, "分支取假路径被到达");
      step(`再次调用 ${call} 并断言取假侧结果；两侧都必须被观测到`, "断言通过；失败含义＝该分支语义失真");
      break;
    case "throw":
      step(`构造触发 ${c.file}:${d.tline} 处 throw 的输入——守卫 ${q(d.guard ?? "unconditional")}，语句 ${q(d.stmt)}`, "守卫取真");
      step(`调用 ${call}`, `抛出错误且 code 逐值等于 \`${d.code}\``);
      step("断言消息可判别、含建议动作，且无部分写入（状态写/资源/持久化均未发生）", "断言全部通过");
      step("断言内部错误不上抛为客户端码（保真传播）", "对外错误码符合 ISD 错误表");
      break;
    case "reject":
      step(`注入被调方 ${q(d.target ?? "被调方")} 使其拒绝（替身按 asset-design 的 FAKE-* 契约）`, "注入生效，调用序可断言");
      step(`调用 ${call}（${c.file}:${c.line}）`, "本单元行为");
      step("断言拒绝按设计声明的 typed 错误上抛——不吞错、不降级为成功、无悬挂资源或半写状态", "断言通过；失败含义＝错误传播失真");
      break;
    case "state":
      step(`构造使 ${c.file}:${d.sline} 对 \`${d.target}\` 的写被执行的前置状态${d.stmt ? `——写语句：${q(d.stmt)}` : ""}`, "前置状态就绪");
      step(`调用 ${call}`, `写发生：${d.target === "db" ? "SQLite 行变更" : `\`${d.target}\` 新值`}`);
      step(`读回权威事实源（${d.target === "db" ? "重开库逐行对账" : "对象状态直接读"}）逐值对账写入语义`, "对账通过；失败含义＝状态迁移失真");
      break;
    case "resource":
      step(`构造使 ${c.file}:${d.rline} 的资源操作（\`${d.op}\`，语句 ${q(d.stmt)}）被执行的输入`, "操作被到达");
      step(`调用 ${call} 走正常路径`, "资源被使用且释放（句柄/子进程/定时器/临时目录计数回零）");
      step("注入该操作失败（替身/权限/不存在路径）后再次调用", "typed 错误且无泄漏");
      step("断言两路均无残留：clearTimeout/kill/rm 等释放动作全部发生", "断言通过");
      break;
    case "return":
      step(`构造使 ${c.file}:${d.retline} 的返回站点（值 ${q(d.value)}）被到达的输入`, "站点被到达");
      step(`调用 ${call}`, "返回值");
      step("断言返回值逐值对账（结构、字段、顺序），且无未声明副作用", "断言通过；失败含义＝该返回路径语义失真");
      break;
    case "coarse": {
      const u = unit;
      if (!u) { step(`按 \`${c.type}\` × \`${c.cell}\` 展开规则构造输入`, "输入就绪"); break; }
      step(`按 \`${c.cell}\` 格构造输入——参数：${u.params.map((x) => `\`${x.name}: ${x.type}\``).join("、") || "（无参）"}${u.params.some((x) => x.checks.length) ? `；源码校验：${u.params.flatMap((x) => x.checks).slice(0, 3).map(q).join("；")}` : ""}`, "输入就绪，取值全部写死或给生成规则");
      step(`调用 ${call}（${u.file}:${u.line}）`, "返回值/错误/副作用/资源释放");
      if (u.branches.length) step(`逐分支断言：${u.branches.slice(0, 4).map((b) => `L${b.line} ${b.kind}`).join("；")}${u.branches.length > 4 ? ` 等 ${u.branches.length} 点` : ""}`, "每个分支路径的可观测结果与设计一致");
      if (u.throwSites.length) step(`逐一触发 ${u.throwSites.length} 处 throw/reject（${u.throwSites.slice(0, 3).map((s) => `L${s.line} \`${s.code}\``).join("；")}${u.throwSites.length > 3 ? " 等" : ""}）`, "typed 错误码逐值对 ISD 错误表，保真传播");
      step("断言无残留：状态写/资源/持久化副作用与设计一致", "断言全部通过；失败含义＝该格语义失真");
      break;
    }
    default:
      step(`按 \`${c.type}\` × \`${c.cell}\` 展开规则构造输入（${c.file}:${c.line}）`, "输入就绪");
      step(`调用 ${call}`, "返回值/错误/副作用");
      step("逐值断言与设计声明一致", "断言通过");
  }
  return S;
}

const STD = (id, title, path) => `<!-- STD_DOCUMENT_COVER_BEGIN -->
# ${title}

| 文档字段 | 值 |
|---|---|
| Document ID | \`${id}\` |
| Document Version | \`0.1.0-draft.2\` |
| Status | \`Draft\` |
| Project | \`piko\` |
| Authority | \`piko\` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | \`2026-11-05\` |
| Last Modified Date | \`2026-11-05\` |
| Template ID | \`tests.unit-case\` |
| Template Version | \`3.3.0\` |
| Template Conformance | \`native\` |
| Std Conformance Total | 0 |
| Std Conformance Passed | 0 |
| Checklist Total | 0 |
| Checklist Conformed | 0 |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | \`corezilla/piko\` |
| Canonical Path | \`${path}\` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
>
> Std Conformance Total / Std Conformance Passed：STD 文档编写规范（索引 §3）检查了几条、遵守了几条。
> Checklist Total / Checklist Conformed：本篇模板的评审清单执行了几项、遵守了几项。两者是不同的检查，未执行填 0。
<!-- STD_DOCUMENT_COVER_END -->`;

let made = 0;
for (const c of list) {
  const path = `docs/70_verification/unit/cases/${c.case_id}.md`;
  const unit = unitOf.get(`${c.file}:${c.line}:${c.symbol}`) ??
    rows.find((r) => r.file === c.file && r.symbol === c.symbol);
  const S = stepsFor(c, unit);
  const call = c.kind === "ctor" ? `构造 \`${c.symbol}\`` : `调用 \`${c.symbol}\``;
  const L = [
    STD(c.case_id, `Piko Case ${c.case_id}`, path),
    `### 模板定位：方案、用例集与计划的边界`,
    ``,
    `- **一 Case 一文档**：本文档只承载**一个** Case；七字段固定顺序（可写"不适用"，不可删字段）。`,
    `- **一 Case 一脚本**：配套脚本文件名＝Case ID；公共 fixture/替身/断言调用公共脚本，不在本文件复制。`,
    `- **测试脚本的唯一依据**：编码者按本文档写测试代码，不需要回读方案或设计正文猜测意图；段落锚点＝脚本名。`,
    `- **不预填结果**：本文档持有实现状态；执行状态与 Verdict 只在 Run 报告。`,
    ``,
    `### 状态语义：实现状态`,
    ``,
    `- **测试代码实现状态**：\`Planned\` / \`Implemented\`——唯一权威：本文档 §1 总账与 §4；禁止：计划中的测试函数冒充可执行入口。`,
    `- **执行状态**：\`NOT_RUN\` / \`BLOCKED\` / \`INVALID\`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。`,
    `- **实际判定 Verdict**：\`PASS\` / \`FAIL\`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。`,
    ``,
    `## 1. 集合概览与维度总账`,
    ``,
    `绑定方案：\`unit-test-scheme\`；本 Case 的唯一登记位置：方案 §6.1 清单行${
      c.detail?.what === "coarse" ? "（粗粒度登记）" : `／§6.1A 分卷 \`${c.module}\` 登记行`}。`,
    ``,
    `#### 1.1 总账 · ${c.case_id}`,
    ``,
    `对象函数：\`${c.symbol}\`（\`${c.file}:${c.line}\`，${c.kind}/${c.visibility}）`,
    ``,
    `维度格（方案 §2.3 行×格）：\`${c.type}\` × \`${c.cell}\``,
    ``,
    `实现状态：\`Planned\``,
    ``,
    `## 2. 公共前提与替身矩阵`,
    ``,
    `#### 2.1 前提 · ENV-UNIT`,
    ``,
    `版本 / 来源：\`docs/70_verification/assets/asset-design.md\`（ENV-UNIT 装配；替身 \`FAKE-LLM\`/\`FAKE-MATRIX\`/\`FAKE-SCP\`、受控时钟 \`FAKE-CLK\`、种子 \`SEEDS\` 同册——本 Case 只引用，不复述）`,
    ``,
    `影响 Case：本 Case`,
    ``,
    `## 3. 用例（固定段落块）`,
    ``,
    `#### 3.1 ${c.case_id} · ${clip(c.summary, 90)}`,
    ``,
    `**责任 / 明确不测**：`,
    ``,
    `验证 \`${c.symbol}\`（\`${c.file}:${c.line}\`）在 \`${c.type}\` × \`${c.cell}\` 这一格上的行为与设计声明一致（${c.summary}）；不测同符号其余格（兄弟 Case 承担）、不测模块整体行为（归 MT）。`,
    ``,
    `**维度坐标（方案 §2.3 行×格）**：`,
    ``,
    `\`${c.symbol}\` × \`${c.type}\` × \`${c.cell}\`。`,
    ``,
    `**输入构造**：`,
    ``,
    `见 §3.1 步骤 1——取值全部写死或给生成规则（含边界常量时给出具体数），无隐含依赖。`,
    ``,
    `**步骤与观察点**：`,
    ``,
    ...S.flatMap((s, i) => [`**步骤 ${i + 1}**——动作：${s.action}`, ``, `观察点：${s.observe}`, ``]).slice(0, -1),
    ``,
    `**Oracle 与预期**：`,
    ``,
    `以 \`${designOf(c.module)}\` 与其 ISD（\`docs/50_implementation_design/${MODULE_OF[c.module]}-impl.isd.md\`）中 \`${c.symbol}\` 所属条目的 \`VRC\` 为唯一权威；逐值判据来自规格/手算规则/冻结向量，不引用被测实现自证；本段只细化执行断言，冲突回溯设计修订。`,
    ``,
    `**错误路径 / 清理**：`,
    ``,
    `失败必须 typed 化且保真传播；内存 SQLite 与替身每例重置；临时密钥与 staging 用后删除且不触碰 \`~/.ssh\`。`,
    ``,
    `**脚本 / 实现状态**：`,
    ``,
    `\`tests/unit/cases/${c.case_id}.test.ts\` · \`Planned\``,
    ``,
    `## 4. 集合状态汇总与缺口`,
    ``,
    `- **实现状态**：\`Planned\`（与 §1 一致）`,
    `- **本 Case 承担的缺口清单（格＋Owner＋最晚关闭 Gate）**：脚本待建 → \`G-EXEC-UT-3\`（Piko QA，波次二排期内）`,
    ``,
  ];
  writeFileSync(path, L.join("\n"));
  writeFileSync(path.replace(/\.md$/, ".metadata.json"), JSON.stringify({
    project: "piko", authority: "piko",
    document_id: c.case_id, document_type: "tests.unit-case",
    document_version: "0.1.0-draft.2", title: `Piko Case ${c.case_id}`,
    document_owner: "Piko QA", authors: ["opencode"],
    template_id: "tests.unit-case", template_version: "3.3.0",
    template_sha256: "2123f374b9e0354bc5d141af68aea4f57021ffa5e780ae2d64cf0255755d86a3",
    template_conformance: "native", tailoring_ref: null,
    migration_map_ref: null, design_level: "module", domain: ["mixed"],
    status: "draft", visibility: "project",
    source_repository: "corezilla/piko", source_path: path,
    reviewed_commit: null, parent_document_id: "unit-test-scheme",
    supersedes: null, created_at: "2026-11-05", last_modified_at: "2026-11-05",
    design_object_id: null,
  }, null, 2) + "\n");
  made += 1;
}
console.log(`case docs written: ${made}`);
