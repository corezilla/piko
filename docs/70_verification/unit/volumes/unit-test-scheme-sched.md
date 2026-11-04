# UT 分卷登记 · SCHED（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：34**（对象类型分布：纯函数/无副作用 12；字符串/路径/枚举输入 12；状态分支 3；数值/长度上限参数 6；资源获取/释放 1）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-SCHED-006` | `constructor`（`scheduler.ts:10`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStore` 的 `每等价类合法值` 类（scheduler.ts:10） | 待实现 |
| `UT-SCHED-007` | `constructor`（`scheduler.ts:10`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（scheduler.ts:10） | 待实现 |
| `UT-SCHED-008` | `constructor`（`scheduler.ts:10`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStore` 的 `非法值` 类（scheduler.ts:10） | 待实现 |
| `UT-SCHED-009` | `constructor`（`scheduler.ts:10`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（scheduler.ts:10） | 待实现 |
| `UT-SCHED-010` | `constructor`（`scheduler.ts:10`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（scheduler.ts:10） | 待实现 |
| `UT-SCHED-011` | `constructor`（`scheduler.ts:10`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（scheduler.ts:10） | 待实现 |
| `UT-SCHED-012` | `acquire`（`scheduler.ts:15`） | `字符串/路径/枚举输入` × `空` | 参数 `owner: string` 的 `空` 类（scheduler.ts:15） | 待实现 |
| `UT-SCHED-013` | `acquire`（`scheduler.ts:15`） | `字符串/路径/枚举输入` × `超长` | 参数 `owner: string` 的 `超长` 类（scheduler.ts:15） | 待实现 |
| `UT-SCHED-014` | `acquire`（`scheduler.ts:15`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `owner: string` 的 `注入字符` 类（scheduler.ts:15） | 待实现 |
| `UT-SCHED-015` | `acquire`（`scheduler.ts:15`） | `状态分支` × `合法迁移` | 分支 L17 `? granted === "slot_busy" :`（ternary；scheduler.ts） | 待实现 |
| `UT-SCHED-016` | `acquire`（`scheduler.ts:15`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L17 值 `granted === "slot_busy" ? null : granted` 逐值断言（scheduler.ts） | 待实现 |
| `UT-SCHED-017` | `recover`（`scheduler.ts:21`） | `字符串/路径/枚举输入` × `空` | 参数 `owner: string` 的 `空` 类（scheduler.ts:21） | 待实现 |
| `UT-SCHED-018` | `recover`（`scheduler.ts:21`） | `字符串/路径/枚举输入` × `超长` | 参数 `owner: string` 的 `超长` 类（scheduler.ts:21） | 待实现 |
| `UT-SCHED-019` | `recover`（`scheduler.ts:21`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `owner: string` 的 `注入字符` 类（scheduler.ts:21） | 待实现 |
| `UT-SCHED-020` | `recover`（`scheduler.ts:21`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L22 值 `this.store.recoverOrphaned(owner, this.…` 逐值断言（scheduler.ts） | 待实现 |
| `UT-SCHED-021` | `renew`（`scheduler.ts:25`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（scheduler.ts:25） | 待实现 |
| `UT-SCHED-022` | `renew`（`scheduler.ts:25`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（scheduler.ts:25） | 待实现 |
| `UT-SCHED-023` | `renew`（`scheduler.ts:25`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（scheduler.ts:25） | 待实现 |
| `UT-SCHED-024` | `renew`（`scheduler.ts:25`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（scheduler.ts:25） | 待实现 |
| `UT-SCHED-025` | `renew`（`scheduler.ts:25`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（scheduler.ts:25） | 待实现 |
| `UT-SCHED-026` | `renew`（`scheduler.ts:25`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（scheduler.ts:25） | 待实现 |
| `UT-SCHED-027` | `renew`（`scheduler.ts:25`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L26 值 `this.store.renewSlot(taskId, epoch)` 逐值断言（scheduler.ts） | 待实现 |
| `UT-SCHED-028` | `release`（`scheduler.ts:29`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（scheduler.ts:29） | 待实现 |
| `UT-SCHED-029` | `release`（`scheduler.ts:29`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（scheduler.ts:29） | 待实现 |
| `UT-SCHED-030` | `release`（`scheduler.ts:29`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（scheduler.ts:29） | 待实现 |
| `UT-SCHED-031` | `release`（`scheduler.ts:29`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（scheduler.ts:29） | 待实现 |
| `UT-SCHED-032` | `release`（`scheduler.ts:29`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（scheduler.ts:29） | 待实现 |
| `UT-SCHED-033` | `release`（`scheduler.ts:29`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（scheduler.ts:29） | 待实现 |
| `UT-SCHED-034` | `release`（`scheduler.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L30 值 `this.store.releaseSlot(taskId, epoch)` 逐值断言（scheduler.ts） | 待实现 |
| `UT-SCHED-035` | `read`（`scheduler.ts:33`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L34 值 `this.store.readSlot()` 逐值断言（scheduler.ts） | 待实现 |
| `UT-SCHED-036` | `identity`（`scheduler.ts:37`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L38 值 `{ owner_id: `${this.config.instance_id}…` 逐值断言（scheduler.ts） | 待实现 |
| `UT-SCHED-037` | `close`（`scheduler.ts:41`） | `状态分支` × `合法迁移` | 分支 L42 `if (this.timer)`（if；scheduler.ts） | 待实现 |
| `UT-SCHED-038` | `close`（`scheduler.ts:41`） | `状态分支` × `合法迁移` | 状态写 L43 → `this.timer`（scheduler.ts） | 待实现 |
| `UT-SCHED-039` | `close`（`scheduler.ts:41`） | `资源获取/释放` × `正常释放` | 资源操作 L42 `clearInterval`（scheduler.ts） | 待实现 |
