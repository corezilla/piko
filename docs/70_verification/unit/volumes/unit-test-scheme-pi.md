# UT 分卷登记 · PI（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：860**（对象类型分布：字符串/路径/枚举输入 139；纯函数/无副作用 246；状态分支 384；错误路径 53；数值/长度上限参数 25；时间域行为 2；资源获取/释放 9；并发/可重入 2）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-PI-013` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `空` | 参数 `baseUrl: string` 的 `空` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-014` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `超长` | 参数 `baseUrl: string` 的 `超长` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-015` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `baseUrl: string` 的 `注入字符` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-016` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `空` | 参数 `apiKey: string` 的 `空` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-017` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `超长` | 参数 `apiKey: string` 的 `超长` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-018` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `apiKey: string` 的 `注入字符` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-019` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `空` | 参数 `defaultScope: string` 的 `空` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-020` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `超长` | 参数 `defaultScope: string` 的 `超长` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-021` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `defaultScope: string` 的 `注入字符` 类（graphrag-client.ts:109） | 待实现 |
| `UT-PI-022` | `constructor`（`graphrag-client.ts:109`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `defaultScope` 缺省/显式两态（graphrag-client.ts:109） | 待实现 |
| `UT-PI-023` | `search`（`graphrag-client.ts:130`） | `字符串/路径/枚举输入` × `空` | 参数 `query: string` 的 `空` 类（graphrag-client.ts:130） | 待实现 |
| `UT-PI-024` | `search`（`graphrag-client.ts:130`） | `字符串/路径/枚举输入` × `超长` | 参数 `query: string` 的 `超长` 类（graphrag-client.ts:130） | 待实现 |
| `UT-PI-025` | `search`（`graphrag-client.ts:130`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `query: string` 的 `注入字符` 类（graphrag-client.ts:130） | 待实现 |
| `UT-PI-026` | `search`（`graphrag-client.ts:130`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `options: GraphRAGSearchOptions` 的 `每等价类合法值` 类（graphrag-client.ts:130） | 待实现 |
| `UT-PI-027` | `search`（`graphrag-client.ts:130`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `options: GraphRAGSearchOptions` 的 `边界(上/下/零/空/满)` 类（graphrag-client.ts:130） | 待实现 |
| `UT-PI-028` | `search`（`graphrag-client.ts:130`） | `纯函数/无副作用` × `非法值` | 参数 `options: GraphRAGSearchOptions` 的 `非法值` 类（graphrag-client.ts:130） | 待实现 |
| `UT-PI-029` | `search`（`graphrag-client.ts:130`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `options` 缺省/显式两态（graphrag-client.ts:130） | 待实现 |
| `UT-PI-030` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L134 `if (!query \|\| query.trim() === "")`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-031` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L134 `!query \|\| query.trim() === ""`（\|\|；graphrag-client.ts） | 待实现 |
| `UT-PI-032` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L134 `!query`（!；graphrag-client.ts） | 待实现 |
| `UT-PI-033` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L140 `options?.scope ?? this.defaultScope ?? "all"`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-034` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L140 `options?.scope ?? this.defaultScope`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-035` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L140 `options?.scope`（?.；graphrag-client.ts） | 待实现 |
| `UT-PI-036` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L147 `options?.max_results ?? 5`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-037` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L147 `options?.max_results`（?.；graphrag-client.ts） | 待实现 |
| `UT-PI-038` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L156 `options?.filters ?? {}`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-039` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L156 `options?.filters`（?.；graphrag-client.ts） | 待实现 |
| `UT-PI-040` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L157 `if (filterEntries.length > 0)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-041` | `search`（`graphrag-client.ts:130`） | `错误路径` × `每个 typed 错误码` | 分支 L176 `catch (err)`（catch；graphrag-client.ts） | 待实现 |
| `UT-PI-042` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L180 `if (response.ok)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-043` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L194 `data.hits?.hits ?? []`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-044` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L194 `data.hits?.hits`（?.；graphrag-client.ts） | 待实现 |
| `UT-PI-045` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L196 `h._source ?? {}`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-046` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L198 `h._id ?? ""`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-047` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L199 `src.content ?? ""`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-048` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L200 `? typeof h._score === "number" :`（ternary；graphrag-client.ts） | 待实现 |
| `UT-PI-049` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L201 `src.metadata ?? {}`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-050` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L202 `src.created_at ?? ""`（??；graphrag-client.ts） | 待实现 |
| `UT-PI-051` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L214 `if (errBody.error?.reason)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-052` | `search`（`graphrag-client.ts:130`） | `状态分支` × `每个非法迁移拒绝` | 分支 L215 `if (errBody.message) errMessage = errBo…`（else；graphrag-client.ts） | 待实现 |
| `UT-PI-053` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L214 `errBody.error?.reason`（?.；graphrag-client.ts） | 待实现 |
| `UT-PI-054` | `search`（`graphrag-client.ts:130`） | `状态分支` × `合法迁移` | 分支 L215 `if (errBody.message)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-055` | `search`（`graphrag-client.ts:130`） | `错误路径` × `每个 typed 错误码` | 分支 L216 `catch ()`（catch；graphrag-client.ts） | 待实现 |
| `UT-PI-056` | `search`（`graphrag-client.ts:130`） | `错误路径` × `每个 typed 错误码` | throw L135 `query required`（守卫 `if (!query \|\| query.trim() === "")`；graphrag-client.ts） | 待实现 |
| `UT-PI-057` | `search`（`graphrag-client.ts:130`） | `错误路径` × `每个 typed 错误码` | throw L177 `reject`（守卫 `catch`；graphrag-client.ts） | 待实现 |
| `UT-PI-058` | `search`（`graphrag-client.ts:130`） | `错误路径` × `每个 typed 错误码` | throw L219 `reject`（守卫 `unconditional`；graphrag-client.ts） | 待实现 |
| `UT-PI-059` | `search`（`graphrag-client.ts:130`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L195 值 `hits.map((h) => { const src = h._source…` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-060` | `search`（`graphrag-client.ts:130`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L197 值 `{ id: h._id ?? "", content: src.content…` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-061` | `constructor`（`graphrag-client.ts:57`） | `数值/长度上限参数` × `恰好通过` | 参数 `status: number` 的 `恰好通过` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-062` | `constructor`（`graphrag-client.ts:57`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `status: number` 的 `+1 拒绝` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-063` | `constructor`（`graphrag-client.ts:57`） | `数值/长度上限参数` × `−1 通过` | 参数 `status: number` 的 `−1 通过` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-064` | `constructor`（`graphrag-client.ts:57`） | `字符串/路径/枚举输入` × `空` | 参数 `code: string` 的 `空` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-065` | `constructor`（`graphrag-client.ts:57`） | `字符串/路径/枚举输入` × `超长` | 参数 `code: string` 的 `超长` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-066` | `constructor`（`graphrag-client.ts:57`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `code: string` 的 `注入字符` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-067` | `constructor`（`graphrag-client.ts:57`） | `字符串/路径/枚举输入` × `空` | 参数 `message: string` 的 `空` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-068` | `constructor`（`graphrag-client.ts:57`） | `字符串/路径/枚举输入` × `超长` | 参数 `message: string` 的 `超长` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-069` | `constructor`（`graphrag-client.ts:57`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `message: string` 的 `注入字符` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-070` | `constructor`（`graphrag-client.ts:57`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `cause: unknown` 的 `每等价类合法值` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-071` | `constructor`（`graphrag-client.ts:57`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `cause: unknown` 的 `边界(上/下/零/空/满)` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-072` | `constructor`（`graphrag-client.ts:57`） | `纯函数/无副作用` × `非法值` | 参数 `cause: unknown` 的 `非法值` 类（graphrag-client.ts:57） | 待实现 |
| `UT-PI-073` | `constructor`（`graphrag-client.ts:57`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `cause` 缺省/显式两态（graphrag-client.ts:57） | 待实现 |
| `UT-PI-074` | `constructor`（`graphrag-client.ts:57`） | `状态分支` × `合法迁移` | 状态写 L64 → `this.name`（graphrag-client.ts） | 待实现 |
| `UT-PI-075` | `mapStatusToCode`（`graphrag-client.ts:93`） | `数值/长度上限参数` × `恰好通过` | 参数 `status: number` 的 `恰好通过` 类（graphrag-client.ts:93） | 待实现 |
| `UT-PI-076` | `mapStatusToCode`（`graphrag-client.ts:93`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `status: number` 的 `+1 拒绝` 类（graphrag-client.ts:93） | 待实现 |
| `UT-PI-077` | `mapStatusToCode`（`graphrag-client.ts:93`） | `数值/长度上限参数` × `−1 通过` | 参数 `status: number` 的 `−1 通过` 类（graphrag-client.ts:93） | 待实现 |
| `UT-PI-078` | `mapStatusToCode`（`graphrag-client.ts:93`） | `状态分支` × `合法迁移` | 分支 L94 `if (status === 401)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-079` | `mapStatusToCode`（`graphrag-client.ts:93`） | `状态分支` × `合法迁移` | 分支 L95 `if (status === 403)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-080` | `mapStatusToCode`（`graphrag-client.ts:93`） | `状态分支` × `合法迁移` | 分支 L96 `if (status === 404)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-081` | `mapStatusToCode`（`graphrag-client.ts:93`） | `状态分支` × `合法迁移` | 分支 L97 `if (status === 429)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-082` | `mapStatusToCode`（`graphrag-client.ts:93`） | `状态分支` × `合法迁移` | 分支 L98 `if (status >= 500 && status < 600)`（if；graphrag-client.ts） | 待实现 |
| `UT-PI-083` | `mapStatusToCode`（`graphrag-client.ts:93`） | `状态分支` × `合法迁移` | 分支 L98 `status >= 500 && status < 600`（&&；graphrag-client.ts） | 待实现 |
| `UT-PI-084` | `mapStatusToCode`（`graphrag-client.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L94 值 `"auth_invalid"` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-085` | `mapStatusToCode`（`graphrag-client.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L95 值 `"auth_forbidden"` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-086` | `mapStatusToCode`（`graphrag-client.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L96 值 `"not_found"` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-087` | `mapStatusToCode`（`graphrag-client.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L97 值 `"rate_limited"` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-088` | `mapStatusToCode`（`graphrag-client.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L98 值 `"server_error"` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-089` | `mapStatusToCode`（`graphrag-client.ts:93`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L99 值 `"server_error"` 逐值断言（graphrag-client.ts） | 待实现 |
| `UT-PI-090` | `createGraphragSearchTool`（`graphrag-tools.ts:109`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `deps: DocSearchToolDeps` 的 `每等价类合法值` 类（graphrag-tools.ts:109） | 待实现 |
| `UT-PI-091` | `createGraphragSearchTool`（`graphrag-tools.ts:109`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `deps: DocSearchToolDeps` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:109） | 待实现 |
| `UT-PI-092` | `createGraphragSearchTool`（`graphrag-tools.ts:109`） | `纯函数/无副作用` × `非法值` | 参数 `deps: DocSearchToolDeps` 的 `非法值` 类（graphrag-tools.ts:109） | 待实现 |
| `UT-PI-093` | `createGraphragSearchTool`（`graphrag-tools.ts:109`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；graphrag-tools.ts:109） | 待实现 |
| `UT-PI-094` | `createGraphragSearchTool`（`graphrag-tools.ts:109`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L117 值 `{ name: "graphrag_search", label: "Grap…` 逐值断言（graphrag-tools.ts） | 待实现 |
| `UT-PI-095` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolCallId: inferred` 的 `每等价类合法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-096` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolCallId: inferred` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-097` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `非法值` | 参数 `_toolCallId: inferred` 的 `非法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-098` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `params: inferred` 的 `每等价类合法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-099` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `params: inferred` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-100` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `非法值` | 参数 `params: inferred` 的 `非法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-101` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_onUpdate: inferred` 的 `每等价类合法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-102` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_onUpdate: inferred` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-103` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `非法值` | 参数 `_onUpdate: inferred` 的 `非法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-104` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolContext: inferred` 的 `每等价类合法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-105` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolContext: inferred` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-106` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `非法值` | 参数 `_toolContext: inferred` 的 `非法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-107` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_invocation: inferred` 的 `每等价类合法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-108` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_invocation: inferred` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-109` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `非法值` | 参数 `_invocation: inferred` 的 `非法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-110` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_context: inferred` 的 `每等价类合法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-111` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_context: inferred` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-112` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `非法值` | 参数 `_context: inferred` 的 `非法值` 类（graphrag-tools.ts:122） | 待实现 |
| `UT-PI-113` | `execute`（`graphrag-tools.ts:122`） | `状态分支` × `合法迁移` | 分支 L123 `params.scope ?? "all"`（??；graphrag-tools.ts） | 待实现 |
| `UT-PI-114` | `execute`（`graphrag-tools.ts:122`） | `错误路径` × `每个 typed 错误码` | 分支 L133 `catch (e)`（catch；graphrag-tools.ts） | 待实现 |
| `UT-PI-115` | `execute`（`graphrag-tools.ts:122`） | `状态分支` × `合法迁移` | 分支 L134 `if (e instanceof GraphRAGApiError)`（if；graphrag-tools.ts） | 待实现 |
| `UT-PI-116` | `execute`（`graphrag-tools.ts:122`） | `错误路径` × `每个 typed 错误码` | throw L140 `reject`（守卫 `catch`；graphrag-tools.ts） | 待实现 |
| `UT-PI-117` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L129 值 `{ content: [{ type: "text", text: JSON.…` 逐值断言（graphrag-tools.ts） | 待实现 |
| `UT-PI-118` | `execute`（`graphrag-tools.ts:122`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L135 值 `{ content: [{ type: "text", text: `doc …` 逐值断言（graphrag-tools.ts） | 待实现 |
| `UT-PI-119` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: DocSearchToolContext` 的 `每等价类合法值` 类（graphrag-tools.ts:85） | 待实现 |
| `UT-PI-120` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: DocSearchToolContext` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:85） | 待实现 |
| `UT-PI-121` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `纯函数/无副作用` × `非法值` | 参数 `context: DocSearchToolContext` 的 `非法值` 类（graphrag-tools.ts:85） | 待实现 |
| `UT-PI-122` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L86 `if (!context.role \|\| context.role.trim() === …`（if；graphrag-tools.ts） | 待实现 |
| `UT-PI-123` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L86 `!context.role \|\| context.role.trim() === ""`（\|\|；graphrag-tools.ts） | 待实现 |
| `UT-PI-124` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L86 `!context.role`（!；graphrag-tools.ts） | 待实现 |
| `UT-PI-125` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L89 `if (!context.projectName \|\| context.projectNa…`（if；graphrag-tools.ts） | 待实现 |
| `UT-PI-126` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L89 `!context.projectName \|\| context.projectName.t…`（\|\|；graphrag-tools.ts） | 待实现 |
| `UT-PI-127` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L89 `!context.projectName`（!；graphrag-tools.ts） | 待实现 |
| `UT-PI-128` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L92 `if (!/^[A-Za-z0-9._-]+$/.test(context.project…`（if；graphrag-tools.ts） | 待实现 |
| `UT-PI-129` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `状态分支` × `合法迁移` | 分支 L92 `!/^[A-Za-z0-9._-]+$/.test(context.projectName)`（!；graphrag-tools.ts） | 待实现 |
| `UT-PI-130` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `错误路径` × `每个 typed 错误码` | throw L87 `role required`（守卫 `if (!context.role \|\| context.role.trim(…`；graphrag-tools.ts） | 待实现 |
| `UT-PI-131` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `错误路径` × `每个 typed 错误码` | throw L90 `projectName required`（守卫 `if (!context.projectName \|\| context.pro…`；graphrag-tools.ts） | 待实现 |
| `UT-PI-132` | `validateDocSearchContext`（`graphrag-tools.ts:85`） | `错误路径` × `每个 typed 错误码` | throw L93 `projectName must match ^[A-Za-z0-9._-]+$`（守卫 `if (!/^[A-Za-z0-9._-]+$/.test(context.p…`；graphrag-tools.ts） | 待实现 |
| `UT-PI-133` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `空` | 参数 `messages: Array<{ role: "user" \| "assistant"; content: string }>` 的 `空` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-134` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `超长` | 参数 `messages: Array<{ role: "user" \| "assistant"; content: string }>` 的 `超长` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-135` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `messages: Array<{ role: "user" \| "assistant"; content: string }>` 的 `注入字符` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-136` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `空` | 参数 `user_id: string` 的 `空` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-137` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `超长` | 参数 `user_id: string` 的 `超长` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-138` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `user_id: string` 的 `注入字符` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-139` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `空` | 参数 `metadata: Record<string, any>` 的 `空` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-140` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `超长` | 参数 `metadata: Record<string, any>` 的 `超长` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-141` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `metadata: Record<string, any>` 的 `注入字符` 类（mem0-client.ts:203） | 待实现 |
| `UT-PI-142` | `add`（`mem0-client.ts:203`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `metadata` 缺省/显式两态（mem0-client.ts:203） | 待实现 |
| `UT-PI-143` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L209 `if (!user_id \|\| user_id.trim() === "")`（if；mem0-client.ts） | 待实现 |
| `UT-PI-144` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L209 `!user_id \|\| user_id.trim() === ""`（\|\|；mem0-client.ts） | 待实现 |
| `UT-PI-145` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L209 `!user_id`（!；mem0-client.ts） | 待实现 |
| `UT-PI-146` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L214 `if (!Array.isArray(messages) \|\| messages.leng…`（if；mem0-client.ts） | 待实现 |
| `UT-PI-147` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L214 `!Array.isArray(messages) \|\| messages.length =…`（\|\|；mem0-client.ts） | 待实现 |
| `UT-PI-148` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L214 `!Array.isArray(messages)`（!；mem0-client.ts） | 待实现 |
| `UT-PI-149` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L223 `(metadata as { tags?: string[] } \| undefined)…`（?.；mem0-client.ts） | 待实现 |
| `UT-PI-150` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L229 `if (tags && tags.length > 0)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-151` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L229 `tags && tags.length > 0`（&&；mem0-client.ts） | 待实现 |
| `UT-PI-152` | `add`（`mem0-client.ts:203`） | `错误路径` × `每个 typed 错误码` | 分支 L249 `catch (err)`（catch；mem0-client.ts） | 待实现 |
| `UT-PI-153` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L262 `if (response.ok)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-154` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L267 `data.event_id ?? ""`（??；mem0-client.ts） | 待实现 |
| `UT-PI-155` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L268 `if (eventId)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-156` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L271 `messages[0]?.content ?? ""`（??；mem0-client.ts） | 待实现 |
| `UT-PI-157` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L271 `messages[0]?.content`（?.；mem0-client.ts） | 待实现 |
| `UT-PI-158` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L273 `memoryId ?? eventId`（??；mem0-client.ts） | 待实现 |
| `UT-PI-159` | `add`（`mem0-client.ts:203`） | `状态分支` × `合法迁移` | 分支 L283 `if (errBody.message)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-160` | `add`（`mem0-client.ts:203`） | `错误路径` × `每个 typed 错误码` | 分支 L284 `catch ()`（catch；mem0-client.ts） | 待实现 |
| `UT-PI-161` | `add`（`mem0-client.ts:203`） | `错误路径` × `每个 typed 错误码` | throw L210 `user_id required`（守卫 `if (!user_id \|\| user_id.trim() === "")`；mem0-client.ts） | 待实现 |
| `UT-PI-162` | `add`（`mem0-client.ts:203`） | `错误路径` × `每个 typed 错误码` | throw L215 `messages must be non-empty`（守卫 `if (!Array.isArray(messages) \|\| message…`；mem0-client.ts） | 待实现 |
| `UT-PI-163` | `add`（`mem0-client.ts:203`） | `错误路径` × `每个 typed 错误码` | throw L250 `reject`（守卫 `catch`；mem0-client.ts） | 待实现 |
| `UT-PI-164` | `add`（`mem0-client.ts:203`） | `错误路径` × `每个 typed 错误码` | throw L287 `reject`（守卫 `unconditional`；mem0-client.ts） | 待实现 |
| `UT-PI-165` | `add`（`mem0-client.ts:203`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L273 值 `{ ids: [memoryId ?? eventId] }` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-166` | `add`（`mem0-client.ts:203`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L275 值 `{ ids: [] }` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-167` | `constructor`（`mem0-client.ts:24`） | `数值/长度上限参数` × `恰好通过` | 参数 `status: number` 的 `恰好通过` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-168` | `constructor`（`mem0-client.ts:24`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `status: number` 的 `+1 拒绝` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-169` | `constructor`（`mem0-client.ts:24`） | `数值/长度上限参数` × `−1 通过` | 参数 `status: number` 的 `−1 通过` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-170` | `constructor`（`mem0-client.ts:24`） | `字符串/路径/枚举输入` × `空` | 参数 `code: string` 的 `空` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-171` | `constructor`（`mem0-client.ts:24`） | `字符串/路径/枚举输入` × `超长` | 参数 `code: string` 的 `超长` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-172` | `constructor`（`mem0-client.ts:24`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `code: string` 的 `注入字符` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-173` | `constructor`（`mem0-client.ts:24`） | `字符串/路径/枚举输入` × `空` | 参数 `message: string` 的 `空` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-174` | `constructor`（`mem0-client.ts:24`） | `字符串/路径/枚举输入` × `超长` | 参数 `message: string` 的 `超长` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-175` | `constructor`（`mem0-client.ts:24`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `message: string` 的 `注入字符` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-176` | `constructor`（`mem0-client.ts:24`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `cause: unknown` 的 `每等价类合法值` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-177` | `constructor`（`mem0-client.ts:24`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `cause: unknown` 的 `边界(上/下/零/空/满)` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-178` | `constructor`（`mem0-client.ts:24`） | `纯函数/无副作用` × `非法值` | 参数 `cause: unknown` 的 `非法值` 类（mem0-client.ts:24） | 待实现 |
| `UT-PI-179` | `constructor`（`mem0-client.ts:24`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `cause` 缺省/显式两态（mem0-client.ts:24） | 待实现 |
| `UT-PI-180` | `constructor`（`mem0-client.ts:24`） | `状态分支` × `合法迁移` | 状态写 L31 → `this.name`（mem0-client.ts） | 待实现 |
| `UT-PI-181` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `字符串/路径/枚举输入` × `空` | 参数 `user_id: string` 的 `空` 类（mem0-client.ts:299） | 待实现 |
| `UT-PI-182` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `字符串/路径/枚举输入` × `超长` | 参数 `user_id: string` 的 `超长` 类（mem0-client.ts:299） | 待实现 |
| `UT-PI-183` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `user_id: string` 的 `注入字符` 类（mem0-client.ts:299） | 待实现 |
| `UT-PI-184` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `字符串/路径/枚举输入` × `空` | 参数 `query: string` 的 `空` 类（mem0-client.ts:299） | 待实现 |
| `UT-PI-185` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `字符串/路径/枚举输入` × `超长` | 参数 `query: string` 的 `超长` 类（mem0-client.ts:299） | 待实现 |
| `UT-PI-186` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `query: string` 的 `注入字符` 类（mem0-client.ts:299） | 待实现 |
| `UT-PI-187` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `时间域行为` × `超时边界 ±1 tick` | 分支 L304 `loop (Date.now() < deadline)`（loop；mem0-client.ts） | 待实现 |
| `UT-PI-188` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `状态分支` × `合法迁移` | 分支 L306 `query \|\| " "`（\|\|；mem0-client.ts） | 待实现 |
| `UT-PI-189` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `状态分支` × `合法迁移` | 分支 L307 `if (hits.length > 0)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-190` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `状态分支` × `合法迁移` | 分支 L312 `b.created_at ?? ""`（??；mem0-client.ts） | 待实现 |
| `UT-PI-191` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `状态分支` × `合法迁移` | 分支 L312 `a.created_at ?? ""`（??；mem0-client.ts） | 待实现 |
| `UT-PI-192` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `状态分支` × `合法迁移` | 分支 L314 `if (sorted[0]?.id)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-193` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `状态分支` × `合法迁移` | 分支 L314 `sorted[0]?.id`（?.；mem0-client.ts） | 待实现 |
| `UT-PI-194` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `错误路径` × `每个 typed 错误码` | 分支 L316 `catch ()`（catch；mem0-client.ts） | 待实现 |
| `UT-PI-195` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；mem0-client.ts:299） | 待实现 |
| `UT-PI-196` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `资源获取/释放` × `获取失败路径` | 资源操作 L319 `setTimeout`（mem0-client.ts） | 待实现 |
| `UT-PI-197` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L314 值 `sorted[0].id` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-198` | `pollForExtractedMemory`（`mem0-client.ts:299`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L321 值 `null` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-199` | `mapStatusToCode`（`mem0-client.ts:58`） | `数值/长度上限参数` × `恰好通过` | 参数 `status: number` 的 `恰好通过` 类（mem0-client.ts:58） | 待实现 |
| `UT-PI-200` | `mapStatusToCode`（`mem0-client.ts:58`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `status: number` 的 `+1 拒绝` 类（mem0-client.ts:58） | 待实现 |
| `UT-PI-201` | `mapStatusToCode`（`mem0-client.ts:58`） | `数值/长度上限参数` × `−1 通过` | 参数 `status: number` 的 `−1 通过` 类（mem0-client.ts:58） | 待实现 |
| `UT-PI-202` | `mapStatusToCode`（`mem0-client.ts:58`） | `状态分支` × `合法迁移` | 分支 L59 `if (status === 401)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-203` | `mapStatusToCode`（`mem0-client.ts:58`） | `状态分支` × `合法迁移` | 分支 L60 `if (status === 403)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-204` | `mapStatusToCode`（`mem0-client.ts:58`） | `状态分支` × `合法迁移` | 分支 L61 `if (status === 404)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-205` | `mapStatusToCode`（`mem0-client.ts:58`） | `状态分支` × `合法迁移` | 分支 L62 `if (status === 429)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-206` | `mapStatusToCode`（`mem0-client.ts:58`） | `状态分支` × `合法迁移` | 分支 L63 `if (status >= 500 && status < 600)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-207` | `mapStatusToCode`（`mem0-client.ts:58`） | `状态分支` × `合法迁移` | 分支 L63 `status >= 500 && status < 600`（&&；mem0-client.ts） | 待实现 |
| `UT-PI-208` | `mapStatusToCode`（`mem0-client.ts:58`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L59 值 `"auth_invalid"` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-209` | `mapStatusToCode`（`mem0-client.ts:58`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L60 值 `"auth_forbidden"` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-210` | `mapStatusToCode`（`mem0-client.ts:58`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L61 值 `"not_found"` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-211` | `mapStatusToCode`（`mem0-client.ts:58`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L62 值 `"rate_limited"` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-212` | `mapStatusToCode`（`mem0-client.ts:58`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L63 值 `"server_error"` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-213` | `mapStatusToCode`（`mem0-client.ts:58`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L65 值 `"server_error"` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-214` | `constructor`（`mem0-client.ts:73`） | `字符串/路径/枚举输入` × `空` | 参数 `baseUrl: string` 的 `空` 类（mem0-client.ts:73） | 待实现 |
| `UT-PI-215` | `constructor`（`mem0-client.ts:73`） | `字符串/路径/枚举输入` × `超长` | 参数 `baseUrl: string` 的 `超长` 类（mem0-client.ts:73） | 待实现 |
| `UT-PI-216` | `constructor`（`mem0-client.ts:73`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `baseUrl: string` 的 `注入字符` 类（mem0-client.ts:73） | 待实现 |
| `UT-PI-217` | `constructor`（`mem0-client.ts:73`） | `字符串/路径/枚举输入` × `空` | 参数 `apiKey: string` 的 `空` 类（mem0-client.ts:73） | 待实现 |
| `UT-PI-218` | `constructor`（`mem0-client.ts:73`） | `字符串/路径/枚举输入` × `超长` | 参数 `apiKey: string` 的 `超长` 类（mem0-client.ts:73） | 待实现 |
| `UT-PI-219` | `constructor`（`mem0-client.ts:73`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `apiKey: string` 的 `注入字符` 类（mem0-client.ts:73） | 待实现 |
| `UT-PI-220` | `search`（`mem0-client.ts:88`） | `字符串/路径/枚举输入` × `空` | 参数 `query: string` 的 `空` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-221` | `search`（`mem0-client.ts:88`） | `字符串/路径/枚举输入` × `超长` | 参数 `query: string` 的 `超长` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-222` | `search`（`mem0-client.ts:88`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `query: string` 的 `注入字符` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-223` | `search`（`mem0-client.ts:88`） | `字符串/路径/枚举输入` × `空` | 参数 `user_id: string` 的 `空` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-224` | `search`（`mem0-client.ts:88`） | `字符串/路径/枚举输入` × `超长` | 参数 `user_id: string` 的 `超长` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-225` | `search`（`mem0-client.ts:88`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `user_id: string` 的 `注入字符` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-226` | `search`（`mem0-client.ts:88`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `options: Mem0SearchOptions` 的 `每等价类合法值` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-227` | `search`（`mem0-client.ts:88`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `options: Mem0SearchOptions` 的 `边界(上/下/零/空/满)` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-228` | `search`（`mem0-client.ts:88`） | `纯函数/无副作用` × `非法值` | 参数 `options: Mem0SearchOptions` 的 `非法值` 类（mem0-client.ts:88） | 待实现 |
| `UT-PI-229` | `search`（`mem0-client.ts:88`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `options` 缺省/显式两态（mem0-client.ts:88） | 待实现 |
| `UT-PI-230` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L94 `if (!user_id \|\| user_id.trim() === "")`（if；mem0-client.ts） | 待实现 |
| `UT-PI-231` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L94 `!user_id \|\| user_id.trim() === ""`（\|\|；mem0-client.ts） | 待实现 |
| `UT-PI-232` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L94 `!user_id`（!；mem0-client.ts） | 待实现 |
| `UT-PI-233` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L99 `options?.max_results ?? 5`（??；mem0-client.ts） | 待实现 |
| `UT-PI-234` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L99 `options?.max_results`（?.；mem0-client.ts） | 待实现 |
| `UT-PI-235` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L109 `options?.filters ?? {}`（??；mem0-client.ts） | 待实现 |
| `UT-PI-236` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L109 `options?.filters`（?.；mem0-client.ts） | 待实现 |
| `UT-PI-237` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L111 `if (translatedFilters["metadata.tags"] !== un…`（if；mem0-client.ts） | 待实现 |
| `UT-PI-238` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L116 `loop (Object.entries(translatedFilters))`（loop；mem0-client.ts） | 待实现 |
| `UT-PI-239` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L117 `if (k.startsWith("metadata.") && k !== "metad…`（if；mem0-client.ts） | 待实现 |
| `UT-PI-240` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L117 `k.startsWith("metadata.") && k !== "metadata.…`（&&；mem0-client.ts） | 待实现 |
| `UT-PI-241` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L119 `translatedFilters.metadata ?? {}`（??；mem0-client.ts） | 待实现 |
| `UT-PI-242` | `search`（`mem0-client.ts:88`） | `错误路径` × `每个 typed 错误码` | 分支 L146 `catch (err)`（catch；mem0-client.ts） | 待实现 |
| `UT-PI-243` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L151 `if (response.ok)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-244` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L162 `data.results ?? []`（??；mem0-client.ts） | 待实现 |
| `UT-PI-245` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L167 `r.metadata ?? {}`（??；mem0-client.ts） | 待实现 |
| `UT-PI-246` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L168 `if (r.categories && r.categories.length > 0)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-247` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L168 `r.categories && r.categories.length > 0`（&&；mem0-client.ts） | 待实现 |
| `UT-PI-248` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L172 `r.id ?? ""`（??；mem0-client.ts） | 待实现 |
| `UT-PI-249` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L173 `r.memory ?? ""`（??；mem0-client.ts） | 待实现 |
| `UT-PI-250` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L174 `? typeof r.score === "number" :`（ternary；mem0-client.ts） | 待实现 |
| `UT-PI-251` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L176 `r.created_at ?? ""`（??；mem0-client.ts） | 待实现 |
| `UT-PI-252` | `search`（`mem0-client.ts:88`） | `状态分支` × `合法迁移` | 分支 L186 `if (errBody.message)`（if；mem0-client.ts） | 待实现 |
| `UT-PI-253` | `search`（`mem0-client.ts:88`） | `错误路径` × `每个 typed 错误码` | 分支 L187 `catch ()`（catch；mem0-client.ts） | 待实现 |
| `UT-PI-254` | `search`（`mem0-client.ts:88`） | `错误路径` × `每个 typed 错误码` | throw L95 `user_id required`（守卫 `if (!user_id \|\| user_id.trim() === "")`；mem0-client.ts） | 待实现 |
| `UT-PI-255` | `search`（`mem0-client.ts:88`） | `错误路径` × `每个 typed 错误码` | throw L147 `reject`（守卫 `catch`；mem0-client.ts） | 待实现 |
| `UT-PI-256` | `search`（`mem0-client.ts:88`） | `错误路径` × `每个 typed 错误码` | throw L190 `reject`（守卫 `unconditional`；mem0-client.ts） | 待实现 |
| `UT-PI-257` | `search`（`mem0-client.ts:88`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L166 值 `results.map((r) => { const meta = { ...…` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-258` | `search`（`mem0-client.ts:88`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L171 值 `{ id: r.id ?? "", memory: r.memory ?? "…` 逐值断言（mem0-client.ts） | 待实现 |
| `UT-PI-259` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-260` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-261` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-262` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `registry: ToolRegistry` 的 `每等价类合法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-263` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `registry: ToolRegistry` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-264` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `registry: ToolRegistry` 的 `非法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-265` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStore` 的 `每等价类合法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-266` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-267` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStore` 的 `非法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-268` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `channel: Channel` 的 `每等价类合法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-269` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `channel: Channel` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-270` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `channel: Channel` 的 `非法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-271` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `空` | 参数 `apiKey: string` 的 `空` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-272` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `超长` | 参数 `apiKey: string` 的 `超长` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-273` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `apiKey: string` 的 `注入字符` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-274` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `空` | 参数 `mem0ApiKey: string` 的 `空` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-275` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `超长` | 参数 `mem0ApiKey: string` 的 `超长` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-276` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `mem0ApiKey: string` 的 `注入字符` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-277` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `mem0ApiKey` 缺省/显式两态（pi-runtime.ts:114） | 待实现 |
| `UT-PI-278` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `空` | 参数 `graphragApiKey: string` 的 `空` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-279` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `超长` | 参数 `graphragApiKey: string` 的 `超长` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-280` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `graphragApiKey: string` 的 `注入字符` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-281` | `constructor`（`pi-runtime.ts:114`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `graphragApiKey` 缺省/显式两态（pi-runtime.ts:114） | 待实现 |
| `UT-PI-282` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `transfer: Transfer` 的 `每等价类合法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-283` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `transfer: Transfer` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-284` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `transfer: Transfer` 的 `非法值` 类（pi-runtime.ts:114） | 待实现 |
| `UT-PI-285` | `constructor`（`pi-runtime.ts:114`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `transfer` 缺省/显式两态（pi-runtime.ts:114） | 待实现 |
| `UT-PI-286` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L118 `if (config.identity?.memory && mem0ApiKey)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-287` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `每个非法迁移拒绝` | 分支 L121 `if (config.identity?.memory && !mem0Api…`（else；pi-runtime.ts） | 待实现 |
| `UT-PI-288` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L118 `config.identity?.memory && mem0ApiKey`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-289` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L118 `config.identity?.memory`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-290` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L119 `config.identity.memory.base_url ?? "https://a…`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-291` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L121 `if (config.identity?.memory && !mem0ApiKey)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-292` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `每个非法迁移拒绝` | 分支 L124 `{ this.mem0Adapter = undefined; }`（else；pi-runtime.ts） | 待实现 |
| `UT-PI-293` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L121 `config.identity?.memory && !mem0ApiKey`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-294` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L121 `config.identity?.memory`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-295` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L121 `!mem0ApiKey`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-296` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L129 `if (config.identity?.doc_search && graphragAp…`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-297` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `每个非法迁移拒绝` | 分支 L135 `if (config.identity?.doc_search && !gra…`（else；pi-runtime.ts） | 待实现 |
| `UT-PI-298` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L129 `config.identity?.doc_search && graphragApiKey`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-299` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L129 `config.identity?.doc_search`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-300` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L135 `if (config.identity?.doc_search && !graphragA…`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-301` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `每个非法迁移拒绝` | 分支 L138 `{ this.graphragAdapter = undefined; }`（else；pi-runtime.ts） | 待实现 |
| `UT-PI-302` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L135 `config.identity?.doc_search && !graphragApiKey`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-303` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L135 `config.identity?.doc_search`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-304` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L135 `!graphragApiKey`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-305` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 分支 L142 `Object.values(config.workspace.roots)[0]??pro…`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-306` | `constructor`（`pi-runtime.ts:114`） | `错误路径` × `每个 typed 错误码` | throw L123 `mem0ApiKey required when identity.memory configured`（守卫 `if (config.identity?.memory && !mem0Api…`；pi-runtime.ts） | 待实现 |
| `UT-PI-307` | `constructor`（`pi-runtime.ts:114`） | `错误路径` × `每个 typed 错误码` | throw L137 `graphragApiKey required when identity.doc_search configured`（守卫 `if (config.identity?.doc_search && !gra…`；pi-runtime.ts） | 待实现 |
| `UT-PI-308` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 状态写 L120 → `this.mem0Adapter`（pi-runtime.ts） | 待实现 |
| `UT-PI-309` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 状态写 L125 → `this.mem0Adapter`（pi-runtime.ts） | 待实现 |
| `UT-PI-310` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 状态写 L130 → `this.graphragAdapter`（pi-runtime.ts） | 待实现 |
| `UT-PI-311` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 状态写 L139 → `this.graphragAdapter`（pi-runtime.ts） | 待实现 |
| `UT-PI-312` | `constructor`（`pi-runtime.ts:114`） | `状态分支` × `合法迁移` | 状态写 L143 → `this.repo`（pi-runtime.ts） | 待实现 |
| `UT-PI-313` | `model`（`pi-runtime.ts:150`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L153 值 `{models,model}` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-314` | `execute`（`pi-runtime.ts:155`） | `字符串/路径/枚举输入` × `空` | 参数 `runId: string` 的 `空` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-315` | `execute`（`pi-runtime.ts:155`） | `字符串/路径/枚举输入` × `超长` | 参数 `runId: string` 的 `超长` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-316` | `execute`（`pi-runtime.ts:155`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `runId: string` 的 `注入字符` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-317` | `execute`（`pi-runtime.ts:155`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-318` | `execute`（`pi-runtime.ts:155`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-319` | `execute`（`pi-runtime.ts:155`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-320` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `task: TaskRequest` 的 `每等价类合法值` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-321` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-322` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `非法值` | 参数 `task: TaskRequest` 的 `非法值` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-323` | `execute`（`pi-runtime.ts:155`） | `字符串/路径/枚举输入` × `空` | 参数 `workspace: string` 的 `空` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-324` | `execute`（`pi-runtime.ts:155`） | `字符串/路径/枚举输入` × `超长` | 参数 `workspace: string` 的 `超长` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-325` | `execute`（`pi-runtime.ts:155`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `workspace: string` 的 `注入字符` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-326` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `isCancelled: ()=>boolean` 的 `每等价类合法值` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-327` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `isCancelled: ()=>boolean` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-328` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `非法值` | 参数 `isCancelled: ()=>boolean` 的 `非法值` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-329` | `execute`（`pi-runtime.ts:155`） | `数值/长度上限参数` × `恰好通过` | 参数 `onDiscussionReply: (event:string,turn:number,body:string)=>Promise<void>` 的 `恰好通过` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-330` | `execute`（`pi-runtime.ts:155`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `onDiscussionReply: (event:string,turn:number,body:string)=>Promise<void>` 的 `+1 拒绝` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-331` | `execute`（`pi-runtime.ts:155`） | `数值/长度上限参数` × `−1 通过` | 参数 `onDiscussionReply: (event:string,turn:number,body:string)=>Promise<void>` 的 `−1 通过` 类（pi-runtime.ts:155） | 待实现 |
| `UT-PI-332` | `execute`（`pi-runtime.ts:155`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `onDiscussionReply` 缺省/显式两态（pi-runtime.ts:155） | 待实现 |
| `UT-PI-333` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L158 `? existing :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-334` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L160 `if (!profile)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-335` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L160 `!profile`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-336` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L164 `if (this.config.identity?.memory && this.mem0…`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-337` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L164 `this.config.identity?.memory && this.mem0Adap…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-338` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L164 `this.config.identity?.memory`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-339` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L177 `if (this.config.identity?.doc_search && this.…`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-340` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L177 `this.config.identity?.doc_search && this.grap…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-341` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L177 `this.config.identity?.doc_search`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-342` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L189 `if (skillDeps)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-343` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L193 `if (docSearchDeps)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-344` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L201 `if (this.transfer&&remotePolicy)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-345` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L201 `this.transfer&&remotePolicy`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-346` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L205 `remotePolicy.permissions?.remote_hosts??[]`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-347` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L205 `remotePolicy.permissions?.remote_hosts`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-348` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L206 `remotePolicy.permissions?.executables??[]`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-349` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L206 `remotePolicy.permissions?.executables`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-350` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L212 `available[name]&&applyToolRecoveryPolicy(avai…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-351` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L214 `? this.config.identity :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-352` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L223 `? identity :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-353` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L224 `this.config.identity?.doc_search?.default_sco…`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-354` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L224 `this.config.identity?.doc_search?.default_sco…`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-355` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L224 `this.config.identity?.doc_search`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-356` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L232 `if (active)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-357` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L240 `process.env.PIKO_PROVIDER_DEBUG_FILE??`${this…`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-358` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L241 `if (!providerDebug)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-359` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L241 `!providerDebug`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-360` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | 分支 L241 `catch ()`（catch；pi-runtime.ts） | 待实现 |
| `UT-PI-361` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L243 `if (providerDebug)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-362` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L243 `payload??null`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-363` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L245 `if (active)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-364` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L247 `ev.headers?.["x-request-id"]??ev.headers?.["X…`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-365` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L248 `? payloadSentAt :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-366` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L249 `? latestUsage?.source==="injected" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-367` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L249 `latestUsage?.source`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-368` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L249 `ev.runId??runId`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-369` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L249 `ev.status??null`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-370` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | 分支 L249 `catch ()`（catch；pi-runtime.ts） | 待实现 |
| `UT-PI-371` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L250 `ev.runId??runId`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-372` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L250 `ev.status??null`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-373` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L255 `if (!policy)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-374` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L255 `!policy`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-375` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L256 `? typeof event.args.path==="string" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-376` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L257 `if (path)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-377` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L258 `event.toolName==="write"\|\|event.toolName==="e…`（\|\|；pi-runtime.ts） | 待实现 |
| `UT-PI-378` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L259 `!write&&(rel===""\|\|(!rel.startsWith(`..${sep}…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-379` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L259 `!write`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-380` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L259 `rel===""\|\|(!rel.startsWith(`..${sep}`)&&rel!=…`（\|\|；pi-runtime.ts） | 待实现 |
| `UT-PI-381` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L259 `!rel.startsWith(`..${sep}`)&&rel!==".."&&!rel…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-382` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L259 `!rel.startsWith(`..${sep}`)&&rel!==".."`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-383` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L259 `!rel.startsWith(`..${sep}`)`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-384` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L259 `!rel.startsWith(sep)`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-385` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L260 `if (!stagedRead)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-386` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L260 `!stagedRead`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-387` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L260 `? write :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-388` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | 分支 L260 `catch (error)`（catch；pi-runtime.ts） | 待实现 |
| `UT-PI-389` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L260 `? error instanceof Error :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-390` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L266 `policy.permissions?.executables??[]`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-391` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L266 `policy.permissions?.executables`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-392` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L267 `if (execAllowlist.length>0)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-393` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L268 `? typeof event.args.command==="string" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-394` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L269 `if (command!==undefined)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-395` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | 分支 L269 `catch (error)`（catch；pi-runtime.ts） | 待实现 |
| `UT-PI-396` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L269 `? error instanceof Error :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-397` | `execute`（`pi-runtime.ts:155`） | `并发/可重入` × `并发对偶/交错` | 分支 L272 `if (admission==="UnsafeRetryBlocked")`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-398` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L275 `event.isError&&event.result.content.some((x:a…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-399` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L275 `x.type==="text"&&typeof x.text==="string"&&x.…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-400` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L275 `x.type==="text"&&typeof x.text==="string"`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-401` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L275 `if (recovered&&interrupted)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-402` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L275 `recovered&&interrupted`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-403` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L278 `if (queuedTurn)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-404` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L279 `queuedTurn.pi_operation_id??`${runId}:turn:${…`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-405` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L280 `if (operation?.operationId===turnOperation)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-406` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `每个非法迁移拒绝` | 分支 L281 `if(!operation){ const result=await lane…`（else；pi-runtime.ts） | 待实现 |
| `UT-PI-407` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L280 `operation?.operationId`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-408` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L281 `if (!operation)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-409` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L281 `!operation`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-410` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L283 `if (result)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-411` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `每个非法迁移拒绝` | 分支 L284 `{const prompt=queuedTurn.turn_seq===1&&…`（else；pi-runtime.ts） | 待实现 |
| `UT-PI-412` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L284 `? queuedTurn.turn_seq===1&&turnOperation===`$…`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-413` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L284 `queuedTurn.turn_seq===1&&turnOperation===`${r…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-414` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L284 `if (!accepted.ok)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-415` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L284 `!accepted.ok`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-416` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L287 `if (!operation)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-417` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L287 `!operation`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-418` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L289 `if (prior)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-419` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `每个非法迁移拒绝` | 分支 L290 `{const initialTurn=task.discussion?this…`（else；pi-runtime.ts） | 待实现 |
| `UT-PI-420` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L290 `? task.discussion :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-421` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L290 `if (initialTurn)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-422` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L290 `if (!accepted.ok)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-423` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L290 `!accepted.ok`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-424` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L292 `if (isCancelled())`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-425` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L294 `loop ()`（loop；pi-runtime.ts） | 待实现 |
| `UT-PI-426` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L296 `if (!outcome)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-427` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L296 `!outcome`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-428` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L296 `if (!driven.ok)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-429` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L296 `!driven.ok`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-430` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L296 `if (driven.value.kind==="waiting")`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-431` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L297 `if (activeTurn)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-432` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L297 `if (outcome.status==="completed"&&onDiscussio…`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-433` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L297 `outcome.status==="completed"&&onDiscussionRep…`（&&；pi-runtime.ts） | 待实现 |
| `UT-PI-434` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L301 `if (toolFailure)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-435` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L302 `if (unsafeRetry)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-436` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L303 `if (outcome.status==="completed")`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-437` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L304 `if (task.discussion)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-438` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L306 `if (pending.length)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-439` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L310 `if (!accepted.ok)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-440` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L310 `!accepted.ok`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-441` | `execute`（`pi-runtime.ts:155`） | `并发/可重入` × `并发对偶/交错` | 分支 L315 `if (!(await this.channel.report({kind:"closeI…`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-442` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L315 `!(await this.channel.report({kind:"closeIntak…`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-443` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L319 `if (outcome.status==="aborted")`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-444` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L320 `outcome.error?.message??`Pi operation ${outco…`（??；pi-runtime.ts） | 待实现 |
| `UT-PI-445` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L320 `outcome.error?.message`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-446` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L321 `outcome.error?.code==="model_unavailable"\|\|is…`（\|\|；pi-runtime.ts） | 待实现 |
| `UT-PI-447` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L321 `outcome.error?.code`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-448` | `execute`（`pi-runtime.ts:155`） | `状态分支` × `合法迁移` | 分支 L322 `? unavailable :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-449` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | throw L160 `UnknownToolProfile`（守卫 `if (!profile)`；pi-runtime.ts） | 待实现 |
| `UT-PI-450` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | throw L284 `reject`（守卫 `if (!accepted.ok)`；pi-runtime.ts） | 待实现 |
| `UT-PI-451` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | throw L290 `reject`（守卫 `if (!accepted.ok)`；pi-runtime.ts） | 待实现 |
| `UT-PI-452` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | throw L296 `reject`（守卫 `if (!driven.ok)`；pi-runtime.ts） | 待实现 |
| `UT-PI-453` | `execute`（`pi-runtime.ts:155`） | `错误路径` × `每个 typed 错误码` | throw L310 `reject`（守卫 `if (!accepted.ok)`；pi-runtime.ts） | 待实现 |
| `UT-PI-454` | `execute`（`pi-runtime.ts:155`） | `资源获取/释放` × `获取失败路径` | 资源操作 L241 `appendFileSync`（pi-runtime.ts） | 待实现 |
| `UT-PI-455` | `execute`（`pi-runtime.ts:155`） | `资源获取/释放` × `获取失败路径` | 资源操作 L292 `setInterval`（pi-runtime.ts） | 待实现 |
| `UT-PI-456` | `execute`（`pi-runtime.ts:155`） | `资源获取/释放` × `正常释放` | 资源操作 L324 `clearInterval`（pi-runtime.ts） | 待实现 |
| `UT-PI-457` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L237 值 `{streamOptions:{maxRetries:0,headers:{"…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-458` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L241 值 `（无值 return：提前退出）` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-459` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L243 值 `undefined` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-460` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L251 值 `undefined` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-461` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L255 值 `{block:{reason:toolFailure,terminate:tr…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-462` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L260 值 `{block:{reason:toolFailure,terminate:tr…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-463` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L269 值 `{block:{reason:toolFailure,terminate:tr…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-464` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L272 值 `{block:{reason:"UnsafeRetryBlocked",ter…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-465` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L272 值 `undefined` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-466` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L274 值 `undefined` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-467` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L301 值 `{status:"failed",summary:toolFailure,fa…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-468` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L302 值 `{status:"failed",summary:"Unsafe tool r…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-469` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L317 值 `{status:"completed",summary:await final…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-470` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L319 值 `{status:"cancelled",summary:"Execution …` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-471` | `execute`（`pi-runtime.ts:155`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L322 值 `{status:"failed",summary:message,failur…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-472` | `close`（`pi-runtime.ts:326`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；pi-runtime.ts:326） | 待实现 |
| `UT-PI-473` | `isProviderUnavailableMessage`（`pi-runtime.ts:37`） | `字符串/路径/枚举输入` × `空` | 参数 `message: string` 的 `空` 类（pi-runtime.ts:37） | 待实现 |
| `UT-PI-474` | `isProviderUnavailableMessage`（`pi-runtime.ts:37`） | `字符串/路径/枚举输入` × `超长` | 参数 `message: string` 的 `超长` 类（pi-runtime.ts:37） | 待实现 |
| `UT-PI-475` | `isProviderUnavailableMessage`（`pi-runtime.ts:37`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `message: string` 的 `注入字符` 类（pi-runtime.ts:37） | 待实现 |
| `UT-PI-476` | `isProviderUnavailableMessage`（`pi-runtime.ts:37`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L38 值 `/\((?:502\|503)\)\|provider_unavailable\|m…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-477` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `turn: DiscussionTurn` 的 `每等价类合法值` 类（pi-runtime.ts:42） | 待实现 |
| `UT-PI-478` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `turn: DiscussionTurn` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:42） | 待实现 |
| `UT-PI-479` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `非法值` | 参数 `turn: DiscussionTurn` 的 `非法值` 类（pi-runtime.ts:42） | 待实现 |
| `UT-PI-480` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `timestamp: inferred` 的 `每等价类合法值` 类（pi-runtime.ts:42） | 待实现 |
| `UT-PI-481` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `timestamp: inferred` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:42） | 待实现 |
| `UT-PI-482` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `非法值` | 参数 `timestamp: inferred` 的 `非法值` 类（pi-runtime.ts:42） | 待实现 |
| `UT-PI-483` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `timestamp` 缺省/显式两态（pi-runtime.ts:42） | 待实现 |
| `UT-PI-484` | `discussionMessage`（`pi-runtime.ts:42`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L42 值 `createCustomMessage("piko.discussion",t…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-485` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `task: TaskRequest` 的 `每等价类合法值` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-486` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-487` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `非法值` | 参数 `task: TaskRequest` 的 `非法值` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-488` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `turn: DiscussionTurn` 的 `每等价类合法值` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-489` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `turn: DiscussionTurn` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-490` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `非法值` | 参数 `turn: DiscussionTurn` 的 `非法值` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-491` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `turn` 缺省/显式两态（pi-runtime.ts:43） | 待实现 |
| `UT-PI-492` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `timestamp: inferred` 的 `每等价类合法值` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-493` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `timestamp: inferred` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-494` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `非法值` | 参数 `timestamp: inferred` 的 `非法值` 类（pi-runtime.ts:43） | 待实现 |
| `UT-PI-495` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `timestamp` 缺省/显式两态（pi-runtime.ts:43） | 待实现 |
| `UT-PI-496` | `initialPrompt`（`pi-runtime.ts:43`） | `状态分支` × `合法迁移` | 分支 L43 `? turn :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-497` | `initialPrompt`（`pi-runtime.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L43 值 `turn?[instruction,discussionMessage(tur…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-498` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `value: unknown` 的 `每等价类合法值` 类（pi-runtime.ts:44） | 待实现 |
| `UT-PI-499` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `value: unknown` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:44） | 待实现 |
| `UT-PI-500` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `纯函数/无副作用` × `非法值` | 参数 `value: unknown` 的 `非法值` 类（pi-runtime.ts:44） | 待实现 |
| `UT-PI-501` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `raw?.input_tokens_details`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-502` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `raw?.output_tokens_details`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-503` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `? typeof raw?.input_tokens==="number" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-504` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `raw?.input_tokens`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-505` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `? typeof raw?.output_tokens==="number" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-506` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `raw?.output_tokens`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-507` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `? typeof raw?.total_tokens==="number" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-508` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `raw?.total_tokens`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-509` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `? typeof input?.cached_tokens==="number" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-510` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `input?.cached_tokens`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-511` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `? typeof input?.cache_write_tokens==="number"…`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-512` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `input?.cache_write_tokens`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-513` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `? typeof output?.reasoning_tokens==="number" :`（ternary；pi-runtime.ts） | 待实现 |
| `UT-PI-514` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `状态分支` × `合法迁移` | 分支 L44 `output?.reasoning_tokens`（?.；pi-runtime.ts） | 待实现 |
| `UT-PI-515` | `normalizeRawUsage`（`pi-runtime.ts:44`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L44 值 `{input:typeof raw?.input_tokens==="numb…` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-516` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `task: TaskRequest` 的 `每等价类合法值` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-517` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-518` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `非法值` | 参数 `task: TaskRequest` 的 `非法值` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-519` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `字符串/路径/枚举输入` × `空` | 参数 `identity: {role:string;name:string;memory?:MemoryConfig;doc_search?:Do` 的 `空` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-520` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `字符串/路径/枚举输入` × `超长` | 参数 `identity: {role:string;name:string;memory?:MemoryConfig;doc_search?:Do` 的 `超长` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-521` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `identity: {role:string;name:string;memory?:MemoryConfig;doc_search?:Do` 的 `注入字符` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-522` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `identity` 缺省/显式两态（pi-runtime.ts:55） | 待实现 |
| `UT-PI-523` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `skillContext: PrefetchedSkillContext` 的 `每等价类合法值` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-524` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `skillContext: PrefetchedSkillContext` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-525` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `非法值` | 参数 `skillContext: PrefetchedSkillContext` 的 `非法值` 类（pi-runtime.ts:55） | 待实现 |
| `UT-PI-526` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `skillContext` 缺省/显式两态（pi-runtime.ts:55） | 待实现 |
| `UT-PI-527` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `状态分支` × `合法迁移` | 分支 L61 `if (!identity)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-528` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `状态分支` × `合法迁移` | 分支 L61 `!identity`（!；pi-runtime.ts） | 待实现 |
| `UT-PI-529` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `状态分支` × `合法迁移` | 分支 L71 `if (skillContext)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-530` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `状态分支` × `合法迁移` | 分支 L73 `if (identity.memory)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-531` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `状态分支` × `合法迁移` | 分支 L85 `if (identity.doc_search)`（if；pi-runtime.ts） | 待实现 |
| `UT-PI-532` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L61 值 `base` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-533` | `buildSystemPrompt`（`pi-runtime.ts:55`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L97 值 `base + parts.join("") + "\n"` 逐值断言（pi-runtime.ts） | 待实现 |
| `UT-PI-534` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `空` | 参数 `base: string` 的 `空` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-535` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `超长` | 参数 `base: string` 的 `超长` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-536` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `base: string` 的 `注入字符` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-537` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `空` | 参数 `key: string` 的 `空` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-538` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `超长` | 参数 `key: string` 的 `超长` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-539` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `key: string` 的 `注入字符` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-540` | `preflightModelProvider`（`provider-preflight.ts:1`） | `数值/长度上限参数` × `恰好通过` | 参数 `timeout: number` 的 `恰好通过` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-541` | `preflightModelProvider`（`provider-preflight.ts:1`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `timeout: number` 的 `+1 拒绝` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-542` | `preflightModelProvider`（`provider-preflight.ts:1`） | `数值/长度上限参数` × `−1 通过` | 参数 `timeout: number` 的 `−1 通过` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-543` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `空` | 参数 `model: string` 的 `空` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-544` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `超长` | 参数 `model: string` 的 `超长` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-545` | `preflightModelProvider`（`provider-preflight.ts:1`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `model: string` 的 `注入字符` 类（provider-preflight.ts:1） | 待实现 |
| `UT-PI-546` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L4 `? base.endsWith("/") :`（ternary；provider-preflight.ts） | 待实现 |
| `UT-PI-547` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L5 `if (!response.ok)`（if；provider-preflight.ts） | 待实现 |
| `UT-PI-548` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L5 `!response.ok`（!；provider-preflight.ts） | 待实现 |
| `UT-PI-549` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L7 `if (!Array.isArray(payload?.data)\|\|!payload.d…`（if；provider-preflight.ts） | 待实现 |
| `UT-PI-550` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L7 `!Array.isArray(payload?.data)\|\|!payload.data.…`（\|\|；provider-preflight.ts） | 待实现 |
| `UT-PI-551` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L7 `!Array.isArray(payload?.data)`（!；provider-preflight.ts） | 待实现 |
| `UT-PI-552` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L7 `payload?.data`（?.；provider-preflight.ts） | 待实现 |
| `UT-PI-553` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L7 `!payload.data.some((item:any)=>item?.id===mod…`（!；provider-preflight.ts） | 待实现 |
| `UT-PI-554` | `preflightModelProvider`（`provider-preflight.ts:1`） | `状态分支` × `合法迁移` | 分支 L7 `item?.id`（?.；provider-preflight.ts） | 待实现 |
| `UT-PI-555` | `preflightModelProvider`（`provider-preflight.ts:1`） | `错误路径` × `每个 typed 错误码` | throw L5 `reject`（守卫 `if (!response.ok)`；provider-preflight.ts） | 待实现 |
| `UT-PI-556` | `preflightModelProvider`（`provider-preflight.ts:1`） | `错误路径` × `每个 typed 错误码` | throw L7 `reject`（守卫 `if (!Array.isArray(payload?.data)\|\|!pay…`；provider-preflight.ts） | 待实现 |
| `UT-PI-557` | `preflightModelProvider`（`provider-preflight.ts:1`） | `资源获取/释放` × `获取失败路径` | 资源操作 L2 `setTimeout`（provider-preflight.ts） | 待实现 |
| `UT-PI-558` | `preflightModelProvider`（`provider-preflight.ts:1`） | `资源获取/释放` × `正常释放` | 资源操作 L8 `clearTimeout`（provider-preflight.ts） | 待实现 |
| `UT-PI-559` | `cacheKey`（`skill-prefetch.ts:114`） | `字符串/路径/枚举输入` × `空` | 参数 `identity: PrefetchIdentity` 的 `空` 类（skill-prefetch.ts:114） | 待实现 |
| `UT-PI-560` | `cacheKey`（`skill-prefetch.ts:114`） | `字符串/路径/枚举输入` × `超长` | 参数 `identity: PrefetchIdentity` 的 `超长` 类（skill-prefetch.ts:114） | 待实现 |
| `UT-PI-561` | `cacheKey`（`skill-prefetch.ts:114`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `identity: PrefetchIdentity` 的 `注入字符` 类（skill-prefetch.ts:114） | 待实现 |
| `UT-PI-562` | `cacheKey`（`skill-prefetch.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L115 值 ``${identity.role}\|${identity.userId}\|${…` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-563` | `prefetchCacheSize`（`skill-prefetch.ts:124`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L125 值 `cache.size` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-564` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `字符串/路径/枚举输入` × `空` | 参数 `query: string` 的 `空` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-565` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `字符串/路径/枚举输入` × `超长` | 参数 `query: string` 的 `超长` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-566` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `query: string` 的 `注入字符` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-567` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `字符串/路径/枚举输入` × `空` | 参数 `identity: PrefetchIdentity \| undefined` 的 `空` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-568` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `字符串/路径/枚举输入` × `超长` | 参数 `identity: PrefetchIdentity \| undefined` 的 `超长` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-569` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `identity: PrefetchIdentity \| undefined` 的 `注入字符` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-570` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `mem0: Mem0Adapter \| undefined` 的 `每等价类合法值` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-571` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `mem0: Mem0Adapter \| undefined` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-572` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `非法值` | 参数 `mem0: Mem0Adapter \| undefined` 的 `非法值` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-573` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `graphrag: GraphRAGAdapter \| undefined` 的 `每等价类合法值` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-574` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `graphrag: GraphRAGAdapter \| undefined` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-575` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `非法值` | 参数 `graphrag: GraphRAGAdapter \| undefined` 的 `非法值` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-576` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `opts: PrefetchOptions` 的 `每等价类合法值` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-577` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `opts: PrefetchOptions` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-578` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `非法值` | 参数 `opts: PrefetchOptions` 的 `非法值` 类（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-579` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `opts` 缺省/显式两态（skill-prefetch.ts:137） | 待实现 |
| `UT-PI-580` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `时间域行为` × `超时边界 ±1 tick` | 分支 L145 `opts.timeoutMs ?? DEFAULT_PREFETCH_TIMEOUT_MS`（??；skill-prefetch.ts） | 待实现 |
| `UT-PI-581` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L146 `opts.maxResults ?? DEFAULT_PREFETCH_MAX_RESUL…`（??；skill-prefetch.ts） | 待实现 |
| `UT-PI-582` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L147 `opts.minInstructionLength ?? 20`（??；skill-prefetch.ts） | 待实现 |
| `UT-PI-583` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L159 `if (opts.disabled)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-584` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L160 `if (opts.kind === "no_skill")`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-585` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L161 `if (!query \|\| query.trim().length < minLength)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-586` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L161 `!query \|\| query.trim().length < minLength`（\|\|；skill-prefetch.ts） | 待实现 |
| `UT-PI-587` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L161 `!query`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-588` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L162 `if (!identity)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-589` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L162 `!identity`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-590` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L163 `if (!mem0 && !graphrag)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-591` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L163 `!mem0 && !graphrag`（&&；skill-prefetch.ts） | 待实现 |
| `UT-PI-592` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L163 `!mem0`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-593` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L163 `!graphrag`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-594` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L169 `if (!opts.noCache)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-595` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L169 `!opts.noCache`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-596` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L171 `if (hit && hit.query === capped)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-597` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L171 `hit && hit.query === capped`（&&；skill-prefetch.ts） | 待实现 |
| `UT-PI-598` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L182 `? mem0 :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-599` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L183 `? graphrag :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-600` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L188 `? memoryOutcome.status === "fulfilled" :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-601` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L189 `? docsOutcome.status === "fulfilled" :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-602` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L197 `? !mem0 :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-603` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L197 `!mem0`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-604` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L197 `? memoryOutcome.status === "fulfilled" :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-605` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L197 `? memory.length > 0 :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-606` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L198 `? !graphrag :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-607` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L198 `!graphrag`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-608` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L198 `? docsOutcome.status === "fulfilled" :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-609` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L198 `? docs.length > 0 :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-610` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L208 `configured.length > 0 && configured.every((s)…`（&&；skill-prefetch.ts） | 待实现 |
| `UT-PI-611` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L209 `if (!opts.noCache && !allFailed)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-612` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L209 `!opts.noCache && !allFailed`（&&；skill-prefetch.ts） | 待实现 |
| `UT-PI-613` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L209 `!opts.noCache`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-614` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L209 `!allFailed`（!；skill-prefetch.ts） | 待实现 |
| `UT-PI-615` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L212 `loop (cache.size > CACHE_LIMIT)`（loop；skill-prefetch.ts） | 待实现 |
| `UT-PI-616` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `状态分支` × `合法迁移` | 分支 L214 `if (oldest === undefined)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-617` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；skill-prefetch.ts:137） | 待实现 |
| `UT-PI-618` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L159 值 `empty("disabled")` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-619` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L160 值 `empty("no_skill")` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-620` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L161 值 `empty("short_instruction")` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-621` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L162 值 `empty("no_identity")` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-622` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L163 值 `empty("no_backends")` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-623` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L175 值 `{ ...hit.context, durationMs: Date.now(…` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-624` | `prefetchSkillContext`（`skill-prefetch.ts:137`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L219 值 `context` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-625` | `withTimeout`（`skill-prefetch.ts:229`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `promise: Promise<T>` 的 `每等价类合法值` 类（skill-prefetch.ts:229） | 待实现 |
| `UT-PI-626` | `withTimeout`（`skill-prefetch.ts:229`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `promise: Promise<T>` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:229） | 待实现 |
| `UT-PI-627` | `withTimeout`（`skill-prefetch.ts:229`） | `纯函数/无副作用` × `非法值` | 参数 `promise: Promise<T>` 的 `非法值` 类（skill-prefetch.ts:229） | 待实现 |
| `UT-PI-628` | `withTimeout`（`skill-prefetch.ts:229`） | `数值/长度上限参数` × `恰好通过` | 参数 `ms: number` 的 `恰好通过` 类（skill-prefetch.ts:229） | 待实现 |
| `UT-PI-629` | `withTimeout`（`skill-prefetch.ts:229`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `ms: number` 的 `+1 拒绝` 类（skill-prefetch.ts:229） | 待实现 |
| `UT-PI-630` | `withTimeout`（`skill-prefetch.ts:229`） | `数值/长度上限参数` × `−1 通过` | 参数 `ms: number` 的 `−1 通过` 类（skill-prefetch.ts:229） | 待实现 |
| `UT-PI-631` | `withTimeout`（`skill-prefetch.ts:229`） | `资源获取/释放` × `获取失败路径` | 资源操作 L231 `setTimeout`（skill-prefetch.ts） | 待实现 |
| `UT-PI-632` | `withTimeout`（`skill-prefetch.ts:229`） | `资源获取/释放` × `正常释放` | 资源操作 L233 `clearTimeout`（skill-prefetch.ts） | 待实现 |
| `UT-PI-633` | `withTimeout`（`skill-prefetch.ts:229`） | `资源获取/释放` × `正常释放` | 资源操作 L234 `clearTimeout`（skill-prefetch.ts） | 待实现 |
| `UT-PI-634` | `withTimeout`（`skill-prefetch.ts:229`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L230 值 `new Promise<T>((resolve, reject) => { c…` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-635` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `entry: Mem0SearchResult` 的 `每等价类合法值` 类（skill-prefetch.ts:240） | 待实现 |
| `UT-PI-636` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `entry: Mem0SearchResult` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:240） | 待实现 |
| `UT-PI-637` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `纯函数/无副作用` × `非法值` | 参数 `entry: Mem0SearchResult` 的 `非法值` 类（skill-prefetch.ts:240） | 待实现 |
| `UT-PI-638` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `状态分支` × `合法迁移` | 分支 L241 `entry.memory ?? ""`（??；skill-prefetch.ts） | 待实现 |
| `UT-PI-639` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `状态分支` × `合法迁移` | 分支 L242 `? entry.created_at :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-640` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `状态分支` × `合法迁移` | 分支 L243 `? Array.isArray(entry.metadata?.tags) :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-641` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `状态分支` × `合法迁移` | 分支 L243 `entry.metadata?.tags`（?.；skill-prefetch.ts） | 待实现 |
| `UT-PI-642` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `状态分支` × `合法迁移` | 分支 L245 `? suffix :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-643` | `renderMemoryEntry`（`skill-prefetch.ts:240`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L245 值 `suffix ? `- "${text}" (${suffix})` : `-…` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-644` | `renderDocEntry`（`skill-prefetch.ts:249`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `entry: GraphRAGSearchResult` 的 `每等价类合法值` 类（skill-prefetch.ts:249） | 待实现 |
| `UT-PI-645` | `renderDocEntry`（`skill-prefetch.ts:249`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `entry: GraphRAGSearchResult` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:249） | 待实现 |
| `UT-PI-646` | `renderDocEntry`（`skill-prefetch.ts:249`） | `纯函数/无副作用` × `非法值` | 参数 `entry: GraphRAGSearchResult` 的 `非法值` 类（skill-prefetch.ts:249） | 待实现 |
| `UT-PI-647` | `renderDocEntry`（`skill-prefetch.ts:249`） | `状态分支` × `合法迁移` | 分支 L250 `entry.content ?? ""`（??；skill-prefetch.ts） | 待实现 |
| `UT-PI-648` | `renderDocEntry`（`skill-prefetch.ts:249`） | `状态分支` × `合法迁移` | 分支 L251 `entry.metadata?.source ?? entry.metadata?.pat…`（??；skill-prefetch.ts） | 待实现 |
| `UT-PI-649` | `renderDocEntry`（`skill-prefetch.ts:249`） | `状态分支` × `合法迁移` | 分支 L251 `entry.metadata?.source ?? entry.metadata?.path`（??；skill-prefetch.ts） | 待实现 |
| `UT-PI-650` | `renderDocEntry`（`skill-prefetch.ts:249`） | `状态分支` × `合法迁移` | 分支 L251 `entry.metadata?.source`（?.；skill-prefetch.ts） | 待实现 |
| `UT-PI-651` | `renderDocEntry`（`skill-prefetch.ts:249`） | `状态分支` × `合法迁移` | 分支 L251 `entry.metadata?.path`（?.；skill-prefetch.ts） | 待实现 |
| `UT-PI-652` | `renderDocEntry`（`skill-prefetch.ts:249`） | `状态分支` × `合法迁移` | 分支 L252 `? source :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-653` | `renderDocEntry`（`skill-prefetch.ts:249`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L252 值 `source ? `- ${source}: ${text}` : `- ${…` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-654` | `renderSkillContext`（`skill-prefetch.ts:262`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: PrefetchedSkillContext` 的 `每等价类合法值` 类（skill-prefetch.ts:262） | 待实现 |
| `UT-PI-655` | `renderSkillContext`（`skill-prefetch.ts:262`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: PrefetchedSkillContext` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:262） | 待实现 |
| `UT-PI-656` | `renderSkillContext`（`skill-prefetch.ts:262`） | `纯函数/无副作用` × `非法值` | 参数 `context: PrefetchedSkillContext` 的 `非法值` 类（skill-prefetch.ts:262） | 待实现 |
| `UT-PI-657` | `renderSkillContext`（`skill-prefetch.ts:262`） | `状态分支` × `合法迁移` | 分支 L265 `if (context.skipped)`（if；skill-prefetch.ts） | 待实现 |
| `UT-PI-658` | `renderSkillContext`（`skill-prefetch.ts:262`） | `状态分支` × `合法迁移` | 分支 L271 `? context.memory.length > 0 :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-659` | `renderSkillContext`（`skill-prefetch.ts:262`） | `状态分支` × `合法迁移` | 分支 L273 `? context.sources.memory === "unavailable" :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-660` | `renderSkillContext`（`skill-prefetch.ts:262`） | `状态分支` × `合法迁移` | 分支 L275 `? context.docs.length > 0 :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-661` | `renderSkillContext`（`skill-prefetch.ts:262`） | `状态分支` × `合法迁移` | 分支 L277 `? context.sources.docs === "unavailable" :`（ternary；skill-prefetch.ts） | 待实现 |
| `UT-PI-662` | `renderSkillContext`（`skill-prefetch.ts:262`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L267 值 `parts.join("")` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-663` | `renderSkillContext`（`skill-prefetch.ts:262`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L286 值 `parts.join("")` 逐值断言（skill-prefetch.ts） | 待实现 |
| `UT-PI-664` | `validateContext`（`skill-tools.ts:101`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: SkillToolContext` 的 `每等价类合法值` 类（skill-tools.ts:101） | 待实现 |
| `UT-PI-665` | `validateContext`（`skill-tools.ts:101`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: SkillToolContext` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:101） | 待实现 |
| `UT-PI-666` | `validateContext`（`skill-tools.ts:101`） | `纯函数/无副作用` × `非法值` | 参数 `context: SkillToolContext` 的 `非法值` 类（skill-tools.ts:101） | 待实现 |
| `UT-PI-667` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L102 `if (!context.role \|\| context.role.trim() === …`（if；skill-tools.ts） | 待实现 |
| `UT-PI-668` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L102 `!context.role \|\| context.role.trim() === ""`（\|\|；skill-tools.ts） | 待实现 |
| `UT-PI-669` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L102 `!context.role`（!；skill-tools.ts） | 待实现 |
| `UT-PI-670` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L105 `if (!context.projectName \|\| context.projectNa…`（if；skill-tools.ts） | 待实现 |
| `UT-PI-671` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L105 `!context.projectName \|\| context.projectName.t…`（\|\|；skill-tools.ts） | 待实现 |
| `UT-PI-672` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L105 `!context.projectName`（!；skill-tools.ts） | 待实现 |
| `UT-PI-673` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L108 `if (!/^[A-Za-z0-9._-]+$/.test(context.project…`（if；skill-tools.ts） | 待实现 |
| `UT-PI-674` | `validateContext`（`skill-tools.ts:101`） | `状态分支` × `合法迁移` | 分支 L108 `!/^[A-Za-z0-9._-]+$/.test(context.projectName)`（!；skill-tools.ts） | 待实现 |
| `UT-PI-675` | `validateContext`（`skill-tools.ts:101`） | `错误路径` × `每个 typed 错误码` | throw L103 `role required`（守卫 `if (!context.role \|\| context.role.trim(…`；skill-tools.ts） | 待实现 |
| `UT-PI-676` | `validateContext`（`skill-tools.ts:101`） | `错误路径` × `每个 typed 错误码` | throw L106 `projectName required`（守卫 `if (!context.projectName \|\| context.pro…`；skill-tools.ts） | 待实现 |
| `UT-PI-677` | `validateContext`（`skill-tools.ts:101`） | `错误路径` × `每个 typed 错误码` | throw L109 `projectName must match ^[A-Za-z0-9._-]+$`（守卫 `if (!/^[A-Za-z0-9._-]+$/.test(context.p…`；skill-tools.ts） | 待实现 |
| `UT-PI-678` | `createMem0LookupTool`（`skill-tools.ts:123`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `deps: SkillToolDeps` 的 `每等价类合法值` 类（skill-tools.ts:123） | 待实现 |
| `UT-PI-679` | `createMem0LookupTool`（`skill-tools.ts:123`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `deps: SkillToolDeps` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:123） | 待实现 |
| `UT-PI-680` | `createMem0LookupTool`（`skill-tools.ts:123`） | `纯函数/无副作用` × `非法值` | 参数 `deps: SkillToolDeps` 的 `非法值` 类（skill-tools.ts:123） | 待实现 |
| `UT-PI-681` | `createMem0LookupTool`（`skill-tools.ts:123`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；skill-tools.ts:123） | 待实现 |
| `UT-PI-682` | `createMem0LookupTool`（`skill-tools.ts:123`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L131 值 `{ name: "mem0_lookup", label: "Mem0 loo…` 逐值断言（skill-tools.ts） | 待实现 |
| `UT-PI-683` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolCallId: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-684` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolCallId: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-685` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `非法值` | 参数 `_toolCallId: inferred` 的 `非法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-686` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `params: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-687` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `params: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-688` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `非法值` | 参数 `params: inferred` 的 `非法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-689` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_onUpdate: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-690` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_onUpdate: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-691` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `非法值` | 参数 `_onUpdate: inferred` 的 `非法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-692` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolContext: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-693` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolContext: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-694` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `非法值` | 参数 `_toolContext: inferred` 的 `非法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-695` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_invocation: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-696` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_invocation: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-697` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `非法值` | 参数 `_invocation: inferred` 的 `非法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-698` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_context: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-699` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_context: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-700` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `非法值` | 参数 `_context: inferred` 的 `非法值` 类（skill-tools.ts:136） | 待实现 |
| `UT-PI-701` | `execute`（`skill-tools.ts:136`） | `状态分支` × `合法迁移` | 分支 L142 `params.max_results ?? 5`（??；skill-tools.ts） | 待实现 |
| `UT-PI-702` | `execute`（`skill-tools.ts:136`） | `错误路径` × `每个 typed 错误码` | 分支 L148 `catch (e)`（catch；skill-tools.ts） | 待实现 |
| `UT-PI-703` | `execute`（`skill-tools.ts:136`） | `状态分支` × `合法迁移` | 分支 L149 `if (e instanceof Mem0ApiError)`（if；skill-tools.ts） | 待实现 |
| `UT-PI-704` | `execute`（`skill-tools.ts:136`） | `错误路径` × `每个 typed 错误码` | throw L155 `reject`（守卫 `catch`；skill-tools.ts） | 待实现 |
| `UT-PI-705` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L144 值 `{ content: [{ type: "text", text: JSON.…` 逐值断言（skill-tools.ts） | 待实现 |
| `UT-PI-706` | `execute`（`skill-tools.ts:136`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L150 值 `{ content: [{ type: "text", text: `memo…` 逐值断言（skill-tools.ts） | 待实现 |
| `UT-PI-707` | `createMem0RecordTool`（`skill-tools.ts:171`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `deps: SkillToolDeps` 的 `每等价类合法值` 类（skill-tools.ts:171） | 待实现 |
| `UT-PI-708` | `createMem0RecordTool`（`skill-tools.ts:171`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `deps: SkillToolDeps` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:171） | 待实现 |
| `UT-PI-709` | `createMem0RecordTool`（`skill-tools.ts:171`） | `纯函数/无副作用` × `非法值` | 参数 `deps: SkillToolDeps` 的 `非法值` 类（skill-tools.ts:171） | 待实现 |
| `UT-PI-710` | `createMem0RecordTool`（`skill-tools.ts:171`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；skill-tools.ts:171） | 待实现 |
| `UT-PI-711` | `createMem0RecordTool`（`skill-tools.ts:171`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L179 值 `{ name: "mem0_record", label: "Mem0 rec…` 逐值断言（skill-tools.ts） | 待实现 |
| `UT-PI-712` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolCallId: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-713` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolCallId: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-714` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `非法值` | 参数 `_toolCallId: inferred` 的 `非法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-715` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `params: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-716` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `params: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-717` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `非法值` | 参数 `params: inferred` 的 `非法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-718` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_onUpdate: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-719` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_onUpdate: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-720` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `非法值` | 参数 `_onUpdate: inferred` 的 `非法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-721` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolContext: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-722` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolContext: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-723` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `非法值` | 参数 `_toolContext: inferred` 的 `非法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-724` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_invocation: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-725` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_invocation: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-726` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `非法值` | 参数 `_invocation: inferred` 的 `非法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-727` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_context: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-728` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_context: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-729` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `非法值` | 参数 `_context: inferred` 的 `非法值` 类（skill-tools.ts:184） | 待实现 |
| `UT-PI-730` | `execute`（`skill-tools.ts:184`） | `状态分支` × `合法迁移` | 分支 L194 `params.tags ?? []`（??；skill-tools.ts） | 待实现 |
| `UT-PI-731` | `execute`（`skill-tools.ts:184`） | `错误路径` × `每个 typed 错误码` | 分支 L207 `catch (e)`（catch；skill-tools.ts） | 待实现 |
| `UT-PI-732` | `execute`（`skill-tools.ts:184`） | `状态分支` × `合法迁移` | 分支 L208 `if (e instanceof Mem0ApiError)`（if；skill-tools.ts） | 待实现 |
| `UT-PI-733` | `execute`（`skill-tools.ts:184`） | `错误路径` × `每个 typed 错误码` | throw L214 `reject`（守卫 `catch`；skill-tools.ts） | 待实现 |
| `UT-PI-734` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L203 值 `{ content: [{ type: "text", text: JSON.…` 逐值断言（skill-tools.ts） | 待实现 |
| `UT-PI-735` | `execute`（`skill-tools.ts:184`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L209 值 `{ content: [{ type: "text", text: `memo…` 逐值断言（skill-tools.ts） | 待实现 |
| `UT-PI-736` | `parseExecutable`（`tool-exec-policy.ts:143`） | `字符串/路径/枚举输入` × `空` | 参数 `segment: string` 的 `空` 类（tool-exec-policy.ts:143） | 待实现 |
| `UT-PI-737` | `parseExecutable`（`tool-exec-policy.ts:143`） | `字符串/路径/枚举输入` × `超长` | 参数 `segment: string` 的 `超长` 类（tool-exec-policy.ts:143） | 待实现 |
| `UT-PI-738` | `parseExecutable`（`tool-exec-policy.ts:143`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `segment: string` 的 `注入字符` 类（tool-exec-policy.ts:143） | 待实现 |
| `UT-PI-739` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L147 `loop (tokens.length > 0 && ENV_ASSIGNMENT.tes…`（loop；tool-exec-policy.ts） | 待实现 |
| `UT-PI-740` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L147 `tokens.length > 0 && ENV_ASSIGNMENT.test(toke…`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-741` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L152 `loop (tokens.length > 0 && WRAPPER_COMMANDS.h…`（loop；tool-exec-policy.ts） | 待实现 |
| `UT-PI-742` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L152 `tokens.length > 0 && WRAPPER_COMMANDS.has(str…`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-743` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L154 `loop (tokens.length > 0 && ENV_ASSIGNMENT.tes…`（loop；tool-exec-policy.ts） | 待实现 |
| `UT-PI-744` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L154 `tokens.length > 0 && ENV_ASSIGNMENT.test(toke…`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-745` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L160 `if (!first)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-746` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L160 `!first`（!；tool-exec-policy.ts） | 待实现 |
| `UT-PI-747` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L163 `first.split("/").pop() ?? first`（??；tool-exec-policy.ts） | 待实现 |
| `UT-PI-748` | `parseExecutable`（`tool-exec-policy.ts:143`） | `状态分支` × `合法迁移` | 分支 L165 `? name.length > 0 :`（ternary；tool-exec-policy.ts） | 待实现 |
| `UT-PI-749` | `parseExecutable`（`tool-exec-policy.ts:143`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L160 值 `undefined` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-750` | `parseExecutable`（`tool-exec-policy.ts:143`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L165 值 `name.length > 0 ? name : undefined` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-751` | `parseExecutables`（`tool-exec-policy.ts:176`） | `字符串/路径/枚举输入` × `空` | 参数 `command: string` 的 `空` 类（tool-exec-policy.ts:176） | 待实现 |
| `UT-PI-752` | `parseExecutables`（`tool-exec-policy.ts:176`） | `字符串/路径/枚举输入` × `超长` | 参数 `command: string` 的 `超长` 类（tool-exec-policy.ts:176） | 待实现 |
| `UT-PI-753` | `parseExecutables`（`tool-exec-policy.ts:176`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `command: string` 的 `注入字符` 类（tool-exec-policy.ts:176） | 待实现 |
| `UT-PI-754` | `parseExecutables`（`tool-exec-policy.ts:176`） | `状态分支` × `合法迁移` | 分支 L178 `loop (splitCommands(command))`（loop；tool-exec-policy.ts） | 待实现 |
| `UT-PI-755` | `parseExecutables`（`tool-exec-policy.ts:176`） | `状态分支` × `合法迁移` | 分支 L180 `if (executable && !found.includes(executable))`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-756` | `parseExecutables`（`tool-exec-policy.ts:176`） | `状态分支` × `合法迁移` | 分支 L180 `executable && !found.includes(executable)`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-757` | `parseExecutables`（`tool-exec-policy.ts:176`） | `状态分支` × `合法迁移` | 分支 L180 `!found.includes(executable)`（!；tool-exec-policy.ts） | 待实现 |
| `UT-PI-758` | `parseExecutables`（`tool-exec-policy.ts:176`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L182 值 `found` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-759` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `字符串/路径/枚举输入` × `空` | 参数 `command: string` 的 `空` 类（tool-exec-policy.ts:193） | 待实现 |
| `UT-PI-760` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `字符串/路径/枚举输入` × `超长` | 参数 `command: string` 的 `超长` 类（tool-exec-policy.ts:193） | 待实现 |
| `UT-PI-761` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `command: string` 的 `注入字符` 类（tool-exec-policy.ts:193） | 待实现 |
| `UT-PI-762` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `字符串/路径/枚举输入` × `空` | 参数 `allowlist: readonly string[]` 的 `空` 类（tool-exec-policy.ts:193） | 待实现 |
| `UT-PI-763` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `字符串/路径/枚举输入` × `超长` | 参数 `allowlist: readonly string[]` 的 `超长` 类（tool-exec-policy.ts:193） | 待实现 |
| `UT-PI-764` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `allowlist: readonly string[]` 的 `注入字符` 类（tool-exec-policy.ts:193） | 待实现 |
| `UT-PI-765` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `状态分支` × `合法迁移` | 分支 L194 `if (allowlist.length === 0)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-766` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `状态分支` × `合法迁移` | 分支 L196 `stripQuotes(entry).split("/").pop() ?? entry`（??；tool-exec-policy.ts） | 待实现 |
| `UT-PI-767` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `状态分支` × `合法迁移` | 分支 L197 `loop (parseExecutables(command))`（loop；tool-exec-policy.ts） | 待实现 |
| `UT-PI-768` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `状态分支` × `合法迁移` | 分支 L198 `if (!allowed.has(executable))`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-769` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `状态分支` × `合法迁移` | 分支 L198 `!allowed.has(executable)`（!；tool-exec-policy.ts） | 待实现 |
| `UT-PI-770` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `错误路径` × `每个 typed 错误码` | throw L199 `executable_not_allowed`（守卫 `if (!allowed.has(executable))`；tool-exec-policy.ts） | 待实现 |
| `UT-PI-771` | `assertExecutablesAllowed`（`tool-exec-policy.ts:193`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L194 值 `（无值 return：提前退出）` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-772` | `constructor`（`tool-exec-policy.ts:21`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `code: "executable_not_allowed"` 的 `每等价类合法值` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-773` | `constructor`（`tool-exec-policy.ts:21`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `code: "executable_not_allowed"` 的 `边界(上/下/零/空/满)` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-774` | `constructor`（`tool-exec-policy.ts:21`） | `纯函数/无副作用` × `非法值` | 参数 `code: "executable_not_allowed"` 的 `非法值` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-775` | `constructor`（`tool-exec-policy.ts:21`） | `字符串/路径/枚举输入` × `空` | 参数 `message: string` 的 `空` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-776` | `constructor`（`tool-exec-policy.ts:21`） | `字符串/路径/枚举输入` × `超长` | 参数 `message: string` 的 `超长` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-777` | `constructor`（`tool-exec-policy.ts:21`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `message: string` 的 `注入字符` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-778` | `constructor`（`tool-exec-policy.ts:21`） | `字符串/路径/枚举输入` × `空` | 参数 `executable: string` 的 `空` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-779` | `constructor`（`tool-exec-policy.ts:21`） | `字符串/路径/枚举输入` × `超长` | 参数 `executable: string` 的 `超长` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-780` | `constructor`（`tool-exec-policy.ts:21`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `executable: string` 的 `注入字符` 类（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-781` | `constructor`（`tool-exec-policy.ts:21`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `executable` 缺省/显式两态（tool-exec-policy.ts:21） | 待实现 |
| `UT-PI-782` | `constructor`（`tool-exec-policy.ts:21`） | `状态分支` × `合法迁移` | 状态写 L23 → `this.name`（tool-exec-policy.ts） | 待实现 |
| `UT-PI-783` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `字符串/路径/枚举输入` × `空` | 参数 `argv: readonly string[]` 的 `空` 类（tool-exec-policy.ts:213） | 待实现 |
| `UT-PI-784` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `字符串/路径/枚举输入` × `超长` | 参数 `argv: readonly string[]` 的 `超长` 类（tool-exec-policy.ts:213） | 待实现 |
| `UT-PI-785` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `argv: readonly string[]` 的 `注入字符` 类（tool-exec-policy.ts:213） | 待实现 |
| `UT-PI-786` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `字符串/路径/枚举输入` × `空` | 参数 `allowlist: readonly string[]` 的 `空` 类（tool-exec-policy.ts:213） | 待实现 |
| `UT-PI-787` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `字符串/路径/枚举输入` × `超长` | 参数 `allowlist: readonly string[]` 的 `超长` 类（tool-exec-policy.ts:213） | 待实现 |
| `UT-PI-788` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `allowlist: readonly string[]` 的 `注入字符` 类（tool-exec-policy.ts:213） | 待实现 |
| `UT-PI-789` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `状态分支` × `合法迁移` | 分支 L214 `if (allowlist.length === 0)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-790` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `状态分支` × `合法迁移` | 分支 L216 `if (!first)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-791` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `状态分支` × `合法迁移` | 分支 L216 `!first`（!；tool-exec-policy.ts） | 待实现 |
| `UT-PI-792` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `状态分支` × `合法迁移` | 分支 L218 `first.split("/").pop() ?? first`（??；tool-exec-policy.ts） | 待实现 |
| `UT-PI-793` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `状态分支` × `合法迁移` | 分支 L219 `stripQuotes(entry).split("/").pop() ?? entry`（??；tool-exec-policy.ts） | 待实现 |
| `UT-PI-794` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `状态分支` × `合法迁移` | 分支 L220 `if (!allowed.has(name))`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-795` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `状态分支` × `合法迁移` | 分支 L220 `!allowed.has(name)`（!；tool-exec-policy.ts） | 待实现 |
| `UT-PI-796` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `错误路径` × `每个 typed 错误码` | throw L221 `executable_not_allowed`（守卫 `if (!allowed.has(name))`；tool-exec-policy.ts） | 待实现 |
| `UT-PI-797` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L214 值 `（无值 return：提前退出）` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-798` | `assertRemoteExecutableAllowed`（`tool-exec-policy.ts:213`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L216 值 `（无值 return：提前退出）` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-799` | `stripQuotes`（`tool-exec-policy.ts:229`） | `字符串/路径/枚举输入` × `空` | 参数 `value: string` 的 `空` 类（tool-exec-policy.ts:229） | 待实现 |
| `UT-PI-800` | `stripQuotes`（`tool-exec-policy.ts:229`） | `字符串/路径/枚举输入` × `超长` | 参数 `value: string` 的 `超长` 类（tool-exec-policy.ts:229） | 待实现 |
| `UT-PI-801` | `stripQuotes`（`tool-exec-policy.ts:229`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `value: string` 的 `注入字符` 类（tool-exec-policy.ts:229） | 待实现 |
| `UT-PI-802` | `stripQuotes`（`tool-exec-policy.ts:229`） | `状态分支` × `合法迁移` | 分支 L230 `if (value.length >= 2)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-803` | `stripQuotes`（`tool-exec-policy.ts:229`） | `状态分支` × `合法迁移` | 分支 L233 `if ((first === '"' && last === '"') \|\| (first…`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-804` | `stripQuotes`（`tool-exec-policy.ts:229`） | `状态分支` × `合法迁移` | 分支 L233 `(first === '"' && last === '"') \|\| (first ===…`（\|\|；tool-exec-policy.ts） | 待实现 |
| `UT-PI-805` | `stripQuotes`（`tool-exec-policy.ts:229`） | `状态分支` × `合法迁移` | 分支 L233 `first === '"' && last === '"'`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-806` | `stripQuotes`（`tool-exec-policy.ts:229`） | `状态分支` × `合法迁移` | 分支 L233 `first === "'" && last === "'"`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-807` | `stripQuotes`（`tool-exec-policy.ts:229`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L234 值 `value.slice(1, -1)` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-808` | `stripQuotes`（`tool-exec-policy.ts:229`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L237 值 `value` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-809` | `splitCommands`（`tool-exec-policy.ts:43`） | `字符串/路径/枚举输入` × `空` | 参数 `command: string` 的 `空` 类（tool-exec-policy.ts:43） | 待实现 |
| `UT-PI-810` | `splitCommands`（`tool-exec-policy.ts:43`） | `字符串/路径/枚举输入` × `超长` | 参数 `command: string` 的 `超长` 类（tool-exec-policy.ts:43） | 待实现 |
| `UT-PI-811` | `splitCommands`（`tool-exec-policy.ts:43`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `command: string` 的 `注入字符` 类（tool-exec-policy.ts:43） | 待实现 |
| `UT-PI-812` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L49 `loop (command)`（loop；tool-exec-policy.ts） | 待实现 |
| `UT-PI-813` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L50 `if (escaped)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-814` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L55 `if (char === "\\" && quote !== "'")`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-815` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L55 `char === "\\" && quote !== "'"`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-816` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L60 `if (quote)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-817` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L62 `if (char === quote)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-818` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L65 `if (char === '"' \|\| char === "'")`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-819` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L65 `char === '"' \|\| char === "'"`（\|\|；tool-exec-policy.ts） | 待实现 |
| `UT-PI-820` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L70 `if (char === ";" \|\| char === "\|" \|\| char === …`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-821` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L70 `char === ";" \|\| char === "\|" \|\| char === "&" …`（\|\|；tool-exec-policy.ts） | 待实现 |
| `UT-PI-822` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L70 `char === ";" \|\| char === "\|" \|\| char === "&"`（\|\|；tool-exec-policy.ts） | 待实现 |
| `UT-PI-823` | `splitCommands`（`tool-exec-policy.ts:43`） | `状态分支` × `合法迁移` | 分支 L70 `char === ";" \|\| char === "\|"`（\|\|；tool-exec-policy.ts） | 待实现 |
| `UT-PI-824` | `splitCommands`（`tool-exec-policy.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L81 值 `segments .map((part) => part.replace(/[…` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-825` | `tokenize`（`tool-exec-policy.ts:99`） | `字符串/路径/枚举输入` × `空` | 参数 `segment: string` 的 `空` 类（tool-exec-policy.ts:99） | 待实现 |
| `UT-PI-826` | `tokenize`（`tool-exec-policy.ts:99`） | `字符串/路径/枚举输入` × `超长` | 参数 `segment: string` 的 `超长` 类（tool-exec-policy.ts:99） | 待实现 |
| `UT-PI-827` | `tokenize`（`tool-exec-policy.ts:99`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `segment: string` 的 `注入字符` 类（tool-exec-policy.ts:99） | 待实现 |
| `UT-PI-828` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L105 `loop (segment)`（loop；tool-exec-policy.ts） | 待实现 |
| `UT-PI-829` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L106 `if (escaped)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-830` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L111 `if (char === "\\" && quote !== "'")`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-831` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L111 `char === "\\" && quote !== "'"`（&&；tool-exec-policy.ts） | 待实现 |
| `UT-PI-832` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L115 `if (quote)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-833` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L116 `if (char === quote)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-834` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `每个非法迁移拒绝` | 分支 L121 `{ current += char; }`（else；tool-exec-policy.ts） | 待实现 |
| `UT-PI-835` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L126 `if (char === '"' \|\| char === "'")`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-836` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L126 `char === '"' \|\| char === "'"`（\|\|；tool-exec-policy.ts） | 待实现 |
| `UT-PI-837` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L130 `if (/\s/.test(char))`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-838` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L131 `if (current.length > 0)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-839` | `tokenize`（`tool-exec-policy.ts:99`） | `状态分支` × `合法迁移` | 分支 L139 `if (current.length > 0)`（if；tool-exec-policy.ts） | 待实现 |
| `UT-PI-840` | `tokenize`（`tool-exec-policy.ts:99`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L140 值 `tokens` 逐值断言（tool-exec-policy.ts） | 待实现 |
| `UT-PI-841` | `installNetworkPolicy`（`tool-host-policy.ts:109`） | `状态分支` × `合法迁移` | 分支 L110 `if (previousFetch !== null)`（if；tool-host-policy.ts） | 待实现 |
| `UT-PI-842` | `installNetworkPolicy`（`tool-host-policy.ts:109`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L110 值 `previousFetch` 逐值断言（tool-host-policy.ts） | 待实现 |
| `UT-PI-843` | `installNetworkPolicy`（`tool-host-policy.ts:109`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L114 值 `base` 逐值断言（tool-host-policy.ts） | 待实现 |
| `UT-PI-844` | `restoreNetworkPolicy`（`tool-host-policy.ts:121`） | `状态分支` × `合法迁移` | 分支 L122 `if (previousFetch !== null)`（if；tool-host-policy.ts） | 待实现 |
| `UT-PI-845` | `constructor`（`tool-host-policy.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `code: "host_not_allowed" \| "invalid_request"` 的 `每等价类合法值` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-846` | `constructor`（`tool-host-policy.ts:29`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `code: "host_not_allowed" \| "invalid_request"` 的 `边界(上/下/零/空/满)` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-847` | `constructor`（`tool-host-policy.ts:29`） | `纯函数/无副作用` × `非法值` | 参数 `code: "host_not_allowed" \| "invalid_request"` 的 `非法值` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-848` | `constructor`（`tool-host-policy.ts:29`） | `字符串/路径/枚举输入` × `空` | 参数 `message: string` 的 `空` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-849` | `constructor`（`tool-host-policy.ts:29`） | `字符串/路径/枚举输入` × `超长` | 参数 `message: string` 的 `超长` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-850` | `constructor`（`tool-host-policy.ts:29`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `message: string` 的 `注入字符` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-851` | `constructor`（`tool-host-policy.ts:29`） | `字符串/路径/枚举输入` × `空` | 参数 `host: string` 的 `空` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-852` | `constructor`（`tool-host-policy.ts:29`） | `字符串/路径/枚举输入` × `超长` | 参数 `host: string` 的 `超长` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-853` | `constructor`（`tool-host-policy.ts:29`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `host: string` 的 `注入字符` 类（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-854` | `constructor`（`tool-host-policy.ts:29`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `host` 缺省/显式两态（tool-host-policy.ts:29） | 待实现 |
| `UT-PI-855` | `constructor`（`tool-host-policy.ts:29`） | `状态分支` × `合法迁移` | 状态写 L35 → `this.name`（tool-host-policy.ts） | 待实现 |
| `UT-PI-856` | `currentAllowlist`（`tool-host-policy.ts:48`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L49 值 `activeAllowlist` 逐值断言（tool-host-policy.ts） | 待实现 |
| `UT-PI-857` | `enterNetworkScope`（`tool-host-policy.ts:52`） | `字符串/路径/枚举输入` × `空` | 参数 `allowlist: readonly string[]` 的 `空` 类（tool-host-policy.ts:52） | 待实现 |
| `UT-PI-858` | `enterNetworkScope`（`tool-host-policy.ts:52`） | `字符串/路径/枚举输入` × `超长` | 参数 `allowlist: readonly string[]` 的 `超长` 类（tool-host-policy.ts:52） | 待实现 |
| `UT-PI-859` | `enterNetworkScope`（`tool-host-policy.ts:52`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `allowlist: readonly string[]` 的 `注入字符` 类（tool-host-policy.ts:52） | 待实现 |
| `UT-PI-860` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `base: typeof fetch` 的 `每等价类合法值` 类（tool-host-policy.ts:74） | 待实现 |
| `UT-PI-861` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `base: typeof fetch` 的 `边界(上/下/零/空/满)` 类（tool-host-policy.ts:74） | 待实现 |
| `UT-PI-862` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `纯函数/无副作用` × `非法值` | 参数 `base: typeof fetch` 的 `非法值` 类（tool-host-policy.ts:74） | 待实现 |
| `UT-PI-863` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `状态分支` × `合法迁移` | 分支 L77 `if (allowlist !== null && allowlist.length > …`（if；tool-host-policy.ts） | 待实现 |
| `UT-PI-864` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `状态分支` × `合法迁移` | 分支 L77 `allowlist !== null && allowlist.length > 0`（&&；tool-host-policy.ts） | 待实现 |
| `UT-PI-865` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `状态分支` × `合法迁移` | 分支 L78 `? typeof input === "string" :`（ternary；tool-host-policy.ts） | 待实现 |
| `UT-PI-866` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `错误路径` × `每个 typed 错误码` | 分支 L82 `catch ("invalid_request", `not a URL: ${urlSt…`（catch；tool-host-policy.ts） | 待实现 |
| `UT-PI-867` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `状态分支` × `合法迁移` | 分支 L89 `if (!allowlist.includes(host))`（if；tool-host-policy.ts） | 待实现 |
| `UT-PI-868` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `状态分支` × `合法迁移` | 分支 L89 `!allowlist.includes(host)`（!；tool-host-policy.ts） | 待实现 |
| `UT-PI-869` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `错误路径` × `每个 typed 错误码` | throw L83 `invalid_request`（守卫 `catch`；tool-host-policy.ts） | 待实现 |
| `UT-PI-870` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `错误路径` × `每个 typed 错误码` | throw L90 `host_not_allowed`（守卫 `if (!allowlist.includes(host))`；tool-host-policy.ts） | 待实现 |
| `UT-PI-871` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L75 值 `(async (input: RequestInfo \| URL, init?…` 逐值断言（tool-host-policy.ts） | 待实现 |
| `UT-PI-872` | `makePolicyFetch`（`tool-host-policy.ts:74`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L97 值 `base(input as RequestInfo, init)` 逐值断言（tool-host-policy.ts） | 待实现 |
