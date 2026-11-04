# UT 分卷登记 · WORKER（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：367**（对象类型分布：字符串/路径/枚举输入 48；状态分支 142；错误路径 38；资源获取/释放 8；纯函数/无副作用 114；时间域行为 2；数值/长度上限参数 9；并发/可重入 5；持久化/序列化 1）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-WORKER-016` | `runExecutionProcess`（`exec-process.ts:17`） | `字符串/路径/枚举输入` × `空` | 参数 `configPath: string` 的 `空` 类（exec-process.ts:17） | 待实现 |
| `UT-WORKER-017` | `runExecutionProcess`（`exec-process.ts:17`） | `字符串/路径/枚举输入` × `超长` | 参数 `configPath: string` 的 `超长` 类（exec-process.ts:17） | 待实现 |
| `UT-WORKER-018` | `runExecutionProcess`（`exec-process.ts:17`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `configPath: string` 的 `注入字符` 类（exec-process.ts:17） | 待实现 |
| `UT-WORKER-019` | `runExecutionProcess`（`exec-process.ts:17`） | `字符串/路径/枚举输入` × `空` | 参数 `root: string` 的 `空` 类（exec-process.ts:17） | 待实现 |
| `UT-WORKER-020` | `runExecutionProcess`（`exec-process.ts:17`） | `字符串/路径/枚举输入` × `超长` | 参数 `root: string` 的 `超长` 类（exec-process.ts:17） | 待实现 |
| `UT-WORKER-021` | `runExecutionProcess`（`exec-process.ts:17`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `root: string` 的 `注入字符` 类（exec-process.ts:17） | 待实现 |
| `UT-WORKER-022` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L24 `if (config.identity?.memory)`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-023` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L24 `config.identity?.memory`（?.；exec-process.ts） | 待实现 |
| `UT-WORKER-024` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L30 `if (config.identity?.doc_search)`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-025` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L30 `config.identity?.doc_search`（?.；exec-process.ts） | 待实现 |
| `UT-WORKER-026` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L35 `if (config.matrix.enabled)`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-027` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L36 `if (config.matrix.direct_access_token)`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-028` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `每个非法迁移拒绝` | 分支 L38 `if (config.matrix.access_token_secret_r…`（else；exec-process.ts） | 待实现 |
| `UT-WORKER-029` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L38 `if (config.matrix.access_token_secret_ref)`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-030` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L47 `if (cmd.kind === "shutdown")`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-031` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L73 `if (msg?.ipc !== "command")`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-032` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L73 `msg?.ipc`（?.；exec-process.ts） | 待实现 |
| `UT-WORKER-033` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L74 `if (msg.command?.kind === "shutdown")`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-034` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L74 `msg.command?.kind`（?.；exec-process.ts） | 待实现 |
| `UT-WORKER-035` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L75 `if (msg.command?.kind === "abort" && typeof m…`（if；exec-process.ts） | 待实现 |
| `UT-WORKER-036` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L75 `msg.command?.kind === "abort" && typeof msg.c…`（&&；exec-process.ts） | 待实现 |
| `UT-WORKER-037` | `runExecutionProcess`（`exec-process.ts:17`） | `状态分支` × `合法迁移` | 分支 L75 `msg.command?.kind`（?.；exec-process.ts） | 待实现 |
| `UT-WORKER-038` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `loadConfig(configPath, root` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-039` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `resolveSecret(config.llmtier.api_key_secret_ref` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-040` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #3：被调方 `resolveSecret(config.identity.memory.api_key_secret_ref` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-041` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #4：被调方 `resolveSecret(config.identity.doc_search.api_key_secret_ref` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-042` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #5：被调方 `resolveSecret(config.matrix.access_token_secret_ref` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-043` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #6：被调方 `matrix.start(` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-044` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #7：被调方 `worker.close(` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-045` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #8：被调方 `matrix.close(` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-046` | `runExecutionProcess`（`exec-process.ts:17`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #9：被调方 `pi.close(` 拒绝必须 typed 化上抛（exec-process.ts:17） | 待实现 |
| `UT-WORKER-047` | `runExecutionProcess`（`exec-process.ts:17`） | `资源获取/释放` × `获取失败路径` | 资源操作 L57 `setInterval`（exec-process.ts） | 待实现 |
| `UT-WORKER-048` | `runExecutionProcess`（`exec-process.ts:17`） | `资源获取/释放` × `正常释放` | 资源操作 L61 `clearInterval`（exec-process.ts） | 待实现 |
| `UT-WORKER-049` | `runExecutionProcess`（`exec-process.ts:17`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L73 值 `（无值 return：提前退出）` 逐值断言（exec-process.ts） | 待实现 |
| `UT-WORKER-050` | `record`（`execution-facts.ts:53`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `fact: ExecutionFact` 的 `每等价类合法值` 类（execution-facts.ts:53） | 待实现 |
| `UT-WORKER-051` | `record`（`execution-facts.ts:53`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `fact: ExecutionFact` 的 `边界(上/下/零/空/满)` 类（execution-facts.ts:53） | 待实现 |
| `UT-WORKER-052` | `record`（`execution-facts.ts:53`） | `纯函数/无副作用` × `非法值` | 参数 `fact: ExecutionFact` 的 `非法值` 类（execution-facts.ts:53） | 待实现 |
| `UT-WORKER-053` | `list`（`execution-facts.ts:58`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L59 值 `[...this.facts]` 逐值断言（execution-facts.ts） | 待实现 |
| `UT-WORKER-054` | `last`（`execution-facts.ts:63`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L64 值 `this.facts[this.facts.length - 1]` 逐值断言（execution-facts.ts） | 待实现 |
| `UT-WORKER-055` | `clear`（`execution-facts.ts:67`） | `状态分支` × `合法迁移` | 状态写 L68 → `this.facts.length`（execution-facts.ts） | 待实现 |
| `UT-WORKER-056` | `statusFromErrorCode`（`execution-facts.ts:78`） | `字符串/路径/枚举输入` × `空` | 参数 `code: string \| undefined` 的 `空` 类（execution-facts.ts:78） | 待实现 |
| `UT-WORKER-057` | `statusFromErrorCode`（`execution-facts.ts:78`） | `字符串/路径/枚举输入` × `超长` | 参数 `code: string \| undefined` 的 `超长` 类（execution-facts.ts:78） | 待实现 |
| `UT-WORKER-058` | `statusFromErrorCode`（`execution-facts.ts:78`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `code: string \| undefined` 的 `注入字符` 类（execution-facts.ts:78） | 待实现 |
| `UT-WORKER-059` | `statusFromErrorCode`（`execution-facts.ts:78`） | `时间域行为` × `超时边界 ±1 tick` | 分支 L80 `case "timeout"`（case；execution-facts.ts） | 待实现 |
| `UT-WORKER-060` | `statusFromErrorCode`（`execution-facts.ts:78`） | `状态分支` × `合法迁移` | 分支 L82 `case "aborted"`（case；execution-facts.ts） | 待实现 |
| `UT-WORKER-061` | `statusFromErrorCode`（`execution-facts.ts:78`） | `状态分支` × `合法迁移` | 分支 L84 `case "spawn_error"`（case；execution-facts.ts） | 待实现 |
| `UT-WORKER-062` | `statusFromErrorCode`（`execution-facts.ts:78`） | `状态分支` × `合法迁移` | 分支 L85 `case "shell_unavailable"`（case；execution-facts.ts） | 待实现 |
| `UT-WORKER-063` | `statusFromErrorCode`（`execution-facts.ts:78`） | `状态分支` × `合法迁移` | 分支 L87 `default`（default；execution-facts.ts） | 待实现 |
| `UT-WORKER-064` | `statusFromErrorCode`（`execution-facts.ts:78`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L81 值 `"timeout"` 逐值断言（execution-facts.ts） | 待实现 |
| `UT-WORKER-065` | `statusFromErrorCode`（`execution-facts.ts:78`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L83 值 `"aborted"` 逐值断言（execution-facts.ts） | 待实现 |
| `UT-WORKER-066` | `statusFromErrorCode`（`execution-facts.ts:78`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L86 值 `"spawn_error"` 逐值断言（execution-facts.ts） | 待实现 |
| `UT-WORKER-067` | `statusFromErrorCode`（`execution-facts.ts:78`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L88 值 `"spawn_error"` 逐值断言（execution-facts.ts） | 待实现 |
| `UT-WORKER-068` | `buildRawResultRef`（`test-evidence.ts:42`） | `字符串/路径/枚举输入` × `空` | 参数 `input: { declaredOutputPaths: readonly string[]; outputs: readonly ` 的 `空` 类（test-evidence.ts:42） | 待实现 |
| `UT-WORKER-069` | `buildRawResultRef`（`test-evidence.ts:42`） | `字符串/路径/枚举输入` × `超长` | 参数 `input: { declaredOutputPaths: readonly string[]; outputs: readonly ` 的 `超长` 类（test-evidence.ts:42） | 待实现 |
| `UT-WORKER-070` | `buildRawResultRef`（`test-evidence.ts:42`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `input: { declaredOutputPaths: readonly string[]; outputs: readonly ` 的 `注入字符` 类（test-evidence.ts:42） | 待实现 |
| `UT-WORKER-071` | `buildRawResultRef`（`test-evidence.ts:42`） | `状态分支` × `合法迁移` | 分支 L47 `input.declaredOutputPaths.length > 0 && input…`（&&；test-evidence.ts） | 待实现 |
| `UT-WORKER-072` | `buildRawResultRef`（`test-evidence.ts:42`） | `状态分支` × `合法迁移` | 分支 L49 `fact.status !== "exited" \|\| (fact.exit_code !…`（\|\|；test-evidence.ts） | 待实现 |
| `UT-WORKER-073` | `buildRawResultRef`（`test-evidence.ts:42`） | `状态分支` × `合法迁移` | 分支 L49 `fact.exit_code !== null && fact.exit_code !==…`（&&；test-evidence.ts） | 待实现 |
| `UT-WORKER-074` | `buildRawResultRef`（`test-evidence.ts:42`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L51 值 `{ outputs: [...input.outputs], executio…` 逐值断言（test-evidence.ts） | 待实现 |
| `UT-WORKER-075` | `isExecutionFailure`（`test-evidence.ts:65`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `raw: RawResultRef` 的 `每等价类合法值` 类（test-evidence.ts:65） | 待实现 |
| `UT-WORKER-076` | `isExecutionFailure`（`test-evidence.ts:65`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `raw: RawResultRef` 的 `边界(上/下/零/空/满)` 类（test-evidence.ts:65） | 待实现 |
| `UT-WORKER-077` | `isExecutionFailure`（`test-evidence.ts:65`） | `纯函数/无副作用` × `非法值` | 参数 `raw: RawResultRef` 的 `非法值` 类（test-evidence.ts:65） | 待实现 |
| `UT-WORKER-078` | `isExecutionFailure`（`test-evidence.ts:65`） | `状态分支` × `合法迁移` | 分支 L66 `raw.report_missing \|\| raw.execution_failed`（\|\|；test-evidence.ts） | 待实现 |
| `UT-WORKER-079` | `isExecutionFailure`（`test-evidence.ts:65`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L66 值 `raw.report_missing \|\| raw.execution_fai…` 逐值断言（test-evidence.ts） | 待实现 |
| `UT-WORKER-080` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `env: ExecutionToolContext["env"]` 的 `每等价类合法值` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-081` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `env: ExecutionToolContext["env"]` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-082` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `非法值` | 参数 `env: ExecutionToolContext["env"]` 的 `非法值` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-083` | `fileState`（`tool-recovery.ts:31`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-084` | `fileState`（`tool-recovery.ts:31`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-085` | `fileState`（`tool-recovery.ts:31`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-086` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: Context` 的 `每等价类合法值` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-087` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-088` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `非法值` | 参数 `context: Context` 的 `非法值` 类（tool-recovery.ts:31） | 待实现 |
| `UT-WORKER-089` | `fileState`（`tool-recovery.ts:31`） | `状态分支` × `合法迁移` | 分支 L33 `if (!info.ok)`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-090` | `fileState`（`tool-recovery.ts:31`） | `状态分支` × `合法迁移` | 分支 L33 `!info.ok`（!；tool-recovery.ts） | 待实现 |
| `UT-WORKER-091` | `fileState`（`tool-recovery.ts:31`） | `状态分支` × `合法迁移` | 分支 L34 `if (info.error.code==="not_found")`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-092` | `fileState`（`tool-recovery.ts:31`） | `状态分支` × `合法迁移` | 分支 L37 `info.value.kind!=="file"&&info.value.kind!=="…`（&&；tool-recovery.ts） | 待实现 |
| `UT-WORKER-093` | `fileState`（`tool-recovery.ts:31`） | `状态分支` × `合法迁移` | 分支 L39 `!read.ok`（!；tool-recovery.ts） | 待实现 |
| `UT-WORKER-094` | `fileState`（`tool-recovery.ts:31`） | `错误路径` × `每个 typed 错误码` | throw L35 `reject`（守卫 `if (!info.ok)`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-095` | `fileState`（`tool-recovery.ts:31`） | `错误路径` × `每个 typed 错误码` | throw L37 `reject`（守卫 `if (info.value.kind!=="file"&&info.valu…`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-096` | `fileState`（`tool-recovery.ts:31`） | `错误路径` × `每个 typed 错误码` | throw L39 `reject`（守卫 `if (!read.ok)`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-097` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L34 值 `{fingerprint:"missing"}` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-098` | `fileState`（`tool-recovery.ts:31`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L40 值 `{fingerprint:digest(read.value),content…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-099` | `isPlan`（`tool-recovery.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `value: JsonValue\|undefined` 的 `每等价类合法值` 类（tool-recovery.ts:43） | 待实现 |
| `UT-WORKER-100` | `isPlan`（`tool-recovery.ts:43`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `value: JsonValue\|undefined` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:43） | 待实现 |
| `UT-WORKER-101` | `isPlan`（`tool-recovery.ts:43`） | `纯函数/无副作用` × `非法值` | 参数 `value: JsonValue\|undefined` 的 `非法值` 类（tool-recovery.ts:43） | 待实现 |
| `UT-WORKER-102` | `isPlan`（`tool-recovery.ts:43`） | `状态分支` × `合法迁移` | 分支 L44 `if (!value\|\|typeof value!=="object"\|\|Array.is…`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-103` | `isPlan`（`tool-recovery.ts:43`） | `状态分支` × `合法迁移` | 分支 L44 `!value\|\|typeof value!=="object"\|\|Array.isArra…`（\|\|；tool-recovery.ts） | 待实现 |
| `UT-WORKER-104` | `isPlan`（`tool-recovery.ts:43`） | `状态分支` × `合法迁移` | 分支 L44 `!value\|\|typeof value!=="object"`（\|\|；tool-recovery.ts） | 待实现 |
| `UT-WORKER-105` | `isPlan`（`tool-recovery.ts:43`） | `状态分支` × `合法迁移` | 分支 L44 `!value`（!；tool-recovery.ts） | 待实现 |
| `UT-WORKER-106` | `isPlan`（`tool-recovery.ts:43`） | `状态分支` × `合法迁移` | 分支 L46 `plan.version===1&&typeof plan.before==="strin…`（&&；tool-recovery.ts） | 待实现 |
| `UT-WORKER-107` | `isPlan`（`tool-recovery.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L44 值 `false` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-108` | `isPlan`（`tool-recovery.ts:43`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L46 值 `plan.version===1&&typeof plan.before===…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-109` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `base: AgentHarnessTool<ExecutionToolContext>` 的 `每等价类合法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-110` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `base: AgentHarnessTool<ExecutionToolContext>` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-111` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `base: AgentHarnessTool<ExecutionToolContext>` 的 `非法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-112` | `executeRecoverable`（`tool-recovery.ts:49`） | `字符串/路径/枚举输入` × `空` | 参数 `toolCallId: string` 的 `空` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-113` | `executeRecoverable`（`tool-recovery.ts:49`） | `字符串/路径/枚举输入` × `超长` | 参数 `toolCallId: string` 的 `超长` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-114` | `executeRecoverable`（`tool-recovery.ts:49`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `toolCallId: string` 的 `注入字符` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-115` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `params: any` 的 `每等价类合法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-116` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `params: any` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-117` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `params: any` 的 `非法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-118` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `onUpdate: any` 的 `每等价类合法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-119` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `onUpdate: any` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-120` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `onUpdate: any` 的 `非法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-121` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `toolContext: ExecutionToolContext` 的 `每等价类合法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-122` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `toolContext: ExecutionToolContext` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-123` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `toolContext: ExecutionToolContext` 的 `非法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-124` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `invocation: AgentHarnessToolInvocation` 的 `每等价类合法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-125` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `invocation: AgentHarnessToolInvocation` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-126` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `invocation: AgentHarnessToolInvocation` 的 `非法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-127` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `context: Context` 的 `每等价类合法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-128` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-129` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `非法值` | 参数 `context: Context` 的 `非法值` 类（tool-recovery.ts:49） | 待实现 |
| `UT-WORKER-130` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L60 `planValue!==undefined&&!isPlan(planValue)`（&&；tool-recovery.ts） | 待实现 |
| `UT-WORKER-131` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L60 `!isPlan(planValue)`（!；tool-recovery.ts） | 待实现 |
| `UT-WORKER-132` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L62 `if (!plan)`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-133` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `每个非法迁移拒绝` | 分支 L83 `{ const current=await fileState(toolCon…`（else；tool-recovery.ts） | 待实现 |
| `UT-WORKER-134` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L62 `!plan`（!；tool-recovery.ts） | 待实现 |
| `UT-WORKER-135` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L66 `if (base.name==="write")`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-136` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `每个非法迁移拒绝` | 分支 L69 `if(base.name==="edit"){ if(!Array.isArr…`（else；tool-recovery.ts） | 待实现 |
| `UT-WORKER-137` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L69 `if (base.name==="edit")`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-138` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `每个非法迁移拒绝` | 分支 L80 `throw new Error(`Recovery contract is n…`（else；tool-recovery.ts） | 待实现 |
| `UT-WORKER-139` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L70 `!Array.isArray(params.edits)\|\|params.edits.le…`（\|\|；tool-recovery.ts） | 待实现 |
| `UT-WORKER-140` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L70 `!Array.isArray(params.edits)`（!；tool-recovery.ts） | 待实现 |
| `UT-WORKER-141` | `executeRecoverable`（`tool-recovery.ts:49`） | `状态分支` × `合法迁移` | 分支 L85 `if (current.fingerprint===plan.after)`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-142` | `executeRecoverable`（`tool-recovery.ts:49`） | `错误路径` × `每个 typed 错误码` | throw L60 `reject`（守卫 `if (planValue!==undefined&&!isPlan(plan…`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-143` | `executeRecoverable`（`tool-recovery.ts:49`） | `错误路径` × `每个 typed 错误码` | throw L70 `Edit tool input is invalid. edits must contain at least one replacement.`（守卫 `if (!Array.isArray(params.edits)\|\|param…`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-144` | `executeRecoverable`（`tool-recovery.ts:49`） | `错误路径` × `每个 typed 错误码` | throw L71 `reject`（守卫 `if (before.content===undefined)`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-145` | `executeRecoverable`（`tool-recovery.ts:49`） | `错误路径` × `每个 typed 错误码` | throw L80 `reject`（守卫 `if (base.name==="edit")`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-146` | `executeRecoverable`（`tool-recovery.ts:49`） | `错误路径` × `每个 typed 错误码` | throw L86 `reject`（守卫 `if (current.fingerprint!==plan.before)`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-147` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L85 值 `plan.result as any` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-148` | `executeRecoverable`（`tool-recovery.ts:49`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L88 值 `base.execute(toolCallId,params,onUpdate…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-149` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `base: AgentHarnessTool<ExecutionToolContext>` 的 `每等价类合法值` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-150` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `base: AgentHarnessTool<ExecutionToolContext>` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-151` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `非法值` | 参数 `base: AgentHarnessTool<ExecutionToolContext>` 的 `非法值` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-152` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `policy: ToolPolicy` 的 `每等价类合法值` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-153` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `policy: ToolPolicy` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-154` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `非法值` | 参数 `policy: ToolPolicy` 的 `非法值` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-155` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `registry: ToolRegistry` 的 `每等价类合法值` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-156` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `registry: ToolRegistry` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-157` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `非法值` | 参数 `registry: ToolRegistry` 的 `非法值` 类（tool-recovery.ts:91） | 待实现 |
| `UT-WORKER-158` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L101 `policy.permissions?.network_hosts ?? []`（??；tool-recovery.ts） | 待实现 |
| `UT-WORKER-159` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L101 `policy.permissions?.network_hosts`（?.；tool-recovery.ts） | 待实现 |
| `UT-WORKER-160` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L103 `if (allowlist.length === 0)`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-161` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L121 `policy.permissions?.executables ?? []`（??；tool-recovery.ts） | 待实现 |
| `UT-WORKER-162` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L121 `policy.permissions?.executables`（?.；tool-recovery.ts） | 待实现 |
| `UT-WORKER-163` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L123 `if (execAllowlist.length === 0)`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-164` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L126 `if (typeof params?.command === "string")`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-165` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L126 `params?.command`（?.；tool-recovery.ts） | 待实现 |
| `UT-WORKER-166` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L134 `if (policy.replay==="never")`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-167` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L135 `if (policy.effect==="read_only")`（if；tool-recovery.ts） | 待实现 |
| `UT-WORKER-168` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L136 `policy.recovery_contract_ref&&registry.recove…`（&&；tool-recovery.ts） | 待实现 |
| `UT-WORKER-169` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L137 `!contract\|\|contract.implementation_ref!=="bui…`（\|\|；tool-recovery.ts） | 待实现 |
| `UT-WORKER-170` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L137 `!contract`（!；tool-recovery.ts） | 待实现 |
| `UT-WORKER-171` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `状态分支` × `合法迁移` | 分支 L138 `base.name!=="write"&&base.name!=="edit"`（&&；tool-recovery.ts） | 待实现 |
| `UT-WORKER-172` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L137 `reject`（守卫 `if (!contract\|\|contract.implementation_…`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-173` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L138 `reject`（守卫 `if (base.name!=="write"&&base.name!=="e…`；tool-recovery.ts） | 待实现 |
| `UT-WORKER-174` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L103 值 `fn` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-175` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L104 值 `(async (...args: Parameters<F>) => { en…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-176` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L107 值 `await fn(...args)` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-177` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L123 值 `fn` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-178` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L124 值 `(async (...args: Parameters<F>) => { co…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-179` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L129 值 `await fn(...args)` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-180` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L134 值 `{...base,replay:"never",execute:guard(b…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-181` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L135 值 `{...base,replay:"safe",execute:guard(ba…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-182` | `applyToolRecoveryPolicy`（`tool-recovery.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L139 值 `{...base,replay:"safe",execute:guard((i…` 逐值断言（tool-recovery.ts） | 待实现 |
| `UT-WORKER-183` | `reportPreconditionFailure`（`worker.ts:125`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（worker.ts:125） | 待实现 |
| `UT-WORKER-184` | `reportPreconditionFailure`（`worker.ts:125`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（worker.ts:125） | 待实现 |
| `UT-WORKER-185` | `reportPreconditionFailure`（`worker.ts:125`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（worker.ts:125） | 待实现 |
| `UT-WORKER-186` | `reportPreconditionFailure`（`worker.ts:125`） | `字符串/路径/枚举输入` × `空` | 参数 `failure: { code: any; cause_class: any; message: string }` 的 `空` 类（worker.ts:125） | 待实现 |
| `UT-WORKER-187` | `reportPreconditionFailure`（`worker.ts:125`） | `字符串/路径/枚举输入` × `超长` | 参数 `failure: { code: any; cause_class: any; message: string }` 的 `超长` 类（worker.ts:125） | 待实现 |
| `UT-WORKER-188` | `reportPreconditionFailure`（`worker.ts:125`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `failure: { code: any; cause_class: any; message: string }` 的 `注入字符` 类（worker.ts:125） | 待实现 |
| `UT-WORKER-189` | `reportPreconditionFailure`（`worker.ts:125`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.report({ kind: "preconditionFailure", result }` 拒绝必须 typed 化上抛（worker.ts:125） | 待实现 |
| `UT-WORKER-190` | `run`（`worker.ts:143`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（worker.ts:143） | 待实现 |
| `UT-WORKER-191` | `run`（`worker.ts:143`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（worker.ts:143） | 待实现 |
| `UT-WORKER-192` | `run`（`worker.ts:143`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（worker.ts:143） | 待实现 |
| `UT-WORKER-193` | `run`（`worker.ts:143`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（worker.ts:143） | 待实现 |
| `UT-WORKER-194` | `run`（`worker.ts:143`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（worker.ts:143） | 待实现 |
| `UT-WORKER-195` | `run`（`worker.ts:143`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（worker.ts:143） | 待实现 |
| `UT-WORKER-196` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L154 `this.isAborted(taskId) \|\| accessLost()`（\|\|；worker.ts） | 待实现 |
| `UT-WORKER-197` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L154 `? task.discussion :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-198` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L166 `if (task.artifact_target)`（if；worker.ts） | 待实现 |
| `UT-WORKER-199` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L172 `outcome.executions ?? []`（??；worker.ts） | 待实现 |
| `UT-WORKER-200` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L179 `? outcome.status === "completed" :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-201` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L179 `? lost :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-202` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L179 `? outcome.status === "cancelled" :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-203` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L180 `? state === "Completed" :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-204` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L180 `? lost :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-205` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L180 `outcome.failure ?? { code: "InternalError" as…`（??；worker.ts） | 待实现 |
| `UT-WORKER-206` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L181 `if (state === "Failed" && failure && failure.…`（if；worker.ts） | 待实现 |
| `UT-WORKER-207` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L181 `state === "Failed" && failure && failure.code…`（&&；worker.ts） | 待实现 |
| `UT-WORKER-208` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L181 `state === "Failed" && failure`（&&；worker.ts） | 待实现 |
| `UT-WORKER-209` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L188 `if (state === "Completed" && raw.report_missi…`（if；worker.ts） | 待实现 |
| `UT-WORKER-210` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L188 `state === "Completed" && raw.report_missing`（&&；worker.ts） | 待实现 |
| `UT-WORKER-211` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L201 `if (state === "Completed" && raw.execution_fa…`（if；worker.ts） | 待实现 |
| `UT-WORKER-212` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L201 `state === "Completed" && raw.execution_failed`（&&；worker.ts） | 待实现 |
| `UT-WORKER-213` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L202 `f.status !== "exited" \|\| (f.exit_code !== nul…`（\|\|；worker.ts） | 待实现 |
| `UT-WORKER-214` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L202 `f.exit_code !== null && f.exit_code !== 0`（&&；worker.ts） | 待实现 |
| `UT-WORKER-215` | `run`（`worker.ts:143`） | `时间域行为` × `超时边界 ±1 tick` | 分支 L207 `bad?.command ?? "unknown command"`（??；worker.ts） | 待实现 |
| `UT-WORKER-216` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L207 `bad?.command`（?.；worker.ts） | 待实现 |
| `UT-WORKER-217` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L208 `? bad && bad.exit_code !== null :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-218` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L208 `bad && bad.exit_code !== null`（&&；worker.ts） | 待实现 |
| `UT-WORKER-219` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L209 `? bad && bad.status !== "exited" :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-220` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L209 `bad && bad.status !== "exited"`（&&；worker.ts） | 待实现 |
| `UT-WORKER-221` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L216 `state !== "Completed" && outputs.length > 0`（&&；worker.ts） | 待实现 |
| `UT-WORKER-222` | `run`（`worker.ts:143`） | `错误路径` × `每个 typed 错误码` | 分支 L228 `catch (error)`（catch；worker.ts） | 待实现 |
| `UT-WORKER-223` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L234 `if (cancelled)`（if；worker.ts） | 待实现 |
| `UT-WORKER-224` | `run`（`worker.ts:143`） | `状态分支` × `每个非法迁移拒绝` | 分支 L237 `if (accessLost()) { code = "DiscussionA…`（else；worker.ts） | 待实现 |
| `UT-WORKER-225` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L237 `if (accessLost())`（if；worker.ts） | 待实现 |
| `UT-WORKER-226` | `run`（`worker.ts:143`） | `状态分支` × `每个非法迁移拒绝` | 分支 L240 `if (error instanceof PikoError) { code …`（else；worker.ts） | 待实现 |
| `UT-WORKER-227` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L240 `if (error instanceof PikoError)`（if；worker.ts） | 待实现 |
| `UT-WORKER-228` | `run`（`worker.ts:143`） | `状态分支` × `每个非法迁移拒绝` | 分支 L243 `if (typeof e.pikoCode === "string") { c…`（else；worker.ts） | 待实现 |
| `UT-WORKER-229` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L243 `if (typeof e.pikoCode === "string")`（if；worker.ts） | 待实现 |
| `UT-WORKER-230` | `run`（`worker.ts:143`） | `状态分支` × `每个非法迁移拒绝` | 分支 L246 `if (isProviderUnavailableMessage(String…`（else；worker.ts） | 待实现 |
| `UT-WORKER-231` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L245 `? typeof e.cause === "string" :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-232` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L246 `if (isProviderUnavailableMessage(String(e.mes…`（if；worker.ts） | 待实现 |
| `UT-WORKER-233` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L246 `e.message ?? ""`（??；worker.ts） | 待实现 |
| `UT-WORKER-234` | `run`（`worker.ts:143`） | `错误路径` × `每个 typed 错误码` | 分支 L253 `catch ()`（catch；worker.ts） | 待实现 |
| `UT-WORKER-235` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L261 `? cancelled :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-236` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L263 `e.message ?? String(e)`（??；worker.ts） | 待实现 |
| `UT-WORKER-237` | `run`（`worker.ts:143`） | `状态分支` × `合法迁移` | 分支 L268 `e.message ?? String(e)`（??；worker.ts） | 待实现 |
| `UT-WORKER-238` | `run`（`worker.ts:143`） | `错误路径` × `每个 typed 错误码` | 分支 L274 `catch (finalize)`（catch；worker.ts） | 待实现 |
| `UT-WORKER-239` | `run`（`worker.ts:143`） | `并发/可重入` × `并发对偶/交错` | 分支 L278 `if (timer)`（if；worker.ts） | 待实现 |
| `UT-WORKER-240` | `run`（`worker.ts:143`） | `错误路径` × `每个 typed 错误码` | throw L152 `reject`（守卫 `if (accessLost())`；worker.ts） | 待实现 |
| `UT-WORKER-241` | `run`（`worker.ts:143`） | `资源获取/释放` × `获取失败路径` | 资源操作 L151 `setInterval`（worker.ts） | 待实现 |
| `UT-WORKER-242` | `run`（`worker.ts:143`） | `资源获取/释放` × `正常释放` | 资源操作 L278 `clearInterval`（worker.ts） | 待实现 |
| `UT-WORKER-243` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-244` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-245` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-246` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStoreReader` 的 `每等价类合法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-247` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStoreReader` 的 `边界(上/下/零/空/满)` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-248` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStoreReader` 的 `非法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-249` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `pi: PiRuntime` 的 `每等价类合法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-250` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `pi: PiRuntime` 的 `边界(上/下/零/空/满)` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-251` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `非法值` | 参数 `pi: PiRuntime` 的 `非法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-252` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `matrix: MatrixRuntime` 的 `每等价类合法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-253` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `matrix: MatrixRuntime` 的 `边界(上/下/零/空/满)` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-254` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `非法值` | 参数 `matrix: MatrixRuntime` 的 `非法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-255` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `transfer: Transfer` 的 `每等价类合法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-256` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `transfer: Transfer` 的 `边界(上/下/零/空/满)` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-257` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `非法值` | 参数 `transfer: Transfer` 的 `非法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-258` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `channel: Channel` 的 `每等价类合法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-259` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `channel: Channel` 的 `边界(上/下/零/空/满)` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-260` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `非法值` | 参数 `channel: Channel` 的 `非法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-261` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `clock: Clock` 的 `每等价类合法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-262` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `clock: Clock` 的 `边界(上/下/零/空/满)` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-263` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `非法值` | 参数 `clock: Clock` 的 `非法值` 类（worker.ts:28） | 待实现 |
| `UT-WORKER-264` | `RunWorker.constructor`（`worker.ts:28`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `clock` 缺省/显式两态（worker.ts:28） | 待实现 |
| `UT-WORKER-265` | `close`（`worker.ts:282`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.loopPromise` 拒绝必须 typed 化上抛（worker.ts:282） | 待实现 |
| `UT-WORKER-266` | `close`（`worker.ts:282`） | `状态分支` × `合法迁移` | 状态写 L283 → `this.stopped`（worker.ts） | 待实现 |
| `UT-WORKER-267` | `buildStats`（`worker.ts:288`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `view: ReturnType<TaskStore["getRun"]>` 的 `每等价类合法值` 类（worker.ts:288） | 待实现 |
| `UT-WORKER-268` | `buildStats`（`worker.ts:288`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `view: ReturnType<TaskStore["getRun"]>` 的 `边界(上/下/零/空/满)` 类（worker.ts:288） | 待实现 |
| `UT-WORKER-269` | `buildStats`（`worker.ts:288`） | `纯函数/无副作用` × `非法值` | 参数 `view: ReturnType<TaskStore["getRun"]>` 的 `非法值` 类（worker.ts:288） | 待实现 |
| `UT-WORKER-270` | `buildStats`（`worker.ts:288`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `outputs: AgentResult["outputs"]` 的 `每等价类合法值` 类（worker.ts:288） | 待实现 |
| `UT-WORKER-271` | `buildStats`（`worker.ts:288`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `outputs: AgentResult["outputs"]` 的 `边界(上/下/零/空/满)` 类（worker.ts:288） | 待实现 |
| `UT-WORKER-272` | `buildStats`（`worker.ts:288`） | `纯函数/无副作用` × `非法值` | 参数 `outputs: AgentResult["outputs"]` 的 `非法值` 类（worker.ts:288） | 待实现 |
| `UT-WORKER-273` | `buildStats`（`worker.ts:288`） | `状态分支` × `合法迁移` | 分支 L292 `? view.started_at && view.finished_at :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-274` | `buildStats`（`worker.ts:288`） | `状态分支` × `合法迁移` | 分支 L292 `view.started_at && view.finished_at`（&&；worker.ts） | 待实现 |
| `UT-WORKER-275` | `buildStats`（`worker.ts:288`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L289 值 `{ model_calls: view.progress.model_call…` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-276` | `aggregateUsage`（`worker.ts:299`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `rows: any[]` 的 `每等价类合法值` 类（worker.ts:299） | 待实现 |
| `UT-WORKER-277` | `aggregateUsage`（`worker.ts:299`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `rows: any[]` 的 `边界(上/下/零/空/满)` 类（worker.ts:299） | 待实现 |
| `UT-WORKER-278` | `aggregateUsage`（`worker.ts:299`） | `纯函数/无副作用` × `非法值` | 参数 `rows: any[]` 的 `非法值` 类（worker.ts:299） | 待实现 |
| `UT-WORKER-279` | `aggregateUsage`（`worker.ts:299`） | `数值/长度上限参数` × `恰好通过` | 参数 `attempts: number` 的 `恰好通过` 类（worker.ts:299） | 待实现 |
| `UT-WORKER-280` | `aggregateUsage`（`worker.ts:299`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `attempts: number` 的 `+1 拒绝` 类（worker.ts:299） | 待实现 |
| `UT-WORKER-281` | `aggregateUsage`（`worker.ts:299`） | `数值/长度上限参数` × `−1 通过` | 参数 `attempts: number` 的 `−1 通过` 类（worker.ts:299） | 待实现 |
| `UT-WORKER-282` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L300 `if (attempts === 0)`（if；worker.ts） | 待实现 |
| `UT-WORKER-283` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L306 `loop (fields)`（loop；worker.ts） | 待实现 |
| `UT-WORKER-284` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L308 `if (rows.length !== attempts \|\| rows.some((r)…`（if；worker.ts） | 待实现 |
| `UT-WORKER-285` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `每个非法迁移拒绝` | 分支 L311 `sums[field] = rows.reduce((n, r) => n +…`（else；worker.ts） | 待实现 |
| `UT-WORKER-286` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L308 `rows.length !== attempts \|\| rows.some((r) => …`（\|\|；worker.ts） | 待实现 |
| `UT-WORKER-287` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L314 `? missing.length === fields.length :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-288` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L314 `? missing.length === 0 && observed === attemp…`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-289` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L314 `missing.length === 0 && observed === attempts`（&&；worker.ts） | 待实现 |
| `UT-WORKER-290` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L315 `if (quality === "Unknown")`（if；worker.ts） | 待实现 |
| `UT-WORKER-291` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L315 `loop (fields)`（loop；worker.ts） | 待实现 |
| `UT-WORKER-292` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L315 `if (!missing.includes(f))`（if；worker.ts） | 待实现 |
| `UT-WORKER-293` | `aggregateUsage`（`worker.ts:299`） | `状态分支` × `合法迁移` | 分支 L315 `!missing.includes(f)`（!；worker.ts） | 待实现 |
| `UT-WORKER-294` | `aggregateUsage`（`worker.ts:299`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L301 值 `{ source: "PiModelResponses", quality: …` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-295` | `aggregateUsage`（`worker.ts:299`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L316 值 `{ source: "PiModelResponses", quality, …` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-296` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `matrix: MatrixRuntime` 的 `每等价类合法值` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-297` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `matrix: MatrixRuntime` 的 `边界(上/下/零/空/满)` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-298` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `纯函数/无副作用` × `非法值` | 参数 `matrix: MatrixRuntime` 的 `非法值` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-299` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-300` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-301` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-302` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `空` | 参数 `roomId: string` 的 `空` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-303` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `超长` | 参数 `roomId: string` 的 `超长` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-304` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `roomId: string` 的 `注入字符` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-305` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `空` | 参数 `eventId: string` 的 `空` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-306` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `超长` | 参数 `eventId: string` 的 `超长` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-307` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `eventId: string` 的 `注入字符` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-308` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `数值/长度上限参数` × `恰好通过` | 参数 `turn: number` 的 `恰好通过` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-309` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `turn: number` 的 `+1 拒绝` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-310` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `数值/长度上限参数` × `−1 通过` | 参数 `turn: number` 的 `−1 通过` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-311` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `空` | 参数 `body: string` 的 `空` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-312` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `超长` | 参数 `body: string` 的 `超长` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-313` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `body: string` 的 `注入字符` 类（worker.ts:320） | 待实现 |
| `UT-WORKER-314` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L322 `loop ()`（loop；worker.ts） | 待实现 |
| `UT-WORKER-315` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L327 `if (!(await matrix.isJoined(roomId)))`（if；worker.ts） | 待实现 |
| `UT-WORKER-316` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L327 `!(await matrix.isJoined(roomId))`（!；worker.ts） | 待实现 |
| `UT-WORKER-317` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `错误路径` × `每个 typed 错误码` | 分支 L335 `catch (error)`（catch；worker.ts） | 待实现 |
| `UT-WORKER-318` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L337 `if (/M_FORBIDDEN\|not in room\|not joined/i.tes…`（if；worker.ts） | 待实现 |
| `UT-WORKER-319` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L337 `(error as Error)?.message ?? error`（??；worker.ts） | 待实现 |
| `UT-WORKER-320` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L337 `(error as Error)?.message`（?.；worker.ts） | 待实现 |
| `UT-WORKER-321` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L345 `if (isPermanentMatrixError(error))`（if；worker.ts） | 待实现 |
| `UT-WORKER-322` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L346 `if (error instanceof Error)`（if；worker.ts） | 待实现 |
| `UT-WORKER-323` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L347 `error.name === "ConnectionError" \|\| /Connecti…`（\|\|；worker.ts） | 待实现 |
| `UT-WORKER-324` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L347 `error.message ?? ""`（??；worker.ts） | 待实现 |
| `UT-WORKER-325` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L348 `if (!transient)`（if；worker.ts） | 待实现 |
| `UT-WORKER-326` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L348 `!transient`（!；worker.ts） | 待实现 |
| `UT-WORKER-327` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `状态分支` × `合法迁移` | 分支 L350 `if (attempt < DISCUSSION_RETRY_DELAYS_MS.leng…`（if；worker.ts） | 待实现 |
| `UT-WORKER-328` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `错误路径` × `每个 typed 错误码` | throw L331 `reject`（守卫 `if (!(await matrix.isJoined(roomId)))`；worker.ts） | 待实现 |
| `UT-WORKER-329` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `错误路径` × `每个 typed 错误码` | throw L353 `reject`（守卫 `unconditional`；worker.ts） | 待实现 |
| `UT-WORKER-330` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `资源获取/释放` × `获取失败路径` | 资源操作 L350 `setTimeout`（worker.ts） | 待实现 |
| `UT-WORKER-331` | `sendDiscussionReplyWithRetry`（`worker.ts:320`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L334 值 `（无值 return：提前退出）` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-332` | `report`（`worker.ts:39`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `fact: Fact` 的 `每等价类合法值` 类（worker.ts:39） | 待实现 |
| `UT-WORKER-333` | `report`（`worker.ts:39`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `fact: Fact` 的 `边界(上/下/零/空/满)` 类（worker.ts:39） | 待实现 |
| `UT-WORKER-334` | `report`（`worker.ts:39`） | `纯函数/无副作用` × `非法值` | 参数 `fact: Fact` 的 `非法值` 类（worker.ts:39） | 待实现 |
| `UT-WORKER-335` | `report`（`worker.ts:39`） | `状态分支` × `合法迁移` | 分支 L41 `!outcome.ok`（!；worker.ts） | 待实现 |
| `UT-WORKER-336` | `report`（`worker.ts:39`） | `错误路径` × `每个 typed 错误码` | throw L41 `InternalError`（守卫 `if (!outcome.ok)`；worker.ts） | 待实现 |
| `UT-WORKER-337` | `report`（`worker.ts:39`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L42 值 `outcome.value` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-338` | `requestAbort`（`worker.ts:47`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（worker.ts:47） | 待实现 |
| `UT-WORKER-339` | `requestAbort`（`worker.ts:47`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（worker.ts:47） | 待实现 |
| `UT-WORKER-340` | `requestAbort`（`worker.ts:47`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（worker.ts:47） | 待实现 |
| `UT-WORKER-341` | `isAborted`（`worker.ts:50`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（worker.ts:50） | 待实现 |
| `UT-WORKER-342` | `isAborted`（`worker.ts:50`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（worker.ts:50） | 待实现 |
| `UT-WORKER-343` | `isAborted`（`worker.ts:50`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（worker.ts:50） | 待实现 |
| `UT-WORKER-344` | `isAborted`（`worker.ts:50`） | `状态分支` × `合法迁移` | 分支 L51 `this.aborted.has(taskId) \|\| this.store.cancel…`（\|\|；worker.ts） | 待实现 |
| `UT-WORKER-345` | `isAborted`（`worker.ts:50`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L51 值 `this.aborted.has(taskId) \|\| this.store.…` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-346` | `start`（`worker.ts:54`） | `状态分支` × `合法迁移` | 状态写 L55 → `this.loopPromise`（worker.ts） | 待实现 |
| `UT-WORKER-347` | `loop`（`worker.ts:58`） | `状态分支` × `合法迁移` | 分支 L61 `loop (!this.stopped)`（loop；worker.ts） | 待实现 |
| `UT-WORKER-348` | `loop`（`worker.ts:58`） | `状态分支` × `合法迁移` | 分支 L61 `!this.stopped`（!；worker.ts） | 待实现 |
| `UT-WORKER-349` | `loop`（`worker.ts:58`） | `并发/可重入` × `并发对偶/交错` | 分支 L63 `if (!claim)`（if；worker.ts） | 待实现 |
| `UT-WORKER-350` | `loop`（`worker.ts:58`） | `并发/可重入` × `并发对偶/交错` | 分支 L63 `!claim`（!；worker.ts） | 待实现 |
| `UT-WORKER-351` | `loop`（`worker.ts:58`） | `并发/可重入` × `并发对偶/交错` | 分支 L67 `if (claim.kind === "staging")`（if；worker.ts） | 待实现 |
| `UT-WORKER-352` | `loop`（`worker.ts:58`） | `并发/可重入` × `并发对偶/交错` | 分支 L68 `await this.run(claim.task_id, claim.lea…`（else；worker.ts） | 待实现 |
| `UT-WORKER-353` | `loop`（`worker.ts:58`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.claimNext(` 拒绝必须 typed 化上抛（worker.ts:58） | 待实现 |
| `UT-WORKER-354` | `loop`（`worker.ts:58`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `new Promise((r` 拒绝必须 typed 化上抛（worker.ts:58） | 待实现 |
| `UT-WORKER-355` | `loop`（`worker.ts:58`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #3：被调方 `this.stageInputs(claim.task_id` 拒绝必须 typed 化上抛（worker.ts:58） | 待实现 |
| `UT-WORKER-356` | `loop`（`worker.ts:58`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #4：被调方 `this.run(claim.task_id, claim.lease_epoch` 拒绝必须 typed 化上抛（worker.ts:58） | 待实现 |
| `UT-WORKER-357` | `loop`（`worker.ts:58`） | `持久化/序列化` × `round-trip` | 状态写 L68 → `db`（worker.ts） | 待实现 |
| `UT-WORKER-358` | `loop`（`worker.ts:58`） | `资源获取/释放` × `获取失败路径` | 资源操作 L64 `setTimeout`（worker.ts） | 待实现 |
| `UT-WORKER-359` | `claimNext`（`worker.ts:78`） | `状态分支` × `合法迁移` | 分支 L81 `if (staging)`（if；worker.ts） | 待实现 |
| `UT-WORKER-360` | `claimNext`（`worker.ts:78`） | `状态分支` × `合法迁移` | 分支 L83 `if (!grant)`（if；worker.ts） | 待实现 |
| `UT-WORKER-361` | `claimNext`（`worker.ts:78`） | `状态分支` × `合法迁移` | 分支 L83 `!grant`（!；worker.ts） | 待实现 |
| `UT-WORKER-362` | `claimNext`（`worker.ts:78`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.channel.report({ kind: "stagingClaim" }` 拒绝必须 typed 化上抛（worker.ts:78） | 待实现 |
| `UT-WORKER-363` | `claimNext`（`worker.ts:78`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L81 值 `{ kind: "staging", task_id: staging.tas…` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-364` | `claimNext`（`worker.ts:78`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L83 值 `null` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-365` | `claimNext`（`worker.ts:78`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L84 值 `{ kind: "run", task_id: grant.task_id, …` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-366` | `stageInputs`（`worker.ts:87`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（worker.ts:87） | 待实现 |
| `UT-WORKER-367` | `stageInputs`（`worker.ts:87`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（worker.ts:87） | 待实现 |
| `UT-WORKER-368` | `stageInputs`（`worker.ts:87`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（worker.ts:87） | 待实现 |
| `UT-WORKER-369` | `stageInputs`（`worker.ts:87`） | `状态分支` × `合法迁移` | 分支 L89 `task.input_refs ?? []`（??；worker.ts） | 待实现 |
| `UT-WORKER-370` | `stageInputs`（`worker.ts:87`） | `状态分支` × `合法迁移` | 分支 L93 `if (this.isAborted(taskId))`（if；worker.ts） | 待实现 |
| `UT-WORKER-371` | `stageInputs`（`worker.ts:87`） | `状态分支` × `合法迁移` | 分支 L98 `? refs.length :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-372` | `stageInputs`（`worker.ts:87`） | `错误路径` × `每个 typed 错误码` | 分支 L101 `catch (error)`（catch；worker.ts） | 待实现 |
| `UT-WORKER-373` | `stageInputs`（`worker.ts:87`） | `状态分支` × `合法迁移` | 分支 L106 `? error instanceof Error :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-374` | `stageInputs`（`worker.ts:87`） | `状态分支` × `合法迁移` | 分支 L110 `if (staging.state === "failed")`（if；worker.ts） | 待实现 |
| `UT-WORKER-375` | `stageInputs`（`worker.ts:87`） | `状态分支` × `合法迁移` | 分支 L119 `? staging.state === "none" :`（ternary；worker.ts） | 待实现 |
| `UT-WORKER-376` | `stageInputs`（`worker.ts:87`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.transfer.fetchInputs(taskId, refs, controller.signal` 拒绝必须 typed 化上抛（worker.ts:87） | 待实现 |
| `UT-WORKER-377` | `stageInputs`（`worker.ts:87`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `this.reportPreconditionFailure(taskId, {` 拒绝必须 typed 化上抛（worker.ts:87） | 待实现 |
| `UT-WORKER-378` | `stageInputs`（`worker.ts:87`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #3：被调方 `this.reportPreconditionFailure(taskId, {` 拒绝必须 typed 化上抛（worker.ts:87） | 待实现 |
| `UT-WORKER-379` | `stageInputs`（`worker.ts:87`） | `资源获取/释放` × `获取失败路径` | 资源操作 L92 `setInterval`（worker.ts） | 待实现 |
| `UT-WORKER-380` | `stageInputs`（`worker.ts:87`） | `资源获取/释放` × `正常释放` | 资源操作 L121 `clearInterval`（worker.ts） | 待实现 |
| `UT-WORKER-381` | `stageInputs`（`worker.ts:87`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L108 值 `（无值 return：提前退出）` 逐值断言（worker.ts） | 待实现 |
| `UT-WORKER-382` | `stageInputs`（`worker.ts:87`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L117 值 `（无值 return：提前退出）` 逐值断言（worker.ts） | 待实现 |
