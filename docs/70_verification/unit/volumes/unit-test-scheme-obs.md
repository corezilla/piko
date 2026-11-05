# UT 分卷登记 · OBS（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：119**（对象类型分布：状态分支 35；数值/长度上限参数 30；纯函数/无副作用 21；字符串/路径/枚举输入 27；错误路径 4；并发/可重入 2）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-OBS-009` | `systemClock.monotonic`（`clock.ts:27`） | `状态分支` × `合法迁移` | 分支 L28 `? typeof performance !== "undefined" :`（ternary；clock.ts） | 待实现 |
| `UT-OBS-010` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `恰好通过` | 参数 `wallMs: inferred` 的 `恰好通过` 类（clock.ts:34） | 待实现 |
| `UT-OBS-011` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `wallMs: inferred` 的 `+1 拒绝` 类（clock.ts:34） | 待实现 |
| `UT-OBS-012` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `−1 通过` | 参数 `wallMs: inferred` 的 `−1 通过` 类（clock.ts:34） | 待实现 |
| `UT-OBS-013` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `wallMs` 缺省/显式两态（clock.ts:34） | 待实现 |
| `UT-OBS-014` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `恰好通过` | 参数 `monoMs: inferred` 的 `恰好通过` 类（clock.ts:34） | 待实现 |
| `UT-OBS-015` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `monoMs: inferred` 的 `+1 拒绝` 类（clock.ts:34） | 待实现 |
| `UT-OBS-016` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `−1 通过` | 参数 `monoMs: inferred` 的 `−1 通过` 类（clock.ts:34） | 待实现 |
| `UT-OBS-017` | `ManualClock.constructor`（`clock.ts:34`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `monoMs` 缺省/显式两态（clock.ts:34） | 待实现 |
| `UT-OBS-018` | `now`（`clock.ts:35`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L36 值 `this.wallMs` 逐值断言（clock.ts） | 待实现 |
| `UT-OBS-019` | `monotonic`（`clock.ts:38`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L39 值 `this.monoMs` 逐值断言（clock.ts） | 待实现 |
| `UT-OBS-020` | `iso`（`clock.ts:41`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L42 值 `new Date(this.wallMs).toISOString()` 逐值断言（clock.ts） | 待实现 |
| `UT-OBS-021` | `advance`（`clock.ts:44`） | `数值/长度上限参数` × `恰好通过` | 参数 `ms: number` 的 `恰好通过` 类（clock.ts:44） | 待实现 |
| `UT-OBS-022` | `advance`（`clock.ts:44`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `ms: number` 的 `+1 拒绝` 类（clock.ts:44） | 待实现 |
| `UT-OBS-023` | `advance`（`clock.ts:44`） | `数值/长度上限参数` × `−1 通过` | 参数 `ms: number` 的 `−1 通过` 类（clock.ts:44） | 待实现 |
| `UT-OBS-024` | `set`（`clock.ts:48`） | `字符串/路径/枚举输入` × `空` | 参数 `wallIso: string` 的 `空` 类（clock.ts:48） | 待实现 |
| `UT-OBS-025` | `set`（`clock.ts:48`） | `字符串/路径/枚举输入` × `超长` | 参数 `wallIso: string` 的 `超长` 类（clock.ts:48） | 待实现 |
| `UT-OBS-026` | `set`（`clock.ts:48`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `wallIso: string` 的 `注入字符` 类（clock.ts:48） | 待实现 |
| `UT-OBS-027` | `set`（`clock.ts:48`） | `数值/长度上限参数` × `恰好通过` | 参数 `monoMs: number` 的 `恰好通过` 类（clock.ts:48） | 待实现 |
| `UT-OBS-028` | `set`（`clock.ts:48`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `monoMs: number` 的 `+1 拒绝` 类（clock.ts:48） | 待实现 |
| `UT-OBS-029` | `set`（`clock.ts:48`） | `数值/长度上限参数` × `−1 通过` | 参数 `monoMs: number` 的 `−1 通过` 类（clock.ts:48） | 待实现 |
| `UT-OBS-030` | `set`（`clock.ts:48`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `monoMs` 缺省/显式两态（clock.ts:48） | 待实现 |
| `UT-OBS-031` | `set`（`clock.ts:48`） | `状态分支` × `合法迁移` | 分支 L50 `if (monoMs !== undefined)`（if；clock.ts） | 待实现 |
| `UT-OBS-032` | `set`（`clock.ts:48`） | `状态分支` × `合法迁移` | 状态写 L49 → `this.wallMs`（clock.ts） | 待实现 |
| `UT-OBS-033` | `set`（`clock.ts:48`） | `状态分支` × `合法迁移` | 状态写 L50 → `this.monoMs`（clock.ts） | 待实现 |
| `UT-OBS-034` | `audit`（`observability.ts:104`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `record: AuditRecord` 的 `每等价类合法值` 类（observability.ts:104） | 待实现 |
| `UT-OBS-035` | `audit`（`observability.ts:104`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `record: AuditRecord` 的 `边界(上/下/零/空/满)` 类（observability.ts:104） | 待实现 |
| `UT-OBS-036` | `audit`（`observability.ts:104`） | `纯函数/无副作用` × `非法值` | 参数 `record: AuditRecord` 的 `非法值` 类（observability.ts:104） | 待实现 |
| `UT-OBS-037` | `audit`（`observability.ts:104`） | `状态分支` × `合法迁移` | 分支 L106 `record.task_id ?? null`（??；observability.ts） | 待实现 |
| `UT-OBS-038` | `audit`（`observability.ts:104`） | `状态分支` × `合法迁移` | 分支 L107 `if (this.auditTrail.length > 200)`（if；observability.ts） | 待实现 |
| `UT-OBS-039` | `audit`（`observability.ts:104`） | `错误路径` × `每个 typed 错误码` | 分支 L108 `catch ()`（catch；observability.ts） | 待实现 |
| `UT-OBS-040` | `snapshot`（`observability.ts:114`） | `数值/长度上限参数` × `恰好通过` | 参数 `limit: inferred` 的 `恰好通过` 类（observability.ts:114） | 待实现 |
| `UT-OBS-041` | `snapshot`（`observability.ts:114`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `limit: inferred` 的 `+1 拒绝` 类（observability.ts:114） | 待实现 |
| `UT-OBS-042` | `snapshot`（`observability.ts:114`） | `数值/长度上限参数` × `−1 通过` | 参数 `limit: inferred` 的 `−1 通过` 类（observability.ts:114） | 待实现 |
| `UT-OBS-043` | `snapshot`（`observability.ts:114`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `limit` 缺省/显式两态（observability.ts:114） | 待实现 |
| `UT-OBS-044` | `snapshot`（`observability.ts:114`） | `状态分支` × `合法迁移` | 分支 L116 `loop (this.counters)`（loop；observability.ts） | 待实现 |
| `UT-OBS-045` | `snapshot`（`observability.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L117 值 `{ instance_id: this.config.instance_id,…` 逐值断言（observability.ts） | 待实现 |
| `UT-OBS-046` | `bump`（`observability.ts:127`） | `字符串/路径/枚举输入` × `空` | 参数 `counter: string` 的 `空` 类（observability.ts:127） | 待实现 |
| `UT-OBS-047` | `bump`（`observability.ts:127`） | `字符串/路径/枚举输入` × `超长` | 参数 `counter: string` 的 `超长` 类（observability.ts:127） | 待实现 |
| `UT-OBS-048` | `bump`（`observability.ts:127`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `counter: string` 的 `注入字符` 类（observability.ts:127） | 待实现 |
| `UT-OBS-049` | `bump`（`observability.ts:127`） | `数值/长度上限参数` × `恰好通过` | 参数 `delta: inferred` 的 `恰好通过` 类（observability.ts:127） | 待实现 |
| `UT-OBS-050` | `bump`（`observability.ts:127`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `delta: inferred` 的 `+1 拒绝` 类（observability.ts:127） | 待实现 |
| `UT-OBS-051` | `bump`（`observability.ts:127`） | `数值/长度上限参数` × `−1 通过` | 参数 `delta: inferred` 的 `−1 通过` 类（observability.ts:127） | 待实现 |
| `UT-OBS-052` | `bump`（`observability.ts:127`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `delta` 缺省/显式两态（observability.ts:127） | 待实现 |
| `UT-OBS-053` | `bump`（`observability.ts:127`） | `状态分支` × `合法迁移` | 分支 L129 `this.counters.get(counter) ?? 0`（??；observability.ts） | 待实现 |
| `UT-OBS-054` | `bump`（`observability.ts:127`） | `错误路径` × `每个 typed 错误码` | 分支 L130 `catch ()`（catch；observability.ts） | 待实现 |
| `UT-OBS-055` | `redact`（`observability.ts:44`） | `字符串/路径/枚举输入` × `空` | 参数 `fields: Record<string, unknown> \| undefined` 的 `空` 类（observability.ts:44） | 待实现 |
| `UT-OBS-056` | `redact`（`observability.ts:44`） | `字符串/路径/枚举输入` × `超长` | 参数 `fields: Record<string, unknown> \| undefined` 的 `超长` 类（observability.ts:44） | 待实现 |
| `UT-OBS-057` | `redact`（`observability.ts:44`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `fields: Record<string, unknown> \| undefined` 的 `注入字符` 类（observability.ts:44） | 待实现 |
| `UT-OBS-058` | `redact`（`observability.ts:44`） | `状态分支` × `合法迁移` | 分支 L46 `loop (Object.entries(fields ?? {}))`（loop；observability.ts） | 待实现 |
| `UT-OBS-059` | `redact`（`observability.ts:44`） | `状态分支` × `合法迁移` | 分支 L46 `fields ?? {}`（??；observability.ts） | 待实现 |
| `UT-OBS-060` | `redact`（`observability.ts:44`） | `状态分支` × `合法迁移` | 分支 L47 `if (FORBIDDEN_KEYS.test(k))`（if；observability.ts） | 待实现 |
| `UT-OBS-061` | `redact`（`observability.ts:44`） | `状态分支` × `合法迁移` | 分支 L51 `? typeof v === "string" \|\| typeof v === "numb…`（ternary；observability.ts） | 待实现 |
| `UT-OBS-062` | `redact`（`observability.ts:44`） | `状态分支` × `合法迁移` | 分支 L51 `typeof v === "string" \|\| typeof v === "number…`（\|\|；observability.ts） | 待实现 |
| `UT-OBS-063` | `redact`（`observability.ts:44`） | `状态分支` × `合法迁移` | 分支 L51 `typeof v === "string" \|\| typeof v === "number"`（\|\|；observability.ts） | 待实现 |
| `UT-OBS-064` | `redact`（`observability.ts:44`） | `状态分支` × `合法迁移` | 分支 L51 `? v === null :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-065` | `redact`（`observability.ts:44`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L53 值 `out` 逐值断言（observability.ts） | 待实现 |
| `UT-OBS-066` | `Observability.constructor`（`observability.ts:62`） | `字符串/路径/枚举输入` × `空` | 参数 `config: { instance_id: string; observability?: { log_level?: string;` 的 `空` 类（observability.ts:62） | 待实现 |
| `UT-OBS-067` | `Observability.constructor`（`observability.ts:62`） | `字符串/路径/枚举输入` × `超长` | 参数 `config: { instance_id: string; observability?: { log_level?: string;` 的 `超长` 类（observability.ts:62） | 待实现 |
| `UT-OBS-068` | `Observability.constructor`（`observability.ts:62`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `config: { instance_id: string; observability?: { log_level?: string;` 的 `注入字符` 类（observability.ts:62） | 待实现 |
| `UT-OBS-069` | `Observability.constructor`（`observability.ts:62`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `config` 缺省/显式两态（observability.ts:62） | 待实现 |
| `UT-OBS-070` | `Observability.constructor`（`observability.ts:62`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `clock: Clock` 的 `每等价类合法值` 类（observability.ts:62） | 待实现 |
| `UT-OBS-071` | `Observability.constructor`（`observability.ts:62`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `clock: Clock` 的 `边界(上/下/零/空/满)` 类（observability.ts:62） | 待实现 |
| `UT-OBS-072` | `Observability.constructor`（`observability.ts:62`） | `纯函数/无副作用` × `非法值` | 参数 `clock: Clock` 的 `非法值` 类（observability.ts:62） | 待实现 |
| `UT-OBS-073` | `Observability.constructor`（`observability.ts:62`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `clock` 缺省/显式两态（observability.ts:62） | 待实现 |
| `UT-OBS-074` | `keep`（`observability.ts:67`） | `数值/长度上限参数` × `恰好通过` | 参数 `limit: number` 的 `恰好通过` 类（observability.ts:67） | 待实现 |
| `UT-OBS-075` | `keep`（`observability.ts:67`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `limit: number` 的 `+1 拒绝` 类（observability.ts:67） | 待实现 |
| `UT-OBS-076` | `keep`（`observability.ts:67`） | `数值/长度上限参数` × `−1 通过` | 参数 `limit: number` 的 `−1 通过` 类（observability.ts:67） | 待实现 |
| `UT-OBS-077` | `keep`（`observability.ts:67`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L68 值 `Math.max(16, limit)` 逐值断言（observability.ts） | 待实现 |
| `UT-OBS-078` | `emit`（`observability.ts:72`） | `字符串/路径/枚举输入` × `空` | 参数 `name: string` 的 `空` 类（observability.ts:72） | 待实现 |
| `UT-OBS-079` | `emit`（`observability.ts:72`） | `字符串/路径/枚举输入` × `超长` | 参数 `name: string` 的 `超长` 类（observability.ts:72） | 待实现 |
| `UT-OBS-080` | `emit`（`observability.ts:72`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `name: string` 的 `注入字符` 类（observability.ts:72） | 待实现 |
| `UT-OBS-081` | `emit`（`observability.ts:72`） | `字符串/路径/枚举输入` × `空` | 参数 `fields: Record<string, unknown>` 的 `空` 类（observability.ts:72） | 待实现 |
| `UT-OBS-082` | `emit`（`observability.ts:72`） | `字符串/路径/枚举输入` × `超长` | 参数 `fields: Record<string, unknown>` 的 `超长` 类（observability.ts:72） | 待实现 |
| `UT-OBS-083` | `emit`（`observability.ts:72`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `fields: Record<string, unknown>` 的 `注入字符` 类（observability.ts:72） | 待实现 |
| `UT-OBS-084` | `emit`（`observability.ts:72`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `fields` 缺省/显式两态（observability.ts:72） | 待实现 |
| `UT-OBS-085` | `emit`（`observability.ts:72`） | `状态分支` × `合法迁移` | 分支 L78 `? fields?.task_id :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-086` | `emit`（`observability.ts:72`） | `状态分支` × `合法迁移` | 分支 L78 `fields?.task_id`（?.；observability.ts） | 待实现 |
| `UT-OBS-087` | `emit`（`observability.ts:72`） | `状态分支` × `合法迁移` | 分支 L79 `? typeof fields?.generation === "number" :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-088` | `emit`（`observability.ts:72`） | `状态分支` × `合法迁移` | 分支 L79 `fields?.generation`（?.；observability.ts） | 待实现 |
| `UT-OBS-089` | `emit`（`observability.ts:72`） | `并发/可重入` × `并发对偶/交错` | 分支 L80 `? typeof fields?.epoch === "number" :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-090` | `emit`（`observability.ts:72`） | `并发/可重入` × `并发对偶/交错` | 分支 L80 `fields?.epoch`（?.；observability.ts） | 待实现 |
| `UT-OBS-091` | `emit`（`observability.ts:72`） | `状态分支` × `合法迁移` | 分支 L81 `? fields?.redacted_error_class :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-092` | `emit`（`observability.ts:72`） | `状态分支` × `合法迁移` | 分支 L81 `fields?.redacted_error_class`（?.；observability.ts） | 待实现 |
| `UT-OBS-093` | `emit`（`observability.ts:72`） | `状态分支` × `合法迁移` | 分支 L84 `if (this.events.length > 500)`（if；observability.ts） | 待实现 |
| `UT-OBS-094` | `emit`（`observability.ts:72`） | `错误路径` × `每个 typed 错误码` | 分支 L85 `catch ()`（catch；observability.ts） | 待实现 |
| `UT-OBS-095` | `metric`（`observability.ts:90`） | `字符串/路径/枚举输入` × `空` | 参数 `id: string` 的 `空` 类（observability.ts:90） | 待实现 |
| `UT-OBS-096` | `metric`（`observability.ts:90`） | `字符串/路径/枚举输入` × `超长` | 参数 `id: string` 的 `超长` 类（observability.ts:90） | 待实现 |
| `UT-OBS-097` | `metric`（`observability.ts:90`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `id: string` 的 `注入字符` 类（observability.ts:90） | 待实现 |
| `UT-OBS-098` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `op: MetricOp` 的 `每等价类合法值` 类（observability.ts:90） | 待实现 |
| `UT-OBS-099` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `op: MetricOp` 的 `边界(上/下/零/空/满)` 类（observability.ts:90） | 待实现 |
| `UT-OBS-100` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `非法值` | 参数 `op: MetricOp` 的 `非法值` 类（observability.ts:90） | 待实现 |
| `UT-OBS-101` | `metric`（`observability.ts:90`） | `数值/长度上限参数` × `恰好通过` | 参数 `value: number` 的 `恰好通过` 类（observability.ts:90） | 待实现 |
| `UT-OBS-102` | `metric`（`observability.ts:90`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `value: number` 的 `+1 拒绝` 类（observability.ts:90） | 待实现 |
| `UT-OBS-103` | `metric`（`observability.ts:90`） | `数值/长度上限参数` × `−1 通过` | 参数 `value: number` 的 `−1 通过` 类（observability.ts:90） | 待实现 |
| `UT-OBS-104` | `metric`（`observability.ts:90`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `value` 缺省/显式两态（observability.ts:90） | 待实现 |
| `UT-OBS-105` | `metric`（`observability.ts:90`） | `字符串/路径/枚举输入` × `空` | 参数 `labels: Record<string, string>` 的 `空` 类（observability.ts:90） | 待实现 |
| `UT-OBS-106` | `metric`（`observability.ts:90`） | `字符串/路径/枚举输入` × `超长` | 参数 `labels: Record<string, string>` 的 `超长` 类（observability.ts:90） | 待实现 |
| `UT-OBS-107` | `metric`（`observability.ts:90`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `labels: Record<string, string>` 的 `注入字符` 类（observability.ts:90） | 待实现 |
| `UT-OBS-108` | `metric`（`observability.ts:90`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `labels` 缺省/显式两态（observability.ts:90） | 待实现 |
| `UT-OBS-109` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `unit: inferred` 的 `每等价类合法值` 类（observability.ts:90） | 待实现 |
| `UT-OBS-110` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `unit: inferred` 的 `边界(上/下/零/空/满)` 类（observability.ts:90） | 待实现 |
| `UT-OBS-111` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `非法值` | 参数 `unit: inferred` 的 `非法值` 类（observability.ts:90） | 待实现 |
| `UT-OBS-112` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `unit` 缺省/显式两态（observability.ts:90） | 待实现 |
| `UT-OBS-113` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L92 `if (this.config.observability?.metrics_enable…`（if；observability.ts） | 待实现 |
| `UT-OBS-114` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L92 `this.config.observability?.metrics_enabled`（?.；observability.ts） | 待实现 |
| `UT-OBS-115` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L93 `? labels && Object.keys(labels).length :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-116` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L93 `labels && Object.keys(labels).length`（&&；observability.ts） | 待实现 |
| `UT-OBS-117` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L96 `? op === "inc" :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-118` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L96 `cur?.value ?? 0`（??；observability.ts） | 待实现 |
| `UT-OBS-119` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L96 `cur?.value`（?.；observability.ts） | 待实现 |
| `UT-OBS-120` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L96 `value ?? 1`（??；observability.ts） | 待实现 |
| `UT-OBS-121` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L96 `? op === "set" :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-122` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L96 `value ?? 0`（??；observability.ts） | 待实现 |
| `UT-OBS-123` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L96 `cur?.value ?? Number.POSITIVE_INFINITY`（??；observability.ts） | 待实现 |
| `UT-OBS-124` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L97 `METRIC_UNITS[unit] ?? unit`（??；observability.ts） | 待实现 |
| `UT-OBS-125` | `metric`（`observability.ts:90`） | `状态分支` × `合法迁移` | 分支 L97 `? labels :`（ternary；observability.ts） | 待实现 |
| `UT-OBS-126` | `metric`（`observability.ts:90`） | `错误路径` × `每个 typed 错误码` | 分支 L98 `catch ()`（catch；observability.ts） | 待实现 |
| `UT-OBS-127` | `metric`（`observability.ts:90`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L92 值 `（无值 return：提前退出）` 逐值断言（observability.ts） | 待实现 |
