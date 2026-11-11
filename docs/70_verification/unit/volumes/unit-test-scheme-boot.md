# UT 分卷登记 · BOOT（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `已实现`（`Implemented`）——每条都有真脚本（`STATUS: real`）；执行状态与 Verdict 只在 Run 报告。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：190**（对象类型分布：字符串/路径/枚举输入 45；状态分支 61；错误路径 33；纯函数/无副作用 42；持久化/序列化 1；数值/长度上限参数 8）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-BOOT-011` | `resolveSecret`（`config.ts:132`） | `字符串/路径/枚举输入` × `空` | 参数 `ref: string` 的 `空` 类（config.ts:132） | 已实现 |
| `UT-BOOT-012` | `resolveSecret`（`config.ts:132`） | `字符串/路径/枚举输入` × `超长` | 参数 `ref: string` 的 `超长` 类（config.ts:132） | 已实现 |
| `UT-BOOT-013` | `resolveSecret`（`config.ts:132`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `ref: string` 的 `注入字符` 类（config.ts:132） | 已实现 |
| `UT-BOOT-014` | `resolveSecret`（`config.ts:132`） | `状态分支` × `合法迁移` | 分支 L135 `if (kind === "env")`（if；config.ts） | 已实现 |
| `UT-BOOT-015` | `resolveSecret`（`config.ts:132`） | `状态分支` × `合法迁移` | 分支 L137 `!v`（!；config.ts） | 已实现 |
| `UT-BOOT-016` | `resolveSecret`（`config.ts:132`） | `状态分支` × `合法迁移` | 分支 L140 `if (kind === "file")`（if；config.ts） | 已实现 |
| `UT-BOOT-017` | `resolveSecret`（`config.ts:132`） | `错误路径` × `每个 typed 错误码` | throw L137 `reject`（守卫 `if (!v)`；config.ts） | 已实现 |
| `UT-BOOT-018` | `resolveSecret`（`config.ts:132`） | `错误路径` × `每个 typed 错误码` | throw L141 `reject`（守卫 `unconditional`；config.ts） | 已实现 |
| `UT-BOOT-019` | `resolveSecret`（`config.ts:132`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L138 值 `v` 逐值断言（config.ts） | 已实现 |
| `UT-BOOT-020` | `resolveSecret`（`config.ts:132`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L140 值 `(await readFile(key, "utf8")).trim()` 逐值断言（config.ts） | 已实现 |
| `UT-BOOT-021` | `validateToolRegistry`（`config.ts:26`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `tools: ToolRegistry` 的 `每等价类合法值` 类（config.ts:26） | 已实现 |
| `UT-BOOT-022` | `validateToolRegistry`（`config.ts:26`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `tools: ToolRegistry` 的 `边界(上/下/零/空/满)` 类（config.ts:26） | 已实现 |
| `UT-BOOT-023` | `validateToolRegistry`（`config.ts:26`） | `纯函数/无副作用` × `非法值` | 参数 `tools: ToolRegistry` 的 `非法值` 类（config.ts:26） | 已实现 |
| `UT-BOOT-024` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L37 `loop (Object.values(tools.recovery_contracts))`（loop；config.ts） | 已实现 |
| `UT-BOOT-025` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L38 `!supported.has(c.implementation_ref)`（!；config.ts） | 已实现 |
| `UT-BOOT-026` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L40 `loop (Object.values(tools.profiles))`（loop；config.ts） | 已实现 |
| `UT-BOOT-027` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L41 `loop (Object.entries(p.tools))`（loop；config.ts） | 已实现 |
| `UT-BOOT-028` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L42 `!knownTools.has(name)`（!；config.ts） | 已实现 |
| `UT-BOOT-029` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L43 `? t.recovery_contract_ref :`（ternary；config.ts） | 已实现 |
| `UT-BOOT-030` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L44 `t.recovery_contract_ref && !contract`（&&；config.ts） | 已实现 |
| `UT-BOOT-031` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L44 `!contract`（!；config.ts） | 已实现 |
| `UT-BOOT-032` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L45 `t.replay === "safe" && t.effect !== "read_onl…`（&&；config.ts） | 已实现 |
| `UT-BOOT-033` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L45 `!contract`（!；config.ts） | 已实现 |
| `UT-BOOT-034` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L46 `if (contract?.implementation_ref === "builtin…`（if；config.ts） | 已实现 |
| `UT-BOOT-035` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L46 `contract?.implementation_ref === "builtin:wor…`（&&；config.ts） | 已实现 |
| `UT-BOOT-036` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L46 `contract?.implementation_ref`（?.；config.ts） | 已实现 |
| `UT-BOOT-037` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L46 `!["write", "edit"].includes(name) \|\| t.effect…`（\|\|；config.ts） | 已实现 |
| `UT-BOOT-038` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L46 `!["write", "edit"].includes(name)`（!；config.ts） | 已实现 |
| `UT-BOOT-039` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L49 `if (contract?.implementation_ref !== "builtin…`（if；config.ts） | 已实现 |
| `UT-BOOT-040` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L49 `contract?.implementation_ref !== "builtin:wor…`（&&；config.ts） | 已实现 |
| `UT-BOOT-041` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L49 `contract?.implementation_ref`（?.；config.ts） | 已实现 |
| `UT-BOOT-042` | `validateToolRegistry`（`config.ts:26`） | `状态分支` × `合法迁移` | 分支 L50 `contract?.implementation_ref`（?.；config.ts） | 已实现 |
| `UT-BOOT-043` | `validateToolRegistry`（`config.ts:26`） | `错误路径` × `每个 typed 错误码` | throw L38 `reject`（守卫 `if (!supported.has(c.implementation_ref…`；config.ts） | 已实现 |
| `UT-BOOT-044` | `validateToolRegistry`（`config.ts:26`） | `错误路径` × `每个 typed 错误码` | throw L42 `reject`（守卫 `if (!knownTools.has(name))`；config.ts） | 已实现 |
| `UT-BOOT-045` | `validateToolRegistry`（`config.ts:26`） | `错误路径` × `每个 typed 错误码` | throw L44 `reject`（守卫 `if (t.recovery_contract_ref && !contrac…`；config.ts） | 已实现 |
| `UT-BOOT-046` | `validateToolRegistry`（`config.ts:26`） | `错误路径` × `每个 typed 错误码` | throw L45 `reject`（守卫 `if (t.replay === "safe" && t.effect !==…`；config.ts） | 已实现 |
| `UT-BOOT-047` | `validateToolRegistry`（`config.ts:26`） | `错误路径` × `每个 typed 错误码` | throw L47 `reject`（守卫 `if (contract?.implementation_ref === "b…`；config.ts） | 已实现 |
| `UT-BOOT-048` | `validateToolRegistry`（`config.ts:26`） | `错误路径` × `每个 typed 错误码` | throw L50 `reject`（守卫 `if (contract?.implementation_ref !== "b…`；config.ts） | 已实现 |
| `UT-BOOT-049` | `gitHead`（`config.ts:56`） | `字符串/路径/枚举输入` × `空` | 参数 `repo: string` 的 `空` 类（config.ts:56） | 已实现 |
| `UT-BOOT-050` | `gitHead`（`config.ts:56`） | `字符串/路径/枚举输入` × `超长` | 参数 `repo: string` 的 `超长` 类（config.ts:56） | 已实现 |
| `UT-BOOT-051` | `gitHead`（`config.ts:56`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `repo: string` 的 `注入字符` 类（config.ts:56） | 已实现 |
| `UT-BOOT-052` | `gitHead`（`config.ts:56`） | `状态分支` × `合法迁移` | 分支 L58 `if (!head.startsWith("ref: "))`（if；config.ts） | 已实现 |
| `UT-BOOT-053` | `gitHead`（`config.ts:56`） | `状态分支` × `合法迁移` | 分支 L58 `!head.startsWith("ref: ")`（!；config.ts） | 已实现 |
| `UT-BOOT-054` | `gitHead`（`config.ts:56`） | `错误路径` × `每个 typed 错误码` | 分支 L62 `catch (`${repo}/.git/packed-refs`, "utf8")`（catch；config.ts） | 已实现 |
| `UT-BOOT-055` | `gitHead`（`config.ts:56`） | `状态分支` × `合法迁移` | 分支 L65 `!line`（!；config.ts） | 已实现 |
| `UT-BOOT-056` | `gitHead`（`config.ts:56`） | `错误路径` × `每个 typed 错误码` | throw L65 `cannot resolve pinned Pi HEAD`（守卫 `if (!line)`；config.ts） | 已实现 |
| `UT-BOOT-057` | `gitHead`（`config.ts:56`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L58 值 `head` 逐值断言（config.ts） | 已实现 |
| `UT-BOOT-058` | `gitHead`（`config.ts:56`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L61 值 `(await readFile(`${repo}/.git/${ref}`, …` 逐值断言（config.ts） | 已实现 |
| `UT-BOOT-059` | `gitHead`（`config.ts:56`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L66 值 `line.split(" ")[0]!` 逐值断言（config.ts） | 已实现 |
| `UT-BOOT-060` | `validated`（`config.ts:70`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `value: unknown` 的 `每等价类合法值` 类（config.ts:70） | 已实现 |
| `UT-BOOT-061` | `validated`（`config.ts:70`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `value: unknown` 的 `边界(上/下/零/空/满)` 类（config.ts:70） | 已实现 |
| `UT-BOOT-062` | `validated`（`config.ts:70`） | `纯函数/无副作用` × `非法值` | 参数 `value: unknown` 的 `非法值` 类（config.ts:70） | 已实现 |
| `UT-BOOT-063` | `validated`（`config.ts:70`） | `字符串/路径/枚举输入` × `空` | 参数 `schemaPath: string` 的 `空` 类（config.ts:70） | 已实现 |
| `UT-BOOT-064` | `validated`（`config.ts:70`） | `字符串/路径/枚举输入` × `超长` | 参数 `schemaPath: string` 的 `超长` 类（config.ts:70） | 已实现 |
| `UT-BOOT-065` | `validated`（`config.ts:70`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `schemaPath: string` 的 `注入字符` 类（config.ts:70） | 已实现 |
| `UT-BOOT-066` | `validated`（`config.ts:70`） | `状态分支` × `合法迁移` | 分支 L72 `(Ajv as any).default ?? Ajv`（??；config.ts） | 已实现 |
| `UT-BOOT-067` | `validated`（`config.ts:70`） | `状态分支` × `合法迁移` | 分支 L73 `(addFormats as any).default ?? addFormats`（??；config.ts） | 已实现 |
| `UT-BOOT-068` | `validated`（`config.ts:70`） | `状态分支` × `合法迁移` | 分支 L76 `!ajv.validate(schema, value)`（!；config.ts） | 已实现 |
| `UT-BOOT-069` | `validated`（`config.ts:70`） | `错误路径` × `每个 typed 错误码` | throw L76 `reject`（守卫 `if (!ajv.validate(schema, value))`；config.ts） | 已实现 |
| `UT-BOOT-070` | `validated`（`config.ts:70`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L77 值 `value as T` 逐值断言（config.ts） | 已实现 |
| `UT-BOOT-071` | `loadConfig`（`config.ts:86`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（config.ts:86） | 已实现 |
| `UT-BOOT-072` | `loadConfig`（`config.ts:86`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（config.ts:86） | 已实现 |
| `UT-BOOT-073` | `loadConfig`（`config.ts:86`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（config.ts:86） | 已实现 |
| `UT-BOOT-074` | `loadConfig`（`config.ts:86`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `root: inferred` 的 `每等价类合法值` 类（config.ts:86） | 已实现 |
| `UT-BOOT-075` | `loadConfig`（`config.ts:86`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `root: inferred` 的 `边界(上/下/零/空/满)` 类（config.ts:86） | 已实现 |
| `UT-BOOT-076` | `loadConfig`（`config.ts:86`） | `纯函数/无副作用` × `非法值` | 参数 `root: inferred` 的 `非法值` 类（config.ts:86） | 已实现 |
| `UT-BOOT-077` | `loadConfig`（`config.ts:86`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `root` 缺省/显式两态（config.ts:86） | 已实现 |
| `UT-BOOT-078` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L100 `!harness.includes("onRawUsage")`（!；config.ts） | 已实现 |
| `UT-BOOT-079` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L108 `if (typeof process.env.PIKO_MATRIX_USER_ID ==…`（if；config.ts） | 已实现 |
| `UT-BOOT-080` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L108 `typeof process.env.PIKO_MATRIX_USER_ID === "s…`（&&；config.ts） | 已实现 |
| `UT-BOOT-081` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L111 `if (typeof process.env.PIKO_MATRIX_ACCESS_TOK…`（if；config.ts） | 已实现 |
| `UT-BOOT-082` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L111 `typeof process.env.PIKO_MATRIX_ACCESS_TOKEN =…`（&&；config.ts） | 已实现 |
| `UT-BOOT-083` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L114 `if (typeof process.env.PIKO_MATRIX_HOMESERVER…`（if；config.ts） | 已实现 |
| `UT-BOOT-084` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L114 `typeof process.env.PIKO_MATRIX_HOMESERVER ===…`（&&；config.ts） | 已实现 |
| `UT-BOOT-085` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L117 `if (typeof process.env.PIKO_MATRIX_ENABLED ==…`（if；config.ts） | 已实现 |
| `UT-BOOT-086` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L120 `if (Object.keys(envOverrides).length > 0)`（if；config.ts） | 已实现 |
| `UT-BOOT-087` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L125 `if (config.matrix.enabled && !config.matrix.d…`（if；config.ts） | 已实现 |
| `UT-BOOT-088` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L125 `config.matrix.enabled && !config.matrix.direc…`（&&；config.ts） | 已实现 |
| `UT-BOOT-089` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L125 `!config.matrix.direct_access_token`（!；config.ts） | 已实现 |
| `UT-BOOT-090` | `loadConfig`（`config.ts:86`） | `状态分支` × `合法迁移` | 分支 L125 `!config.matrix.access_token_secret_ref`（!；config.ts） | 已实现 |
| `UT-BOOT-091` | `loadConfig`（`config.ts:86`） | `错误路径` × `每个 typed 错误码` | throw L97 `Pi checkout commit mismatch`（守卫 `if ((await gitHead(piRoot)) !== config.…`；config.ts） | 已实现 |
| `UT-BOOT-092` | `loadConfig`（`config.ts:86`） | `错误路径` × `每个 typed 错误码` | throw L100 `Pi revision lacks onRawUsage extension point`（守卫 `if (!harness.includes("onRawUsage"))`；config.ts） | 已实现 |
| `UT-BOOT-093` | `loadConfig`（`config.ts:86`） | `错误路径` × `每个 typed 错误码` | throw L126 `Matrix is enabled but neither direct_access_token nor access_token_secret_ref is configured`（守卫 `if (config.matrix.enabled && !config.ma…`；config.ts） | 已实现 |
| `UT-BOOT-094` | `loadConfig`（`config.ts:86`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L129 值 `{ config, tools }` 逐值断言（config.ts） | 已实现 |
| `UT-BOOT-095` | `absolute`（`durable-fs.ts:20`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（durable-fs.ts:20） | 已实现 |
| `UT-BOOT-096` | `absolute`（`durable-fs.ts:20`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（durable-fs.ts:20） | 已实现 |
| `UT-BOOT-097` | `absolute`（`durable-fs.ts:20`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（durable-fs.ts:20） | 已实现 |
| `UT-BOOT-098` | `absolute`（`durable-fs.ts:20`） | `状态分支` × `合法迁移` | 分支 L20 `? isAbsolute(path) :`（ternary；durable-fs.ts） | 已实现 |
| `UT-BOOT-099` | `absolute`（`durable-fs.ts:20`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L20 值 `isAbsolute(path)?resolve(path):resolve(…` 逐值断言（durable-fs.ts） | 已实现 |
| `UT-BOOT-100` | `sync`（`durable-fs.ts:21`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-101` | `sync`（`durable-fs.ts:21`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-102` | `sync`（`durable-fs.ts:21`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-103` | `sync`（`durable-fs.ts:21`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `directory: inferred` 的 `每等价类合法值` 类（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-104` | `sync`（`durable-fs.ts:21`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `directory: inferred` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-105` | `sync`（`durable-fs.ts:21`） | `纯函数/无副作用` × `非法值` | 参数 `directory: inferred` 的 `非法值` 类（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-106` | `sync`（`durable-fs.ts:21`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `directory` 缺省/显式两态（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-107` | `sync`（`durable-fs.ts:21`） | `状态分支` × `合法迁移` | 分支 L22 `? directory :`（ternary；durable-fs.ts） | 已实现 |
| `UT-BOOT-108` | `sync`（`durable-fs.ts:21`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `open(directory?dirname(this.absolute(path` 拒绝必须 typed 化上抛（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-109` | `sync`（`durable-fs.ts:21`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `handle.sync(` 拒绝必须 typed 化上抛（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-110` | `sync`（`durable-fs.ts:21`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #3：被调方 `handle.close(` 拒绝必须 typed 化上抛（durable-fs.ts:21） | 已实现 |
| `UT-BOOT-111` | `exec`（`durable-fs.ts:25`） | `字符串/路径/枚举输入` × `空` | 参数 `command: string` 的 `空` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-112` | `exec`（`durable-fs.ts:25`） | `字符串/路径/枚举输入` × `超长` | 参数 `command: string` 的 `超长` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-113` | `exec`（`durable-fs.ts:25`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `command: string` 的 `注入字符` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-114` | `exec`（`durable-fs.ts:25`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `options: ShellExecOptions \| undefined` 的 `每等价类合法值` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-115` | `exec`（`durable-fs.ts:25`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `options: ShellExecOptions \| undefined` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-116` | `exec`（`durable-fs.ts:25`） | `纯函数/无副作用` × `非法值` | 参数 `options: ShellExecOptions \| undefined` 的 `非法值` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-117` | `exec`（`durable-fs.ts:25`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: Context` 的 `每等价类合法值` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-118` | `exec`（`durable-fs.ts:25`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-119` | `exec`（`durable-fs.ts:25`） | `纯函数/无副作用` × `非法值` | 参数 `context: Context` 的 `非法值` 类（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-120` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L39 `options?.onUpdate`（?.；durable-fs.ts） | 已实现 |
| `UT-BOOT-121` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L40 `? options :`（ternary；durable-fs.ts） | 已实现 |
| `UT-BOOT-122` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L44 `if (update.kind === "replace")`（if；durable-fs.ts） | 已实现 |
| `UT-BOOT-123` | `exec`（`durable-fs.ts:25`） | `状态分支` × `每个非法迁移拒绝` | 分支 L47 `if (update.kind === "append") { capture…`（else；durable-fs.ts） | 已实现 |
| `UT-BOOT-124` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L46 `update.output.truncation?.truncated`（?.；durable-fs.ts） | 已实现 |
| `UT-BOOT-125` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L47 `if (update.kind === "append")`（if；durable-fs.ts） | 已实现 |
| `UT-BOOT-126` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L59 `if (result.ok)`（if；durable-fs.ts） | 已实现 |
| `UT-BOOT-127` | `exec`（`durable-fs.ts:25`） | `状态分支` × `每个非法迁移拒绝` | 分支 L72 `{ this.executionFacts.record({ tool_cal…`（else；durable-fs.ts） | 已实现 |
| `UT-BOOT-128` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L66 `capturedTruncated \|\| Boolean(result.value.tru…`（\|\|；durable-fs.ts） | 已实现 |
| `UT-BOOT-129` | `exec`（`durable-fs.ts:25`） | `状态分支` × `合法迁移` | 分支 L66 `result.value.truncation?.truncated`（?.；durable-fs.ts） | 已实现 |
| `UT-BOOT-130` | `exec`（`durable-fs.ts:25`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `super.exec(command, tappedOptions, context` 拒绝必须 typed 化上抛（durable-fs.ts:25） | 已实现 |
| `UT-BOOT-131` | `exec`（`durable-fs.ts:25`） | `持久化/序列化` × `round-trip` | 状态写 L55 → `db`（durable-fs.ts） | 已实现 |
| `UT-BOOT-132` | `exec`（`durable-fs.ts:25`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L86 值 `result` 逐值断言（durable-fs.ts） | 已实现 |
| `UT-BOOT-133` | `writeFile`（`durable-fs.ts:88`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-134` | `writeFile`（`durable-fs.ts:88`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-135` | `writeFile`（`durable-fs.ts:88`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-136` | `writeFile`（`durable-fs.ts:88`） | `字符串/路径/枚举输入` × `空` | 参数 `content: string\|Uint8Array` 的 `空` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-137` | `writeFile`（`durable-fs.ts:88`） | `字符串/路径/枚举输入` × `超长` | 参数 `content: string\|Uint8Array` 的 `超长` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-138` | `writeFile`（`durable-fs.ts:88`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `content: string\|Uint8Array` 的 `注入字符` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-139` | `writeFile`（`durable-fs.ts:88`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: Context` 的 `每等价类合法值` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-140` | `writeFile`（`durable-fs.ts:88`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-141` | `writeFile`（`durable-fs.ts:88`） | `纯函数/无副作用` × `非法值` | 参数 `context: Context` 的 `非法值` 类（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-142` | `writeFile`（`durable-fs.ts:88`） | `状态分支` × `合法迁移` | 分支 L90 `if (result.ok)`（if；durable-fs.ts） | 已实现 |
| `UT-BOOT-143` | `writeFile`（`durable-fs.ts:88`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `super.writeFile(path,content,context` 拒绝必须 typed 化上抛（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-144` | `writeFile`（`durable-fs.ts:88`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `this.sync(path` 拒绝必须 typed 化上抛（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-145` | `writeFile`（`durable-fs.ts:88`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #3：被调方 `this.sync(path,true` 拒绝必须 typed 化上抛（durable-fs.ts:88） | 已实现 |
| `UT-BOOT-146` | `writeFile`（`durable-fs.ts:88`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L91 值 `result` 逐值断言（durable-fs.ts） | 已实现 |
| `UT-BOOT-147` | `appendFile`（`durable-fs.ts:93`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-148` | `appendFile`（`durable-fs.ts:93`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-149` | `appendFile`（`durable-fs.ts:93`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-150` | `appendFile`（`durable-fs.ts:93`） | `字符串/路径/枚举输入` × `空` | 参数 `content: string\|Uint8Array` 的 `空` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-151` | `appendFile`（`durable-fs.ts:93`） | `字符串/路径/枚举输入` × `超长` | 参数 `content: string\|Uint8Array` 的 `超长` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-152` | `appendFile`（`durable-fs.ts:93`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `content: string\|Uint8Array` 的 `注入字符` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-153` | `appendFile`（`durable-fs.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: Context` 的 `每等价类合法值` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-154` | `appendFile`（`durable-fs.ts:93`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-155` | `appendFile`（`durable-fs.ts:93`） | `纯函数/无副作用` × `非法值` | 参数 `context: Context` 的 `非法值` 类（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-156` | `appendFile`（`durable-fs.ts:93`） | `状态分支` × `合法迁移` | 分支 L95 `if (result.ok)`（if；durable-fs.ts） | 已实现 |
| `UT-BOOT-157` | `appendFile`（`durable-fs.ts:93`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `super.appendFile(path,content,context` 拒绝必须 typed 化上抛（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-158` | `appendFile`（`durable-fs.ts:93`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `this.sync(path` 拒绝必须 typed 化上抛（durable-fs.ts:93） | 已实现 |
| `UT-BOOT-159` | `appendFile`（`durable-fs.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L96 值 `result` 逐值断言（durable-fs.ts） | 已实现 |
| `UT-BOOT-160` | `renameFile`（`durable-fs.ts:98`） | `字符串/路径/枚举输入` × `空` | 参数 `source: string` 的 `空` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-161` | `renameFile`（`durable-fs.ts:98`） | `字符串/路径/枚举输入` × `超长` | 参数 `source: string` 的 `超长` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-162` | `renameFile`（`durable-fs.ts:98`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `source: string` 的 `注入字符` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-163` | `renameFile`（`durable-fs.ts:98`） | `字符串/路径/枚举输入` × `空` | 参数 `destination: string` 的 `空` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-164` | `renameFile`（`durable-fs.ts:98`） | `字符串/路径/枚举输入` × `超长` | 参数 `destination: string` 的 `超长` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-165` | `renameFile`（`durable-fs.ts:98`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `destination: string` 的 `注入字符` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-166` | `renameFile`（`durable-fs.ts:98`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: Context` 的 `每等价类合法值` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-167` | `renameFile`（`durable-fs.ts:98`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-168` | `renameFile`（`durable-fs.ts:98`） | `纯函数/无副作用` × `非法值` | 参数 `context: Context` 的 `非法值` 类（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-169` | `renameFile`（`durable-fs.ts:98`） | `状态分支` × `合法迁移` | 分支 L100 `if (result.ok)`（if；durable-fs.ts） | 已实现 |
| `UT-BOOT-170` | `renameFile`（`durable-fs.ts:98`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `super.renameFile(source,destination,context` 拒绝必须 typed 化上抛（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-171` | `renameFile`（`durable-fs.ts:98`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `this.sync(destination` 拒绝必须 typed 化上抛（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-172` | `renameFile`（`durable-fs.ts:98`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #3：被调方 `this.sync(destination,true` 拒绝必须 typed 化上抛（durable-fs.ts:98） | 已实现 |
| `UT-BOOT-173` | `renameFile`（`durable-fs.ts:98`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L101 值 `result` 逐值断言（durable-fs.ts） | 已实现 |
| `UT-BOOT-174` | `runControlProcess`（`main.ts:16`） | `字符串/路径/枚举输入` × `空` | 参数 `configPath: string` 的 `空` 类（main.ts:16） | 已实现 |
| `UT-BOOT-175` | `runControlProcess`（`main.ts:16`） | `字符串/路径/枚举输入` × `超长` | 参数 `configPath: string` 的 `超长` 类（main.ts:16） | 已实现 |
| `UT-BOOT-176` | `runControlProcess`（`main.ts:16`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `configPath: string` 的 `注入字符` 类（main.ts:16） | 已实现 |
| `UT-BOOT-177` | `runControlProcess`（`main.ts:16`） | `字符串/路径/枚举输入` × `空` | 参数 `root: string` 的 `空` 类（main.ts:16） | 已实现 |
| `UT-BOOT-178` | `runControlProcess`（`main.ts:16`） | `字符串/路径/枚举输入` × `超长` | 参数 `root: string` 的 `超长` 类（main.ts:16） | 已实现 |
| `UT-BOOT-179` | `runControlProcess`（`main.ts:16`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `root: string` 的 `注入字符` 类（main.ts:16） | 已实现 |
| `UT-BOOT-180` | `runControlProcess`（`main.ts:16`） | `状态分支` × `合法迁移` | 分支 L37 `if (outcome === "StopRequested")`（if；main.ts） | 已实现 |
| `UT-BOOT-181` | `runControlProcess`（`main.ts:16`） | `状态分支` × `合法迁移` | 分支 L44 `if (closing)`（if；main.ts） | 已实现 |
| `UT-BOOT-182` | `runControlProcess`（`main.ts:16`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `loadConfig(configPath, root` 拒绝必须 typed 化上抛（main.ts:16） | 已实现 |
| `UT-BOOT-183` | `runControlProcess`（`main.ts:16`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `resolveSecret(config.api_auth.bearer_token_secret_ref` 拒绝必须 typed 化上抛（main.ts:16） | 已实现 |
| `UT-BOOT-184` | `runControlProcess`（`main.ts:16`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #3：被调方 `ApiServer.create(config, store, auth, (taskId, outcome` 拒绝必须 typed 化上抛（main.ts:16） | 已实现 |
| `UT-BOOT-185` | `runControlProcess`（`main.ts:16`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #4：被调方 `server.listen(` 拒绝必须 typed 化上抛（main.ts:16） | 已实现 |
| `UT-BOOT-186` | `runControlProcess`（`main.ts:16`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #5：被调方 `server.close(` 拒绝必须 typed 化上抛（main.ts:16） | 已实现 |
| `UT-BOOT-187` | `runControlProcess`（`main.ts:16`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #6：被调方 `supervisor.stop(` 拒绝必须 typed 化上抛（main.ts:16） | 已实现 |
| `UT-BOOT-188` | `runControlProcess`（`main.ts:16`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L44 值 `（无值 return：提前退出）` 逐值断言（main.ts） | 已实现 |
| `UT-BOOT-189` | `main`（`main.ts:55`） | `数值/长度上限参数` × `恰好通过` | 参数 `argv: inferred` 的 `恰好通过` 类（main.ts:55） | 已实现 |
| `UT-BOOT-190` | `main`（`main.ts:55`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `argv: inferred` 的 `+1 拒绝` 类（main.ts:55） | 已实现 |
| `UT-BOOT-191` | `main`（`main.ts:55`） | `数值/长度上限参数` × `−1 通过` | 参数 `argv: inferred` 的 `−1 通过` 类（main.ts:55） | 已实现 |
| `UT-BOOT-192` | `main`（`main.ts:55`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `argv` 缺省/显式两态（main.ts:55） | 已实现 |
| `UT-BOOT-193` | `main`（`main.ts:55`） | `数值/长度上限参数` × `恰好通过` | 参数 `env: inferred` 的 `恰好通过` 类（main.ts:55） | 已实现 |
| `UT-BOOT-194` | `main`（`main.ts:55`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `env: inferred` 的 `+1 拒绝` 类（main.ts:55） | 已实现 |
| `UT-BOOT-195` | `main`（`main.ts:55`） | `数值/长度上限参数` × `−1 通过` | 参数 `env: inferred` 的 `−1 通过` 类（main.ts:55） | 已实现 |
| `UT-BOOT-196` | `main`（`main.ts:55`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `env` 缺省/显式两态（main.ts:55） | 已实现 |
| `UT-BOOT-197` | `main`（`main.ts:55`） | `状态分支` × `合法迁移` | 分支 L56 `argv[2] ?? env.PIKO_CONFIG ?? "config/runtime…`（??；main.ts） | 已实现 |
| `UT-BOOT-198` | `main`（`main.ts:55`） | `状态分支` × `合法迁移` | 分支 L56 `argv[2] ?? env.PIKO_CONFIG`（??；main.ts） | 已实现 |
| `UT-BOOT-199` | `main`（`main.ts:55`） | `状态分支` × `合法迁移` | 分支 L57 `import.meta.dirname ?? "."`（??；main.ts） | 已实现 |
| `UT-BOOT-200` | `main`（`main.ts:55`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `runControlProcess(configPath, root` 拒绝必须 typed 化上抛（main.ts:55） | 已实现 |
