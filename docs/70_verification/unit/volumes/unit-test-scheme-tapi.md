# UT 分卷登记 · TAPI（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：131**（对象类型分布：字符串/路径/枚举输入 21；状态分支 34；错误路径 15；纯函数/无副作用 54；数值/长度上限参数 7）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-TAPI-005` | `BearerAuth.constructor`（`auth.ts:3`） | `字符串/路径/枚举输入` × `空` | 参数 `principal: string` 的 `空` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-006` | `BearerAuth.constructor`（`auth.ts:3`） | `字符串/路径/枚举输入` × `超长` | 参数 `principal: string` 的 `超长` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-007` | `BearerAuth.constructor`（`auth.ts:3`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `principal: string` 的 `注入字符` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-008` | `BearerAuth.constructor`（`auth.ts:3`） | `字符串/路径/枚举输入` × `空` | 参数 `token: Buffer` 的 `空` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-009` | `BearerAuth.constructor`（`auth.ts:3`） | `字符串/路径/枚举输入` × `超长` | 参数 `token: Buffer` 的 `超长` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-010` | `BearerAuth.constructor`（`auth.ts:3`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `token: Buffer` 的 `注入字符` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-011` | `authenticate`（`auth.ts:3`） | `字符串/路径/枚举输入` × `空` | 参数 `header: string\|undefined` 的 `空` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-012` | `authenticate`（`auth.ts:3`） | `字符串/路径/枚举输入` × `超长` | 参数 `header: string\|undefined` 的 `超长` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-013` | `authenticate`（`auth.ts:3`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `header: string\|undefined` 的 `注入字符` 类（auth.ts:3） | 待实现 |
| `UT-TAPI-014` | `authenticate`（`auth.ts:3`） | `状态分支` × `合法迁移` | 分支 L3 `!header?.startsWith("Bearer ")`（!；auth.ts） | 待实现 |
| `UT-TAPI-015` | `authenticate`（`auth.ts:3`） | `状态分支` × `合法迁移` | 分支 L3 `header?.startsWith`（?.；auth.ts） | 待实现 |
| `UT-TAPI-016` | `authenticate`（`auth.ts:3`） | `状态分支` × `合法迁移` | 分支 L3 `got.length!==this.token.length\|\|!timingSafeEq…`（\|\|；auth.ts） | 待实现 |
| `UT-TAPI-017` | `authenticate`（`auth.ts:3`） | `状态分支` × `合法迁移` | 分支 L3 `!timingSafeEqual(got,this.token)`（!；auth.ts） | 待实现 |
| `UT-TAPI-018` | `authenticate`（`auth.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L3 `Unauthorized`（守卫 `if (!header?.startsWith("Bearer "))`；auth.ts） | 待实现 |
| `UT-TAPI-019` | `authenticate`（`auth.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L3 `Unauthorized`（守卫 `if (got.length!==this.token.length\|\|!ti…`；auth.ts） | 待实现 |
| `UT-TAPI-020` | `authenticate`（`auth.ts:3`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L3 值 `this.principal` 逐值断言（auth.ts） | 待实现 |
| `UT-TAPI-021` | `listen`（`server.ts:110`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（server.ts:110） | 待实现 |
| `UT-TAPI-022` | `close`（`server.ts:119`） | `状态分支` × `合法迁移` | 分支 L120 `? e :`（ternary；server.ts） | 待实现 |
| `UT-TAPI-023` | `close`（`server.ts:119`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（server.ts:119） | 待实现 |
| `UT-TAPI-024` | `body`（`server.ts:12`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `req: IncomingMessage` 的 `每等价类合法值` 类（server.ts:12） | 待实现 |
| `UT-TAPI-025` | `body`（`server.ts:12`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `req: IncomingMessage` 的 `边界(上/下/零/空/满)` 类（server.ts:12） | 待实现 |
| `UT-TAPI-026` | `body`（`server.ts:12`） | `纯函数/无副作用` × `非法值` | 参数 `req: IncomingMessage` 的 `非法值` 类（server.ts:12） | 待实现 |
| `UT-TAPI-027` | `body`（`server.ts:12`） | `数值/长度上限参数` × `恰好通过` | 参数 `max: inferred` 的 `恰好通过` 类（server.ts:12） | 待实现 |
| `UT-TAPI-028` | `body`（`server.ts:12`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `max: inferred` 的 `+1 拒绝` 类（server.ts:12） | 待实现 |
| `UT-TAPI-029` | `body`（`server.ts:12`） | `数值/长度上限参数` × `−1 通过` | 参数 `max: inferred` 的 `−1 通过` 类（server.ts:12） | 待实现 |
| `UT-TAPI-030` | `body`（`server.ts:12`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `max` 缺省/显式两态（server.ts:12） | 待实现 |
| `UT-TAPI-031` | `body`（`server.ts:12`） | `状态分支` × `合法迁移` | 分支 L15 `loop (req)`（loop；server.ts） | 待实现 |
| `UT-TAPI-032` | `body`（`server.ts:12`） | `错误路径` × `每个 typed 错误码` | 分支 L23 `catch ("InvalidRequest", 400, "invalid JSON b…`（catch；server.ts） | 待实现 |
| `UT-TAPI-033` | `body`（`server.ts:12`） | `错误路径` × `每个 typed 错误码` | throw L18 `InvalidRequest`（守卫 `if (size > max)`；server.ts） | 待实现 |
| `UT-TAPI-034` | `body`（`server.ts:12`） | `错误路径` × `每个 typed 错误码` | throw L24 `InvalidRequest`（守卫 `catch`；server.ts） | 待实现 |
| `UT-TAPI-035` | `body`（`server.ts:12`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L22 值 `JSON.parse(Buffer.concat(chunks).toStri…` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-036` | `mapError`（`server.ts:140`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `error: unknown` 的 `每等价类合法值` 类（server.ts:140） | 待实现 |
| `UT-TAPI-037` | `mapError`（`server.ts:140`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `error: unknown` 的 `边界(上/下/零/空/满)` 类（server.ts:140） | 待实现 |
| `UT-TAPI-038` | `mapError`（`server.ts:140`） | `纯函数/无副作用` × `非法值` | 参数 `error: unknown` 的 `非法值` 类（server.ts:140） | 待实现 |
| `UT-TAPI-039` | `mapError`（`server.ts:140`） | `状态分支` × `合法迁移` | 分支 L141 `if (error instanceof PikoError && PUBLIC_CODE…`（if；server.ts） | 待实现 |
| `UT-TAPI-040` | `mapError`（`server.ts:140`） | `状态分支` × `合法迁移` | 分支 L141 `error instanceof PikoError && PUBLIC_CODES.ha…`（&&；server.ts） | 待实现 |
| `UT-TAPI-041` | `mapError`（`server.ts:140`） | `状态分支` × `合法迁移` | 分支 L144 `? error instanceof Error :`（ternary；server.ts） | 待实现 |
| `UT-TAPI-042` | `mapError`（`server.ts:140`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L142 值 `{ code: error.code, status: error.statu…` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-043` | `mapError`（`server.ts:140`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L148 值 `{ code: "DependencyUnavailable", status…` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-044` | `send`（`server.ts:27`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `res: ServerResponse` 的 `每等价类合法值` 类（server.ts:27） | 待实现 |
| `UT-TAPI-045` | `send`（`server.ts:27`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `res: ServerResponse` 的 `边界(上/下/零/空/满)` 类（server.ts:27） | 待实现 |
| `UT-TAPI-046` | `send`（`server.ts:27`） | `纯函数/无副作用` × `非法值` | 参数 `res: ServerResponse` 的 `非法值` 类（server.ts:27） | 待实现 |
| `UT-TAPI-047` | `send`（`server.ts:27`） | `数值/长度上限参数` × `恰好通过` | 参数 `status: number` 的 `恰好通过` 类（server.ts:27） | 待实现 |
| `UT-TAPI-048` | `send`（`server.ts:27`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `status: number` 的 `+1 拒绝` 类（server.ts:27） | 待实现 |
| `UT-TAPI-049` | `send`（`server.ts:27`） | `数值/长度上限参数` × `−1 通过` | 参数 `status: number` 的 `−1 通过` 类（server.ts:27） | 待实现 |
| `UT-TAPI-050` | `send`（`server.ts:27`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `value: unknown` 的 `每等价类合法值` 类（server.ts:27） | 待实现 |
| `UT-TAPI-051` | `send`（`server.ts:27`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `value: unknown` 的 `边界(上/下/零/空/满)` 类（server.ts:27） | 待实现 |
| `UT-TAPI-052` | `send`（`server.ts:27`） | `纯函数/无副作用` × `非法值` | 参数 `value: unknown` 的 `非法值` 类（server.ts:27） | 待实现 |
| `UT-TAPI-053` | `send`（`server.ts:27`） | `字符串/路径/枚举输入` × `空` | 参数 `headers: Record<string, string>` 的 `空` 类（server.ts:27） | 待实现 |
| `UT-TAPI-054` | `send`（`server.ts:27`） | `字符串/路径/枚举输入` × `超长` | 参数 `headers: Record<string, string>` 的 `超长` 类（server.ts:27） | 待实现 |
| `UT-TAPI-055` | `send`（`server.ts:27`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `headers: Record<string, string>` 的 `注入字符` 类（server.ts:27） | 待实现 |
| `UT-TAPI-056` | `send`（`server.ts:27`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `headers` 缺省/显式两态（server.ts:27） | 待实现 |
| `UT-TAPI-057` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-058` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（server.ts:40） | 待实现 |
| `UT-TAPI-059` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-060` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStore` 的 `每等价类合法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-061` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（server.ts:40） | 待实现 |
| `UT-TAPI-062` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStore` 的 `非法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-063` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `auth: BearerAuth` 的 `每等价类合法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-064` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `auth: BearerAuth` 的 `边界(上/下/零/空/满)` 类（server.ts:40） | 待实现 |
| `UT-TAPI-065` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `非法值` | 参数 `auth: BearerAuth` 的 `非法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-066` | `ApiServer.constructor`（`server.ts:40`） | `字符串/路径/枚举输入` × `空` | 参数 `onCancel: (taskId: string, outcome: string) => void` 的 `空` 类（server.ts:40） | 待实现 |
| `UT-TAPI-067` | `ApiServer.constructor`（`server.ts:40`） | `字符串/路径/枚举输入` × `超长` | 参数 `onCancel: (taskId: string, outcome: string) => void` 的 `超长` 类（server.ts:40） | 待实现 |
| `UT-TAPI-068` | `ApiServer.constructor`（`server.ts:40`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `onCancel: (taskId: string, outcome: string) => void` 的 `注入字符` 类（server.ts:40） | 待实现 |
| `UT-TAPI-069` | `ApiServer.constructor`（`server.ts:40`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `onCancel` 缺省/显式两态（server.ts:40） | 待实现 |
| `UT-TAPI-070` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `obs: Observability` 的 `每等价类合法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-071` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `obs: Observability` 的 `边界(上/下/零/空/满)` 类（server.ts:40） | 待实现 |
| `UT-TAPI-072` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `非法值` | 参数 `obs: Observability` 的 `非法值` 类（server.ts:40） | 待实现 |
| `UT-TAPI-073` | `ApiServer.constructor`（`server.ts:40`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `obs` 缺省/显式两态（server.ts:40） | 待实现 |
| `UT-TAPI-074` | `ApiServer.constructor`（`server.ts:40`） | `状态分支` × `合法迁移` | 状态写 L47 → `this.server`（server.ts） | 待实现 |
| `UT-TAPI-075` | `create`（`server.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-076` | `create`（`server.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（server.ts:49） | 待实现 |
| `UT-TAPI-077` | `create`（`server.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-078` | `create`（`server.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStore` 的 `每等价类合法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-079` | `create`（`server.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（server.ts:49） | 待实现 |
| `UT-TAPI-080` | `create`（`server.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStore` 的 `非法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-081` | `create`（`server.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `auth: BearerAuth` 的 `每等价类合法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-082` | `create`（`server.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `auth: BearerAuth` 的 `边界(上/下/零/空/满)` 类（server.ts:49） | 待实现 |
| `UT-TAPI-083` | `create`（`server.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `auth: BearerAuth` 的 `非法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-084` | `create`（`server.ts:49`） | `字符串/路径/枚举输入` × `空` | 参数 `onCancel: (taskId: string, outcome: string) => void` 的 `空` 类（server.ts:49） | 待实现 |
| `UT-TAPI-085` | `create`（`server.ts:49`） | `字符串/路径/枚举输入` × `超长` | 参数 `onCancel: (taskId: string, outcome: string) => void` 的 `超长` 类（server.ts:49） | 待实现 |
| `UT-TAPI-086` | `create`（`server.ts:49`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `onCancel: (taskId: string, outcome: string) => void` 的 `注入字符` 类（server.ts:49） | 待实现 |
| `UT-TAPI-087` | `create`（`server.ts:49`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `onCancel` 缺省/显式两态（server.ts:49） | 待实现 |
| `UT-TAPI-088` | `create`（`server.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `obs: Observability` 的 `每等价类合法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-089` | `create`（`server.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `obs: Observability` 的 `边界(上/下/零/空/满)` 类（server.ts:49） | 待实现 |
| `UT-TAPI-090` | `create`（`server.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `obs: Observability` 的 `非法值` 类（server.ts:49） | 待实现 |
| `UT-TAPI-091` | `create`（`server.ts:49`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `obs` 缺省/显式两态（server.ts:49） | 待实现 |
| `UT-TAPI-092` | `create`（`server.ts:49`） | `状态分支` × `合法迁移` | 分支 L52 `(Ajv as any).default ?? Ajv`（??；server.ts） | 待实现 |
| `UT-TAPI-093` | `create`（`server.ts:49`） | `状态分支` × `合法迁移` | 分支 L53 `(addFormats as any).default ?? addFormats`（??；server.ts） | 待实现 |
| `UT-TAPI-094` | `create`（`server.ts:49`） | `状态分支` × `合法迁移` | 分支 L58 `!x.validateTask`（!；server.ts） | 待实现 |
| `UT-TAPI-095` | `create`（`server.ts:49`） | `错误路径` × `每个 typed 错误码` | throw L58 `task schema entrypoint not found`（守卫 `if (!x.validateTask)`；server.ts） | 待实现 |
| `UT-TAPI-096` | `create`（`server.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L59 值 `x` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-097` | `route`（`server.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `req: IncomingMessage` 的 `每等价类合法值` 类（server.ts:62） | 待实现 |
| `UT-TAPI-098` | `route`（`server.ts:62`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `req: IncomingMessage` 的 `边界(上/下/零/空/满)` 类（server.ts:62） | 待实现 |
| `UT-TAPI-099` | `route`（`server.ts:62`） | `纯函数/无副作用` × `非法值` | 参数 `req: IncomingMessage` 的 `非法值` 类（server.ts:62） | 待实现 |
| `UT-TAPI-100` | `route`（`server.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `res: ServerResponse` 的 `每等价类合法值` 类（server.ts:62） | 待实现 |
| `UT-TAPI-101` | `route`（`server.ts:62`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `res: ServerResponse` 的 `边界(上/下/零/空/满)` 类（server.ts:62） | 待实现 |
| `UT-TAPI-102` | `route`（`server.ts:62`） | `纯函数/无副作用` × `非法值` | 参数 `res: ServerResponse` 的 `非法值` 类（server.ts:62） | 待实现 |
| `UT-TAPI-103` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L63 `? typeof req.headers["x-request-id"] === "str…`（ternary；server.ts） | 待实现 |
| `UT-TAPI-104` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L66 `req.url ?? "/"`（??；server.ts） | 待实现 |
| `UT-TAPI-105` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L68 `if (req.method === "POST" && url.pathname ===…`（if；server.ts） | 待实现 |
| `UT-TAPI-106` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L68 `req.method === "POST" && url.pathname === "/t…`（&&；server.ts） | 待实现 |
| `UT-TAPI-107` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L70 `if (!this.validateTask(task))`（if；server.ts） | 待实现 |
| `UT-TAPI-108` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L70 `!this.validateTask(task)`（!；server.ts） | 待实现 |
| `UT-TAPI-109` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L71 `this.validateTask.errors?.map((x) => `${x.ins…`（??；server.ts） | 待实现 |
| `UT-TAPI-110` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L71 `this.validateTask.errors?.map`（?.；server.ts） | 待实现 |
| `UT-TAPI-111` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L79 `? "task_id" in outcome :`（ternary；server.ts） | 待实现 |
| `UT-TAPI-112` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L83 `if (req.method === "POST" && cancel)`（if；server.ts） | 待实现 |
| `UT-TAPI-113` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L83 `req.method === "POST" && cancel`（&&；server.ts） | 待实现 |
| `UT-TAPI-114` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L87 `? receipt.outcome === "StopRequested" :`（ternary；server.ts） | 待实现 |
| `UT-TAPI-115` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L90 `if (req.method === "GET" && result)`（if；server.ts） | 待实现 |
| `UT-TAPI-116` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L90 `req.method === "GET" && result`（&&；server.ts） | 待实现 |
| `UT-TAPI-117` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L92 `if (req.method === "GET" && get)`（if；server.ts） | 待实现 |
| `UT-TAPI-118` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L92 `req.method === "GET" && get`（&&；server.ts） | 待实现 |
| `UT-TAPI-119` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L96 `if (req.method === "GET" && url.pathname === …`（if；server.ts） | 待实现 |
| `UT-TAPI-120` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L96 `req.method === "GET" && url.pathname === "/di…`（&&；server.ts） | 待实现 |
| `UT-TAPI-121` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L97 `!this.obs`（!；server.ts） | 待实现 |
| `UT-TAPI-122` | `route`（`server.ts:62`） | `错误路径` × `每个 typed 错误码` | 分支 L103 `catch (error)`（catch；server.ts） | 待实现 |
| `UT-TAPI-123` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L105 `? e.status === 429 \|\| e.status === 503 :`（ternary；server.ts） | 待实现 |
| `UT-TAPI-124` | `route`（`server.ts:62`） | `状态分支` × `合法迁移` | 分支 L105 `e.status === 429 \|\| e.status === 503`（\|\|；server.ts） | 待实现 |
| `UT-TAPI-125` | `route`（`server.ts:62`） | `错误路径` × `每个 typed 错误码` | throw L71 `InvalidRequest`（守卫 `if (!this.validateTask(task))`；server.ts） | 待实现 |
| `UT-TAPI-126` | `route`（`server.ts:62`） | `错误路径` × `每个 typed 错误码` | throw L76 `QueueFull`（守卫 `if (outcome.kind === "queue_full")`；server.ts） | 待实现 |
| `UT-TAPI-127` | `route`（`server.ts:62`） | `错误路径` × `每个 typed 错误码` | throw L77 `Gone`（守卫 `if (outcome.kind === "tombstone")`；server.ts） | 待实现 |
| `UT-TAPI-128` | `route`（`server.ts:62`） | `错误路径` × `每个 typed 错误码` | throw L78 `TaskConflict`（守卫 `if (outcome.kind === "conflict")`；server.ts） | 待实现 |
| `UT-TAPI-129` | `route`（`server.ts:62`） | `错误路径` × `每个 typed 错误码` | throw L97 `NotFound`（守卫 `if (!this.obs)`；server.ts） | 待实现 |
| `UT-TAPI-130` | `route`（`server.ts:62`） | `错误路径` × `每个 typed 错误码` | throw L102 `NotFound`（守卫 `unconditional`；server.ts） | 待实现 |
| `UT-TAPI-131` | `route`（`server.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L79 值 `send(res, 202, this.store.getRun(("task…` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-132` | `route`（`server.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L87 值 `send(res, receipt.outcome === "StopRequ…` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-133` | `route`（`server.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L90 值 `send(res, 200, this.store.result(decode…` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-134` | `route`（`server.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L92 值 `send(res, 200, this.store.getRun(decode…` 逐值断言（server.ts） | 待实现 |
| `UT-TAPI-135` | `route`（`server.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L99 值 `send(res, 200, this.obs.snapshot())` 逐值断言（server.ts） | 待实现 |
