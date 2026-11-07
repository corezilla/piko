# UT 分卷登记 · IPC（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：171**（对象类型分布：纯函数/无副作用 78；错误路径 5；状态分支 63；并发/可重入 2；数值/长度上限参数 10；资源获取/释放 6；时间域行为 1；字符串/路径/枚举输入 6）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-IPC-013` | `LocalChannel.constructor`（`ipc.ts:117`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `handler: FactHandler` 的 `每等价类合法值` 类（ipc.ts:117） | 待实现 |
| `UT-IPC-014` | `LocalChannel.constructor`（`ipc.ts:117`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `handler: FactHandler` 的 `边界(上/下/零/空/满)` 类（ipc.ts:117） | 待实现 |
| `UT-IPC-015` | `LocalChannel.constructor`（`ipc.ts:117`） | `纯函数/无副作用` × `非法值` | 参数 `handler: FactHandler` 的 `非法值` 类（ipc.ts:117） | 待实现 |
| `UT-IPC-016` | `report`（`ipc.ts:118`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `fact: Fact` 的 `每等价类合法值` 类（ipc.ts:118） | 待实现 |
| `UT-IPC-017` | `report`（`ipc.ts:118`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `fact: Fact` 的 `边界(上/下/零/空/满)` 类（ipc.ts:118） | 待实现 |
| `UT-IPC-018` | `report`（`ipc.ts:118`） | `纯函数/无副作用` × `非法值` | 参数 `fact: Fact` 的 `非法值` 类（ipc.ts:118） | 待实现 |
| `UT-IPC-019` | `report`（`ipc.ts:118`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（ipc.ts:118） | 待实现 |
| `UT-IPC-020` | `report`（`ipc.ts:118`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L119 值 `this.handler.apply(fact)` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-021` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `send: (msg: unknown) => void` 的 `每等价类合法值` 类（ipc.ts:131） | 待实现 |
| `UT-IPC-022` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `send: (msg: unknown) => void` 的 `边界(上/下/零/空/满)` 类（ipc.ts:131） | 待实现 |
| `UT-IPC-023` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `非法值` | 参数 `send: (msg: unknown) => void` 的 `非法值` 类（ipc.ts:131） | 待实现 |
| `UT-IPC-024` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `onCommand: (cmd: Command) => void` 的 `每等价类合法值` 类（ipc.ts:131） | 待实现 |
| `UT-IPC-025` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `onCommand: (cmd: Command) => void` 的 `边界(上/下/零/空/满)` 类（ipc.ts:131） | 待实现 |
| `UT-IPC-026` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `非法值` | 参数 `onCommand: (cmd: Command) => void` 的 `非法值` 类（ipc.ts:131） | 待实现 |
| `UT-IPC-027` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `onCommand` 缺省/显式两态（ipc.ts:131） | 待实现 |
| `UT-IPC-028` | `ProcessChannel.constructor`（`ipc.ts:131`） | `状态分支` × `合法迁移` | 分支 L133 `if (msg?.ipc === "outcome" && typeof msg.id =…`（if；ipc.ts） | 待实现 |
| `UT-IPC-029` | `ProcessChannel.constructor`（`ipc.ts:131`） | `状态分支` × `合法迁移` | 分支 L133 `msg?.ipc === "outcome" && typeof msg.id === "…`（&&；ipc.ts） | 待实现 |
| `UT-IPC-030` | `ProcessChannel.constructor`（`ipc.ts:131`） | `状态分支` × `合法迁移` | 分支 L133 `msg?.ipc`（?.；ipc.ts） | 待实现 |
| `UT-IPC-031` | `ProcessChannel.constructor`（`ipc.ts:131`） | `状态分支` × `合法迁移` | 分支 L135 `if (resolve)`（if；ipc.ts） | 待实现 |
| `UT-IPC-032` | `ProcessChannel.constructor`（`ipc.ts:131`） | `状态分支` × `合法迁移` | 分支 L141 `if (msg?.ipc === "command" && onCommand)`（if；ipc.ts） | 待实现 |
| `UT-IPC-033` | `ProcessChannel.constructor`（`ipc.ts:131`） | `状态分支` × `合法迁移` | 分支 L141 `msg?.ipc === "command" && onCommand`（&&；ipc.ts） | 待实现 |
| `UT-IPC-034` | `ProcessChannel.constructor`（`ipc.ts:131`） | `状态分支` × `合法迁移` | 分支 L141 `msg?.ipc`（?.；ipc.ts） | 待实现 |
| `UT-IPC-035` | `ProcessChannel.constructor`（`ipc.ts:131`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L139 值 `（无值 return：提前退出）` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-036` | `report`（`ipc.ts:144`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `fact: Fact` 的 `每等价类合法值` 类（ipc.ts:144） | 待实现 |
| `UT-IPC-037` | `report`（`ipc.ts:144`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `fact: Fact` 的 `边界(上/下/零/空/满)` 类（ipc.ts:144） | 待实现 |
| `UT-IPC-038` | `report`（`ipc.ts:144`） | `纯函数/无副作用` × `非法值` | 参数 `fact: Fact` 的 `非法值` 类（ipc.ts:144） | 待实现 |
| `UT-IPC-039` | `report`（`ipc.ts:144`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（ipc.ts:144） | 待实现 |
| `UT-IPC-040` | `report`（`ipc.ts:144`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L146 值 `new Promise((resolve) => { this.pending…` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-041` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `child: { on: Function; send?: Function; connected?: boolean }` 的 `每等价类合法值` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-042` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `child: { on: Function; send?: Function; connected?: boolean }` 的 `边界(上/下/零/空/满)` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-043` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `非法值` | 参数 `child: { on: Function; send?: Function; connected?: boolean }` 的 `非法值` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-044` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `child` 缺省/显式两态（ipc.ts:154） | 待实现 |
| `UT-IPC-045` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `handler: FactHandler` 的 `每等价类合法值` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-046` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `handler: FactHandler` 的 `边界(上/下/零/空/满)` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-047` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `非法值` | 参数 `handler: FactHandler` 的 `非法值` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-048` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `onCommand: (cmd: Command) => void` 的 `每等价类合法值` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-049` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `onCommand: (cmd: Command) => void` 的 `边界(上/下/零/空/满)` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-050` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `非法值` | 参数 `onCommand: (cmd: Command) => void` 的 `非法值` 类（ipc.ts:154） | 待实现 |
| `UT-IPC-051` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `onCommand` 缺省/显式两态（ipc.ts:154） | 待实现 |
| `UT-IPC-052` | `attachChildToHandler`（`ipc.ts:154`） | `状态分支` × `合法迁移` | 分支 L160 `if (child.connected === false)`（if；ipc.ts） | 待实现 |
| `UT-IPC-053` | `attachChildToHandler`（`ipc.ts:154`） | `错误路径` × `每个 typed 错误码` | 分支 L163 `catch ()`（catch；ipc.ts） | 待实现 |
| `UT-IPC-054` | `attachChildToHandler`（`ipc.ts:154`） | `状态分支` × `合法迁移` | 分支 L168 `if (msg?.ipc === "fact")`（if；ipc.ts） | 待实现 |
| `UT-IPC-055` | `attachChildToHandler`（`ipc.ts:154`） | `状态分支` × `合法迁移` | 分支 L168 `msg?.ipc`（?.；ipc.ts） | 待实现 |
| `UT-IPC-056` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L160 值 `（无值 return：提前退出）` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-057` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L171 值 `（无值 return：提前退出）` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-058` | `attachChildToHandler`（`ipc.ts:154`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L175 值 `{ send }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-059` | `FactHandler.constructor`（`ipc.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStore` 的 `每等价类合法值` 类（ipc.ts:49） | 待实现 |
| `UT-IPC-060` | `FactHandler.constructor`（`ipc.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（ipc.ts:49） | 待实现 |
| `UT-IPC-061` | `FactHandler.constructor`（`ipc.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStore` 的 `非法值` 类（ipc.ts:49） | 待实现 |
| `UT-IPC-062` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `fact: Fact` 的 `每等价类合法值` 类（ipc.ts:50） | 待实现 |
| `UT-IPC-063` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `fact: Fact` 的 `边界(上/下/零/空/满)` 类（ipc.ts:50） | 待实现 |
| `UT-IPC-064` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `非法值` | 参数 `fact: Fact` 的 `非法值` 类（ipc.ts:50） | 待实现 |
| `UT-IPC-065` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L53 `case "staging"`（case；ipc.ts） | 待实现 |
| `UT-IPC-066` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L56 `case "delivery"`（case；ipc.ts） | 待实现 |
| `UT-IPC-067` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L59 `case "turn"`（case；ipc.ts） | 待实现 |
| `UT-IPC-068` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L62 `case "reserveModel"`（case；ipc.ts） | 待实现 |
| `UT-IPC-069` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L64 `case "observeUsage"`（case；ipc.ts） | 待实现 |
| `UT-IPC-070` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L67 `case "terminalModel"`（case；ipc.ts） | 待实现 |
| `UT-IPC-071` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L70 `case "reserveTool"`（case；ipc.ts） | 待实现 |
| `UT-IPC-072` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L72 `case "terminalTool"`（case；ipc.ts） | 待实现 |
| `UT-IPC-073` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L75 `case "providerCall"`（case；ipc.ts） | 待实现 |
| `UT-IPC-074` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L78 `case "closeIntake"`（case；ipc.ts） | 待实现 |
| `UT-IPC-075` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L80 `case "publishResult"`（case；ipc.ts） | 待实现 |
| `UT-IPC-076` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L83 `case "finish"`（case；ipc.ts） | 待实现 |
| `UT-IPC-077` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L86 `case "preconditionFailure"`（case；ipc.ts） | 待实现 |
| `UT-IPC-078` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L89 `case "stagingClaim"`（case；ipc.ts） | 待实现 |
| `UT-IPC-079` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L91 `? task_id :`（ternary；ipc.ts） | 待实现 |
| `UT-IPC-080` | `apply`（`ipc.ts:50`） | `并发/可重入` × `并发对偶/交错` | 分支 L93 `case "claim"`（case；ipc.ts） | 待实现 |
| `UT-IPC-081` | `apply`（`ipc.ts:50`） | `并发/可重入` × `并发对偶/交错` | 分支 L98 `if (grant === "slot_busy")`（if；ipc.ts） | 待实现 |
| `UT-IPC-082` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L101 `default`（default；ipc.ts） | 待实现 |
| `UT-IPC-083` | `apply`（`ipc.ts:50`） | `错误路径` × `每个 typed 错误码` | 分支 L104 `catch (error)`（catch；ipc.ts） | 待实现 |
| `UT-IPC-084` | `apply`（`ipc.ts:50`） | `状态分支` × `合法迁移` | 分支 L105 `? error instanceof Error :`（ternary；ipc.ts） | 待实现 |
| `UT-IPC-085` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L55 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-086` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L58 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-087` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L61 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-088` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L63 值 `{ ok: true, value: this.store.reserveMo…` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-089` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L66 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-090` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L69 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-091` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L71 值 `{ ok: true, value: this.store.reserveTo…` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-092` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L74 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-093` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L77 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-094` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L79 值 `{ ok: true, value: this.store.tryCloseI…` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-095` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L82 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-096` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L85 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-097` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L88 值 `{ ok: true }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-098` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L91 值 `{ ok: true, value: task_id ? { task_id …` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-099` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L98 值 `{ ok: true, value: null }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-100` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L99 值 `{ ok: true, value: grant }` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-101` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L102 值 `{ ok: false, error: `unknown fact ${(fa…` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-102` | `apply`（`ipc.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L105 值 `{ ok: false, error: error instanceof Er…` 逐值断言（ipc.ts） | 待实现 |
| `UT-IPC-103` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `env: NodeJS.ProcessEnv` 的 `每等价类合法值` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-104` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `env: NodeJS.ProcessEnv` 的 `边界(上/下/零/空/满)` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-105` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `非法值` | 参数 `env: NodeJS.ProcessEnv` 的 `非法值` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-106` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `数值/长度上限参数` × `恰好通过` | 参数 `onExit: (code: number \| null, signal: NodeJS.Signals \| null) => void` 的 `恰好通过` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-107` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `onExit: (code: number \| null, signal: NodeJS.Signals \| null) => void` 的 `+1 拒绝` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-108` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `数值/长度上限参数` × `−1 通过` | 参数 `onExit: (code: number \| null, signal: NodeJS.Signals \| null) => void` 的 `−1 通过` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-109` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `facts: FactHandler` 的 `每等价类合法值` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-110` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `facts: FactHandler` 的 `边界(上/下/零/空/满)` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-111` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `非法值` | 参数 `facts: FactHandler` 的 `非法值` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-112` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `facts` 缺省/显式两态（supervisor.ts:20） | 待实现 |
| `UT-IPC-113` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `clock: Clock` 的 `每等价类合法值` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-114` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `clock: Clock` 的 `边界(上/下/零/空/满)` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-115` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `非法值` | 参数 `clock: Clock` 的 `非法值` 类（supervisor.ts:20） | 待实现 |
| `UT-IPC-116` | `ExecutionProcessSupervisor.constructor`（`supervisor.ts:20`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `clock` 缺省/显式两态（supervisor.ts:20） | 待实现 |
| `UT-IPC-117` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L28 `if (this.stopped)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-118` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L35 `? process.execArgv.some((a) => a.includes("ts…`（ternary；supervisor.ts） | 待实现 |
| `UT-IPC-119` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L40 `if (this.facts)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-120` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L44 `if (msg?.type === "heartbeat" \|\| msg?.fact?.k…`（if；supervisor.ts） | 待实现 |
| `UT-IPC-121` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L44 `msg?.type === "heartbeat" \|\| msg?.fact?.kind …`（\|\|；supervisor.ts） | 待实现 |
| `UT-IPC-122` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L44 `msg?.type`（?.；supervisor.ts） | 待实现 |
| `UT-IPC-123` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L44 `msg?.fact?.kind`（?.；supervisor.ts） | 待实现 |
| `UT-IPC-124` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L44 `msg?.fact`（?.；supervisor.ts） | 待实现 |
| `UT-IPC-125` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L48 `if (msg?.type === "ready" \|\| msg?.fact?.kind …`（if；supervisor.ts） | 待实现 |
| `UT-IPC-126` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L48 `msg?.type === "ready" \|\| msg?.fact?.kind === …`（\|\|；supervisor.ts） | 待实现 |
| `UT-IPC-127` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L48 `msg?.type`（?.；supervisor.ts） | 待实现 |
| `UT-IPC-128` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L48 `msg?.fact?.kind`（?.；supervisor.ts） | 待实现 |
| `UT-IPC-129` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L48 `msg?.fact`（?.；supervisor.ts） | 待实现 |
| `UT-IPC-130` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L53 `if (!this.stopped)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-131` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 分支 L53 `!this.stopped`（!；supervisor.ts） | 待实现 |
| `UT-IPC-132` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 状态写 L38 → `this.child`（supervisor.ts） | 待实现 |
| `UT-IPC-133` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 状态写 L39 → `this.lastHeartbeat`（supervisor.ts） | 待实现 |
| `UT-IPC-134` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 状态写 L41 → `this.channel`（supervisor.ts） | 待实现 |
| `UT-IPC-135` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 状态写 L45 → `this.lastHeartbeat`（supervisor.ts） | 待实现 |
| `UT-IPC-136` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 状态写 L48 → `this.restartDelay`（supervisor.ts） | 待实现 |
| `UT-IPC-137` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 状态写 L51 → `this.child`（supervisor.ts） | 待实现 |
| `UT-IPC-138` | `spawn`（`supervisor.ts:27`） | `状态分支` × `合法迁移` | 状态写 L55 → `this.restartDelay`（supervisor.ts） | 待实现 |
| `UT-IPC-139` | `spawn`（`supervisor.ts:27`） | `资源获取/释放` × `获取失败路径` | 资源操作 L38 `fork`（supervisor.ts） | 待实现 |
| `UT-IPC-140` | `spawn`（`supervisor.ts:27`） | `资源获取/释放` × `获取失败路径` | 资源操作 L56 `setTimeout`（supervisor.ts） | 待实现 |
| `UT-IPC-141` | `spawn`（`supervisor.ts:27`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L28 值 `（无值 return：提前退出）` 逐值断言（supervisor.ts） | 待实现 |
| `UT-IPC-142` | `spawn`（`supervisor.ts:27`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L46 值 `（无值 return：提前退出）` 逐值断言（supervisor.ts） | 待实现 |
| `UT-IPC-143` | `startWatchdog`（`supervisor.ts:63`） | `状态分支` × `合法迁移` | 分支 L64 `if (this.watchdog)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-144` | `startWatchdog`（`supervisor.ts:63`） | `状态分支` × `合法迁移` | 分支 L66 `if (this.stopped \|\| !this.child)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-145` | `startWatchdog`（`supervisor.ts:63`） | `状态分支` × `合法迁移` | 分支 L66 `this.stopped \|\| !this.child`（\|\|；supervisor.ts） | 待实现 |
| `UT-IPC-146` | `startWatchdog`（`supervisor.ts:63`） | `状态分支` × `合法迁移` | 分支 L66 `!this.child`（!；supervisor.ts） | 待实现 |
| `UT-IPC-147` | `startWatchdog`（`supervisor.ts:63`） | `状态分支` × `合法迁移` | 分支 L67 `if (this.unhealthy())`（if；supervisor.ts） | 待实现 |
| `UT-IPC-148` | `startWatchdog`（`supervisor.ts:63`） | `状态分支` × `合法迁移` | 状态写 L65 → `this.watchdog`（supervisor.ts） | 待实现 |
| `UT-IPC-149` | `startWatchdog`（`supervisor.ts:63`） | `资源获取/释放` × `获取失败路径` | 资源操作 L65 `setInterval`（supervisor.ts） | 待实现 |
| `UT-IPC-150` | `startWatchdog`（`supervisor.ts:63`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L64 值 `（无值 return：提前退出）` 逐值断言（supervisor.ts） | 待实现 |
| `UT-IPC-151` | `startWatchdog`（`supervisor.ts:63`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L66 值 `（无值 return：提前退出）` 逐值断言（supervisor.ts） | 待实现 |
| `UT-IPC-152` | `send`（`supervisor.ts:75`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `cmd: Command` 的 `每等价类合法值` 类（supervisor.ts:75） | 待实现 |
| `UT-IPC-153` | `send`（`supervisor.ts:75`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `cmd: Command` 的 `边界(上/下/零/空/满)` 类（supervisor.ts:75） | 待实现 |
| `UT-IPC-154` | `send`（`supervisor.ts:75`） | `纯函数/无副作用` × `非法值` | 参数 `cmd: Command` 的 `非法值` 类（supervisor.ts:75） | 待实现 |
| `UT-IPC-155` | `send`（`supervisor.ts:75`） | `状态分支` × `合法迁移` | 分支 L76 `this.channel?.send`（?.；supervisor.ts） | 待实现 |
| `UT-IPC-156` | `kill`（`supervisor.ts:80`） | `状态分支` × `合法迁移` | 分支 L81 `if (this.child)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-157` | `kill`（`supervisor.ts:80`） | `状态分支` × `合法迁移` | 状态写 L83 → `this.child`（supervisor.ts） | 待实现 |
| `UT-IPC-158` | `unhealthy`（`supervisor.ts:88`） | `数值/长度上限参数` × `恰好通过` | 参数 `windowMs: inferred` 的 `恰好通过` 类（supervisor.ts:88） | 待实现 |
| `UT-IPC-159` | `unhealthy`（`supervisor.ts:88`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `windowMs: inferred` 的 `+1 拒绝` 类（supervisor.ts:88） | 待实现 |
| `UT-IPC-160` | `unhealthy`（`supervisor.ts:88`） | `数值/长度上限参数` × `−1 通过` | 参数 `windowMs: inferred` 的 `−1 通过` 类（supervisor.ts:88） | 待实现 |
| `UT-IPC-161` | `unhealthy`（`supervisor.ts:88`） | `数值/长度上限参数` × `未知枚举` | 可选参数 `windowMs` 缺省/显式两态（supervisor.ts:88） | 待实现 |
| `UT-IPC-162` | `unhealthy`（`supervisor.ts:88`） | `时间域行为` × `超时边界 ±1 tick` | 分支 L89 `this.child !== null && this.clock.now() - thi…`（&&；supervisor.ts） | 待实现 |
| `UT-IPC-163` | `unhealthy`（`supervisor.ts:88`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L89 值 `this.child !== null && this.clock.now()…` 逐值断言（supervisor.ts） | 待实现 |
| `UT-IPC-164` | `alive`（`supervisor.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L93 值 `this.child !== null` 逐值断言（supervisor.ts） | 待实现 |
| `UT-IPC-165` | `stop`（`supervisor.ts:96`） | `状态分支` × `合法迁移` | 分支 L98 `if (this.watchdog)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-166` | `stop`（`supervisor.ts:96`） | `状态分支` × `合法迁移` | 分支 L100 `if (!this.child)`（if；supervisor.ts） | 待实现 |
| `UT-IPC-167` | `stop`（`supervisor.ts:96`） | `状态分支` × `合法迁移` | 分支 L100 `!this.child`（!；supervisor.ts） | 待实现 |
| `UT-IPC-168` | `stop`（`supervisor.ts:96`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（supervisor.ts:96） | 待实现 |
| `UT-IPC-169` | `stop`（`supervisor.ts:96`） | `状态分支` × `合法迁移` | 状态写 L97 → `this.stopped`（supervisor.ts） | 待实现 |
| `UT-IPC-170` | `stop`（`supervisor.ts:96`） | `状态分支` × `合法迁移` | 状态写 L99 → `this.watchdog`（supervisor.ts） | 待实现 |
| `UT-IPC-171` | `stop`（`supervisor.ts:96`） | `资源获取/释放` × `正常释放` | 资源操作 L98 `clearInterval`（supervisor.ts） | 待实现 |
| `UT-IPC-172` | `stop`（`supervisor.ts:96`） | `资源获取/释放` × `获取失败路径` | 资源操作 L103 `setTimeout`（supervisor.ts） | 待实现 |
| `UT-IPC-173` | `stop`（`supervisor.ts:96`） | `资源获取/释放` × `正常释放` | 资源操作 L108 `clearTimeout`（supervisor.ts） | 待实现 |
| `UT-IPC-174` | `stop`（`supervisor.ts:96`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L100 值 `（无值 return：提前退出）` 逐值断言（supervisor.ts） | 待实现 |
| `UT-IPC-175` | `PikoError.constructor`（`types.ts:233`） | `字符串/路径/枚举输入` × `空` | 参数 `code: string` 的 `空` 类（types.ts:233） | 待实现 |
| `UT-IPC-176` | `PikoError.constructor`（`types.ts:233`） | `字符串/路径/枚举输入` × `超长` | 参数 `code: string` 的 `超长` 类（types.ts:233） | 待实现 |
| `UT-IPC-177` | `PikoError.constructor`（`types.ts:233`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `code: string` 的 `注入字符` 类（types.ts:233） | 待实现 |
| `UT-IPC-178` | `PikoError.constructor`（`types.ts:233`） | `数值/长度上限参数` × `恰好通过` | 参数 `status: number` 的 `恰好通过` 类（types.ts:233） | 待实现 |
| `UT-IPC-179` | `PikoError.constructor`（`types.ts:233`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `status: number` 的 `+1 拒绝` 类（types.ts:233） | 待实现 |
| `UT-IPC-180` | `PikoError.constructor`（`types.ts:233`） | `数值/长度上限参数` × `−1 通过` | 参数 `status: number` 的 `−1 通过` 类（types.ts:233） | 待实现 |
| `UT-IPC-181` | `PikoError.constructor`（`types.ts:233`） | `字符串/路径/枚举输入` × `空` | 参数 `message: string` 的 `空` 类（types.ts:233） | 待实现 |
| `UT-IPC-182` | `PikoError.constructor`（`types.ts:233`） | `字符串/路径/枚举输入` × `超长` | 参数 `message: string` 的 `超长` 类（types.ts:233） | 待实现 |
| `UT-IPC-183` | `PikoError.constructor`（`types.ts:233`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `message: string` 的 `注入字符` 类（types.ts:233） | 待实现 |
