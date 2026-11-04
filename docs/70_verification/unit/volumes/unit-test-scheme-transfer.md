# UT 分卷登记 · TRANSFER（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：287**（对象类型分布：纯函数/无副作用 82；错误路径 24；状态分支 105；字符串/路径/枚举输入 64；时间域行为 1；资源获取/释放 11）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-TRANSFER-010` | `createRemoteBashTool`（`remote-exec-tools.ts:106`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `deps: RemoteExecToolDeps` 的 `每等价类合法值` 类（remote-exec-tools.ts:106） | 待实现 |
| `UT-TRANSFER-011` | `createRemoteBashTool`（`remote-exec-tools.ts:106`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `deps: RemoteExecToolDeps` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:106） | 待实现 |
| `UT-TRANSFER-012` | `createRemoteBashTool`（`remote-exec-tools.ts:106`） | `纯函数/无副作用` × `非法值` | 参数 `deps: RemoteExecToolDeps` 的 `非法值` 类（remote-exec-tools.ts:106） | 待实现 |
| `UT-TRANSFER-013` | `createRemoteBashTool`（`remote-exec-tools.ts:106`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；remote-exec-tools.ts:106） | 待实现 |
| `UT-TRANSFER-014` | `createRemoteBashTool`（`remote-exec-tools.ts:106`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L109 值 `{ name: "remote_bash", label: "Remote b…` 逐值断言（remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-015` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolCallId: inferred` 的 `每等价类合法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-016` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolCallId: inferred` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-017` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `_toolCallId: inferred` 的 `非法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-018` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `params: inferred` 的 `每等价类合法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-019` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `params: inferred` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-020` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `params: inferred` 的 `非法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-021` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_onUpdate: inferred` 的 `每等价类合法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-022` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_onUpdate: inferred` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-023` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `_onUpdate: inferred` 的 `非法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-024` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_toolContext: inferred` 的 `每等价类合法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-025` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_toolContext: inferred` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-026` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `_toolContext: inferred` 的 `非法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-027` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_invocation: inferred` 的 `每等价类合法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-028` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_invocation: inferred` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-029` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `_invocation: inferred` 的 `非法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-030` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `_context: inferred` 的 `每等价类合法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-031` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `_context: inferred` 的 `边界(上/下/零/空/满)` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-032` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `非法值` | 参数 `_context: inferred` 的 `非法值` 类（remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-033` | `execute`（`remote-exec-tools.ts:114`） | `状态分支` × `合法迁移` | 分支 L145 `deps.executionFacts?.record`（?.；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-034` | `execute`（`remote-exec-tools.ts:114`） | `状态分支` × `合法迁移` | 分支 L151 `? result.timed_out :`（ternary；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-035` | `execute`（`remote-exec-tools.ts:114`） | `状态分支` × `合法迁移` | 分支 L153 `? result.transport_failed :`（ternary；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-036` | `execute`（`remote-exec-tools.ts:114`） | `错误路径` × `每个 typed 错误码` | 分支 L186 `catch (e)`（catch；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-037` | `execute`（`remote-exec-tools.ts:114`） | `状态分支` × `合法迁移` | 分支 L189 `? e instanceof Error :`（ternary；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-038` | `execute`（`remote-exec-tools.ts:114`） | `状态分支` × `合法迁移` | 分支 L190 `? e instanceof PikoError :`（ternary；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-039` | `execute`（`remote-exec-tools.ts:114`） | `状态分支` × `合法迁移` | 分支 L195 `deps.executionFacts?.record`（?.；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-040` | `execute`（`remote-exec-tools.ts:114`） | `状态分支` × `合法迁移` | 分支 L197 `? code === "ScopeDenied" :`（ternary；remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-041` | `execute`（`remote-exec-tools.ts:114`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；remote-exec-tools.ts:114） | 待实现 |
| `UT-TRANSFER-042` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L161 值 `{ content: [ { type: "text", text: JSON…` 逐值断言（remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-043` | `execute`（`remote-exec-tools.ts:114`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L201 值 `{ content: [{ type: "text", text: `remo…` 逐值断言（remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-044` | `splitRemoteCommand`（`remote-exec-tools.ts:99`） | `字符串/路径/枚举输入` × `空` | 参数 `command: string` 的 `空` 类（remote-exec-tools.ts:99） | 待实现 |
| `UT-TRANSFER-045` | `splitRemoteCommand`（`remote-exec-tools.ts:99`） | `字符串/路径/枚举输入` × `超长` | 参数 `command: string` 的 `超长` 类（remote-exec-tools.ts:99） | 待实现 |
| `UT-TRANSFER-046` | `splitRemoteCommand`（`remote-exec-tools.ts:99`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `command: string` 的 `注入字符` 类（remote-exec-tools.ts:99） | 待实现 |
| `UT-TRANSFER-047` | `splitRemoteCommand`（`remote-exec-tools.ts:99`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L100 值 `command .trim() .split(/\s+/) .filter((…` 逐值断言（remote-exec-tools.ts） | 待实现 |
| `UT-TRANSFER-048` | `truncate`（`remote-exec.ts:208`） | `字符串/路径/枚举输入` × `空` | 参数 `value: string` 的 `空` 类（remote-exec.ts:208） | 待实现 |
| `UT-TRANSFER-049` | `truncate`（`remote-exec.ts:208`） | `字符串/路径/枚举输入` × `超长` | 参数 `value: string` 的 `超长` 类（remote-exec.ts:208） | 待实现 |
| `UT-TRANSFER-050` | `truncate`（`remote-exec.ts:208`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `value: string` 的 `注入字符` 类（remote-exec.ts:208） | 待实现 |
| `UT-TRANSFER-051` | `truncate`（`remote-exec.ts:208`） | `状态分支` × `合法迁移` | 分支 L209 `? value.length > MAX_OUTPUT_BYTES :`（ternary；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-052` | `truncate`（`remote-exec.ts:208`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L209 值 `value.length > MAX_OUTPUT_BYTES ? value…` 逐值断言（remote-exec.ts） | 待实现 |
| `UT-TRANSFER-053` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `options: RemoteExecOptions` 的 `每等价类合法值` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-054` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `options: RemoteExecOptions` 的 `边界(上/下/零/空/满)` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-055` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `非法值` | 参数 `options: RemoteExecOptions` 的 `非法值` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-056` | `execRemote`（`remote-exec.ts:92`） | `字符串/路径/枚举输入` × `空` | 参数 `transfer: { sshCommandArgs(host: string, argv: readonly string[]): Pro` 的 `空` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-057` | `execRemote`（`remote-exec.ts:92`） | `字符串/路径/枚举输入` × `超长` | 参数 `transfer: { sshCommandArgs(host: string, argv: readonly string[]): Pro` 的 `超长` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-058` | `execRemote`（`remote-exec.ts:92`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `transfer: { sshCommandArgs(host: string, argv: readonly string[]): Pro` 的 `注入字符` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-059` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-060` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-061` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-062` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `spawn: RemoteSpawner` 的 `每等价类合法值` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-063` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `spawn: RemoteSpawner` 的 `边界(上/下/零/空/满)` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-064` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `非法值` | 参数 `spawn: RemoteSpawner` 的 `非法值` 类（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-065` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `spawn` 缺省/显式两态（remote-exec.ts:92） | 待实现 |
| `UT-TRANSFER-066` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L100 `if (argv.length === 0)`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-067` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L107 `options.remoteHosts ?? []`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-068` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L108 `if (allowedHosts.length > 0 && !allowedHosts.…`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-069` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L108 `allowedHosts.length > 0 && !allowedHosts.incl…`（&&；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-070` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L108 `!allowedHosts.includes(host)`（!；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-071` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L117 `options.executables ?? []`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-072` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L120 `? options.cwd :`（ternary；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-073` | `execRemote`（`remote-exec.ts:92`） | `时间域行为` × `超时边界 ±1 tick` | 分支 L123 `options.timeoutMs ?? DEFAULT_TIMEOUT_MS`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-074` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L132 `if (settled)`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-075` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L138 `(error as { killed?: boolean } \| undefined)?.…`（?.；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-076` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L139 `killed \|\| (error as { signal?: string } \| und…`（\|\|；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-077` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L139 `(error as { signal?: string } \| undefined)?.s…`（?.；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-078` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L142 `if (!error)`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-079` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `每个非法迁移拒绝` | 分支 L144 `if (timedOut) { // A killed client has …`（else；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-080` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L142 `!error`（!；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-081` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L144 `if (timedOut)`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-082` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `每个非法迁移拒绝` | 分支 L149 `{ const code = (error as { code?: unkno…`（else；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-083` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L151 `if (typeof code === "number")`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-084` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `每个非法迁移拒绝` | 分支 L152 `if (typeof code === "string" && /^\d+$/…`（else；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-085` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L152 `if (typeof code === "string" && /^\d+$/.test(…`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-086` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L152 `typeof code === "string" && /^\d+$/.test(code)`（&&；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-087` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L161 `stderr ?? ""`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-088` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L163 `exitCode === 255 && /(ssh: connect to host \|C…`（&&；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-089` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L168 `if (transportFailed)`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-090` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L173 `if (error && exitCode === null && !timedOut &…`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-091` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L173 `error && exitCode === null && !timedOut && !t…`（&&；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-092` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L173 `error && exitCode === null && !timedOut`（&&；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-093` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L173 `error && exitCode === null`（&&；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-094` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L173 `!timedOut`（!；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-095` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L173 `!transportFailed`（!；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-096` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L187 `stdout ?? ""`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-097` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L188 `stderr ?? ""`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-098` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L189 `(stdout?.length ?? 0) > MAX_OUTPUT_BYTES \|\| (…`（\|\|；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-099` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L189 `stdout?.length ?? 0`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-100` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L189 `stdout?.length`（?.；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-101` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L189 `stderr?.length ?? 0`（??；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-102` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L189 `stderr?.length`（?.；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-103` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L194 `? timedOut :`（ternary；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-104` | `execRemote`（`remote-exec.ts:92`） | `状态分支` × `合法迁移` | 分支 L201 `if (settled)`（if；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-105` | `execRemote`（`remote-exec.ts:92`） | `错误路径` × `每个 typed 错误码` | throw L101 `InvalidRequest`（守卫 `if (argv.length === 0)`；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-106` | `execRemote`（`remote-exec.ts:92`） | `错误路径` × `每个 typed 错误码` | throw L109 `ScopeDenied`（守卫 `if (allowedHosts.length > 0 && !allowed…`；remote-exec.ts） | 待实现 |
| `UT-TRANSFER-107` | `execRemote`（`remote-exec.ts:92`） | `资源获取/释放` × `获取失败路径` | 资源操作 L128 `spawn`（remote-exec.ts） | 待实现 |
| `UT-TRANSFER-108` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L126 值 `await new Promise<RemoteExecResult>((re…` 逐值断言（remote-exec.ts） | 待实现 |
| `UT-TRANSFER-109` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L132 值 `（无值 return：提前退出）` 逐值断言（remote-exec.ts） | 待实现 |
| `UT-TRANSFER-110` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L182 值 `（无值 return：提前退出）` 逐值断言（remote-exec.ts） | 待实现 |
| `UT-TRANSFER-111` | `execRemote`（`remote-exec.ts:92`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L201 值 `（无值 return：提前退出）` 逐值断言（remote-exec.ts） | 待实现 |
| `UT-TRANSFER-112` | `sshBaseArgs`（`transfer.ts:112`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `binary: "scp" \| "ssh"` 的 `每等价类合法值` 类（transfer.ts:112） | 待实现 |
| `UT-TRANSFER-113` | `sshBaseArgs`（`transfer.ts:112`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `binary: "scp" \| "ssh"` 的 `边界(上/下/零/空/满)` 类（transfer.ts:112） | 待实现 |
| `UT-TRANSFER-114` | `sshBaseArgs`（`transfer.ts:112`） | `纯函数/无副作用` × `非法值` | 参数 `binary: "scp" \| "ssh"` 的 `非法值` 类（transfer.ts:112） | 待实现 |
| `UT-TRANSFER-115` | `sshBaseArgs`（`transfer.ts:112`） | `状态分支` × `合法迁移` | 分支 L114 `if (!knownHosts)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-116` | `sshBaseArgs`（`transfer.ts:112`） | `状态分支` × `合法迁移` | 分支 L114 `!knownHosts`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-117` | `sshBaseArgs`（`transfer.ts:112`） | `状态分支` × `合法迁移` | 分支 L116 `if (!key)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-118` | `sshBaseArgs`（`transfer.ts:112`） | `状态分支` × `合法迁移` | 分支 L116 `!key`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-119` | `sshBaseArgs`（`transfer.ts:112`） | `状态分支` × `合法迁移` | 分支 L135 `if (binary === "ssh" && this.config.transfer.…`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-120` | `sshBaseArgs`（`transfer.ts:112`） | `状态分支` × `合法迁移` | 分支 L135 `binary === "ssh" && this.config.transfer.port`（&&；transfer.ts） | 待实现 |
| `UT-TRANSFER-121` | `sshBaseArgs`（`transfer.ts:112`） | `错误路径` × `每个 typed 错误码` | throw L114 `InputFetchFailed`（守卫 `if (!knownHosts)`；transfer.ts） | 待实现 |
| `UT-TRANSFER-122` | `sshBaseArgs`（`transfer.ts:112`） | `错误路径` × `每个 typed 错误码` | throw L116 `InputFetchFailed`（守卫 `if (!key)`；transfer.ts） | 待实现 |
| `UT-TRANSFER-123` | `sshBaseArgs`（`transfer.ts:112`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L136 值 `args` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-124` | `sshCommandArgs`（`transfer.ts:145`） | `字符串/路径/枚举输入` × `空` | 参数 `host: string` 的 `空` 类（transfer.ts:145） | 待实现 |
| `UT-TRANSFER-125` | `sshCommandArgs`（`transfer.ts:145`） | `字符串/路径/枚举输入` × `超长` | 参数 `host: string` 的 `超长` 类（transfer.ts:145） | 待实现 |
| `UT-TRANSFER-126` | `sshCommandArgs`（`transfer.ts:145`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `host: string` 的 `注入字符` 类（transfer.ts:145） | 待实现 |
| `UT-TRANSFER-127` | `sshCommandArgs`（`transfer.ts:145`） | `字符串/路径/枚举输入` × `空` | 参数 `argv: readonly string[]` 的 `空` 类（transfer.ts:145） | 待实现 |
| `UT-TRANSFER-128` | `sshCommandArgs`（`transfer.ts:145`） | `字符串/路径/枚举输入` × `超长` | 参数 `argv: readonly string[]` 的 `超长` 类（transfer.ts:145） | 待实现 |
| `UT-TRANSFER-129` | `sshCommandArgs`（`transfer.ts:145`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `argv: readonly string[]` 的 `注入字符` 类（transfer.ts:145） | 待实现 |
| `UT-TRANSFER-130` | `sshCommandArgs`（`transfer.ts:145`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；transfer.ts:145） | 待实现 |
| `UT-TRANSFER-131` | `sshCommandArgs`（`transfer.ts:145`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L148 值 `args` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-132` | `run`（`transfer.ts:15`） | `字符串/路径/枚举输入` × `空` | 参数 `cmd: string` 的 `空` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-133` | `run`（`transfer.ts:15`） | `字符串/路径/枚举输入` × `超长` | 参数 `cmd: string` 的 `超长` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-134` | `run`（`transfer.ts:15`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `cmd: string` 的 `注入字符` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-135` | `run`（`transfer.ts:15`） | `字符串/路径/枚举输入` × `空` | 参数 `args: string[]` 的 `空` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-136` | `run`（`transfer.ts:15`） | `字符串/路径/枚举输入` × `超长` | 参数 `args: string[]` 的 `超长` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-137` | `run`（`transfer.ts:15`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `args: string[]` 的 `注入字符` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-138` | `run`（`transfer.ts:15`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `signal: AbortSignal` 的 `每等价类合法值` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-139` | `run`（`transfer.ts:15`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `signal: AbortSignal` 的 `边界(上/下/零/空/满)` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-140` | `run`（`transfer.ts:15`） | `纯函数/无副作用` × `非法值` | 参数 `signal: AbortSignal` 的 `非法值` 类（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-141` | `run`（`transfer.ts:15`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `signal` 缺省/显式两态（transfer.ts:15） | 待实现 |
| `UT-TRANSFER-142` | `run`（`transfer.ts:15`） | `状态分支` × `合法迁移` | 分支 L18 `if (err)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-143` | `run`（`transfer.ts:15`） | `状态分支` × `每个非法迁移拒绝` | 分支 L19 `res({ stdout, stderr });`（else；transfer.ts） | 待实现 |
| `UT-TRANSFER-144` | `run`（`transfer.ts:15`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；transfer.ts:15） | 待实现 |
| `UT-TRANSFER-145` | `run`（`transfer.ts:15`） | `资源获取/释放` × `获取失败路径` | 资源操作 L17 `execFile`（transfer.ts） | 待实现 |
| `UT-TRANSFER-146` | `run`（`transfer.ts:15`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L16 值 `new Promise((res, rej) => { execFile(cm…` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-147` | `withRetry`（`transfer.ts:151`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `fn: () => Promise<T>` 的 `每等价类合法值` 类（transfer.ts:151） | 待实现 |
| `UT-TRANSFER-148` | `withRetry`（`transfer.ts:151`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `fn: () => Promise<T>` 的 `边界(上/下/零/空/满)` 类（transfer.ts:151） | 待实现 |
| `UT-TRANSFER-149` | `withRetry`（`transfer.ts:151`） | `纯函数/无副作用` × `非法值` | 参数 `fn: () => Promise<T>` 的 `非法值` 类（transfer.ts:151） | 待实现 |
| `UT-TRANSFER-150` | `withRetry`（`transfer.ts:151`） | `状态分支` × `合法迁移` | 分支 L152 `this.config.transfer.retry ?? { max_attempts:…`（??；transfer.ts） | 待实现 |
| `UT-TRANSFER-151` | `withRetry`（`transfer.ts:151`） | `状态分支` × `合法迁移` | 分支 L154 `loop ()`（loop；transfer.ts） | 待实现 |
| `UT-TRANSFER-152` | `withRetry`（`transfer.ts:151`） | `错误路径` × `每个 typed 错误码` | 分支 L157 `catch (e)`（catch；transfer.ts） | 待实现 |
| `UT-TRANSFER-153` | `withRetry`（`transfer.ts:151`） | `状态分支` × `合法迁移` | 分支 L159 `if (attempt < max_attempts)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-154` | `withRetry`（`transfer.ts:151`） | `错误路径` × `每个 typed 错误码` | throw L162 `reject`（守卫 `unconditional`；transfer.ts） | 待实现 |
| `UT-TRANSFER-155` | `withRetry`（`transfer.ts:151`） | `资源获取/释放` × `获取失败路径` | 资源操作 L159 `setTimeout`（transfer.ts） | 待实现 |
| `UT-TRANSFER-156` | `withRetry`（`transfer.ts:151`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L156 值 `await fn()` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-157` | `fetchInputs`（`transfer.ts:166`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-158` | `fetchInputs`（`transfer.ts:166`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-159` | `fetchInputs`（`transfer.ts:166`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-160` | `fetchInputs`（`transfer.ts:166`） | `字符串/路径/枚举输入` × `空` | 参数 `refs: InputRef[]` 的 `空` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-161` | `fetchInputs`（`transfer.ts:166`） | `字符串/路径/枚举输入` × `超长` | 参数 `refs: InputRef[]` 的 `超长` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-162` | `fetchInputs`（`transfer.ts:166`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `refs: InputRef[]` 的 `注入字符` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-163` | `fetchInputs`（`transfer.ts:166`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `signal: AbortSignal` 的 `每等价类合法值` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-164` | `fetchInputs`（`transfer.ts:166`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `signal: AbortSignal` 的 `边界(上/下/零/空/满)` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-165` | `fetchInputs`（`transfer.ts:166`） | `纯函数/无副作用` × `非法值` | 参数 `signal: AbortSignal` 的 `非法值` 类（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-166` | `fetchInputs`（`transfer.ts:166`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `signal` 缺省/显式两态（transfer.ts:166） | 待实现 |
| `UT-TRANSFER-167` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L167 `if (!refs.length)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-168` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L167 `!refs.length`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-169` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L172 `loop (refs)`（loop；transfer.ts） | 待实现 |
| `UT-TRANSFER-170` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L173 `ref.dest ?? ref.source.split("/").pop() ?? "i…`（??；transfer.ts） | 待实现 |
| `UT-TRANSFER-171` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L173 `ref.dest ?? ref.source.split("/").pop()`（??；transfer.ts） | 待实现 |
| `UT-TRANSFER-172` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L178 `if (this.config.transfer.method === "scp")`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-173` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `每个非法迁移拒绝` | 分支 L180 `if (this.config.transfer.method === "mo…`（else；transfer.ts） | 待实现 |
| `UT-TRANSFER-174` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L180 `if (this.config.transfer.method === "mount")`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-175` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `每个非法迁移拒绝` | 分支 L182 `{ throw new PikoError("InputFetchFailed…`（else；transfer.ts） | 待实现 |
| `UT-TRANSFER-176` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L186 `if (ref.sha256 && sha256(local) !== ref.sha25…`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-177` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L186 `ref.sha256 && sha256(local) !== ref.sha256`（&&；transfer.ts） | 待实现 |
| `UT-TRANSFER-178` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L187 `if (size > this.config.transfer.max_input_byt…`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-179` | `fetchInputs`（`transfer.ts:166`） | `错误路径` × `每个 typed 错误码` | 分支 L189 `catch (e)`（catch；transfer.ts） | 待实现 |
| `UT-TRANSFER-180` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L190 `? e instanceof Error :`（ternary；transfer.ts） | 待实现 |
| `UT-TRANSFER-181` | `fetchInputs`（`transfer.ts:166`） | `状态分支` × `合法迁移` | 分支 L193 `? failed.length :`（ternary；transfer.ts） | 待实现 |
| `UT-TRANSFER-182` | `fetchInputs`（`transfer.ts:166`） | `错误路径` × `每个 typed 错误码` | throw L183 `InputFetchFailed`（守卫 `if (this.config.transfer.method === "mo…`；transfer.ts） | 待实现 |
| `UT-TRANSFER-183` | `fetchInputs`（`transfer.ts:166`） | `错误路径` × `每个 typed 错误码` | throw L186 `InputFetchFailed`（守卫 `if (ref.sha256 && sha256(local) !== ref…`；transfer.ts） | 待实现 |
| `UT-TRANSFER-184` | `fetchInputs`（`transfer.ts:166`） | `错误路径` × `每个 typed 错误码` | throw L187 `InputFetchFailed`（守卫 `if (size > this.config.transfer.max_inp…`；transfer.ts） | 待实现 |
| `UT-TRANSFER-185` | `fetchInputs`（`transfer.ts:166`） | `资源获取/释放` × `获取失败路径` | 资源操作 L169 `mkdirSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-186` | `fetchInputs`（`transfer.ts:166`） | `资源获取/释放` × `获取失败路径` | 资源操作 L177 `mkdirSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-187` | `fetchInputs`（`transfer.ts:166`） | `资源获取/释放` × `获取失败路径` | 资源操作 L185 `statSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-188` | `fetchInputs`（`transfer.ts:166`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L167 值 `{ state: "none", fetched: [], failed: […` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-189` | `fetchInputs`（`transfer.ts:166`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L193 值 `{ state: failed.length ? "failed" : "re…` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-190` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-191` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-192` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-193` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `空` | 参数 `outputPaths: string[]` 的 `空` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-194` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `超长` | 参数 `outputPaths: string[]` 的 `超长` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-195` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `outputPaths: string[]` 的 `注入字符` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-196` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `target: ArtifactTarget` 的 `每等价类合法值` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-197` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `target: ArtifactTarget` 的 `边界(上/下/零/空/满)` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-198` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `非法值` | 参数 `target: ArtifactTarget` 的 `非法值` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-199` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `signal: AbortSignal` 的 `每等价类合法值` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-200` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `signal: AbortSignal` 的 `边界(上/下/零/空/满)` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-201` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `非法值` | 参数 `signal: AbortSignal` 的 `非法值` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-202` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `signal` 缺省/显式两态（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-203` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `空` | 参数 `baseDir: string` 的 `空` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-204` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `超长` | 参数 `baseDir: string` 的 `超长` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-205` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `baseDir: string` 的 `注入字符` 类（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-206` | `deliverArtifacts`（`transfer.ts:198`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `baseDir` 缺省/显式两态（transfer.ts:198） | 待实现 |
| `UT-TRANSFER-207` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L199 `if (!outputPaths.length \|\| !target)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-208` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L199 `!outputPaths.length \|\| !target`（\|\|；transfer.ts） | 待实现 |
| `UT-TRANSFER-209` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L199 `!outputPaths.length`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-210` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L199 `!target`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-211` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L203 `loop (outputPaths)`（loop；transfer.ts） | 待实现 |
| `UT-TRANSFER-212` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L205 `? baseDir :`（ternary；transfer.ts） | 待实现 |
| `UT-TRANSFER-213` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L209 `if (target.method === "scp")`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-214` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `每个非法迁移拒绝` | 分支 L211 `if (target.method === "mount") { // mou…`（else；transfer.ts） | 待实现 |
| `UT-TRANSFER-215` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L211 `if (target.method === "mount")`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-216` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `每个非法迁移拒绝` | 分支 L213 `{ throw new PikoError("InternalError", …`（else；transfer.ts） | 待实现 |
| `UT-TRANSFER-217` | `deliverArtifacts`（`transfer.ts:198`） | `错误路径` × `每个 typed 错误码` | 分支 L217 `catch (e)`（catch；transfer.ts） | 待实现 |
| `UT-TRANSFER-218` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L218 `? e instanceof Error :`（ternary；transfer.ts） | 待实现 |
| `UT-TRANSFER-219` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L221 `? failed.length === 0 :`（ternary；transfer.ts） | 待实现 |
| `UT-TRANSFER-220` | `deliverArtifacts`（`transfer.ts:198`） | `状态分支` × `合法迁移` | 分支 L221 `? delivered.length === 0 :`（ternary；transfer.ts） | 待实现 |
| `UT-TRANSFER-221` | `deliverArtifacts`（`transfer.ts:198`） | `错误路径` × `每个 typed 错误码` | throw L214 `InternalError`（守卫 `if (target.method === "mount")`；transfer.ts） | 待实现 |
| `UT-TRANSFER-222` | `deliverArtifacts`（`transfer.ts:198`） | `资源获取/释放` × `获取失败路径` | 资源操作 L206 `statSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-223` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L199 值 `{ state: "none", delivered: [], failed:…` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-224` | `deliverArtifacts`（`transfer.ts:198`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L222 值 `{ state, delivered, failed }` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-225` | `clearStaging`（`transfer.ts:225`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（transfer.ts:225） | 待实现 |
| `UT-TRANSFER-226` | `clearStaging`（`transfer.ts:225`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（transfer.ts:225） | 待实现 |
| `UT-TRANSFER-227` | `clearStaging`（`transfer.ts:225`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（transfer.ts:225） | 待实现 |
| `UT-TRANSFER-228` | `clearStaging`（`transfer.ts:225`） | `错误路径` × `每个 typed 错误码` | 分支 L228 `catch ()`（catch；transfer.ts） | 待实现 |
| `UT-TRANSFER-229` | `clearStaging`（`transfer.ts:225`） | `资源获取/释放` × `正常释放` | 资源操作 L227 `rmSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-230` | `safeJoinIn`（`transfer.ts:25`） | `字符串/路径/枚举输入` × `空` | 参数 `base: string` 的 `空` 类（transfer.ts:25） | 待实现 |
| `UT-TRANSFER-231` | `safeJoinIn`（`transfer.ts:25`） | `字符串/路径/枚举输入` × `超长` | 参数 `base: string` 的 `超长` 类（transfer.ts:25） | 待实现 |
| `UT-TRANSFER-232` | `safeJoinIn`（`transfer.ts:25`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `base: string` 的 `注入字符` 类（transfer.ts:25） | 待实现 |
| `UT-TRANSFER-233` | `safeJoinIn`（`transfer.ts:25`） | `字符串/路径/枚举输入` × `空` | 参数 `rel: string` 的 `空` 类（transfer.ts:25） | 待实现 |
| `UT-TRANSFER-234` | `safeJoinIn`（`transfer.ts:25`） | `字符串/路径/枚举输入` × `超长` | 参数 `rel: string` 的 `超长` 类（transfer.ts:25） | 待实现 |
| `UT-TRANSFER-235` | `safeJoinIn`（`transfer.ts:25`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `rel: string` 的 `注入字符` 类（transfer.ts:25） | 待实现 |
| `UT-TRANSFER-236` | `safeJoinIn`（`transfer.ts:25`） | `状态分支` × `合法迁移` | 分支 L28 `if (relCheck.startsWith("..") \|\| isAbsolute(r…`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-237` | `safeJoinIn`（`transfer.ts:25`） | `状态分支` × `合法迁移` | 分支 L28 `relCheck.startsWith("..") \|\| isAbsolute(relCh…`（\|\|；transfer.ts） | 待实现 |
| `UT-TRANSFER-238` | `safeJoinIn`（`transfer.ts:25`） | `错误路径` × `每个 typed 错误码` | throw L28 `InvalidRequest`（守卫 `if (relCheck.startsWith("..") \|\| isAbso…`；transfer.ts） | 待实现 |
| `UT-TRANSFER-239` | `safeJoinIn`（`transfer.ts:25`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L29 值 `target` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-240` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `空` | 参数 `stagingRoot: string` 的 `空` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-241` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `超长` | 参数 `stagingRoot: string` 的 `超长` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-242` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `stagingRoot: string` 的 `注入字符` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-243` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-244` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-245` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-246` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `空` | 参数 `rel: string` 的 `空` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-247` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `超长` | 参数 `rel: string` 的 `超长` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-248` | `safeJoin`（`transfer.ts:31`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `rel: string` 的 `注入字符` 类（transfer.ts:31） | 待实现 |
| `UT-TRANSFER-249` | `safeJoin`（`transfer.ts:31`） | `状态分支` × `合法迁移` | 分支 L35 `if (relCheck.startsWith("..") \|\| isAbsolute(r…`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-250` | `safeJoin`（`transfer.ts:31`） | `状态分支` × `合法迁移` | 分支 L35 `relCheck.startsWith("..") \|\| isAbsolute(relCh…`（\|\|；transfer.ts） | 待实现 |
| `UT-TRANSFER-251` | `safeJoin`（`transfer.ts:31`） | `错误路径` × `每个 typed 错误码` | throw L35 `InvalidRequest`（守卫 `if (relCheck.startsWith("..") \|\| isAbso…`；transfer.ts） | 待实现 |
| `UT-TRANSFER-252` | `safeJoin`（`transfer.ts:31`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L36 值 `target` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-253` | `constructor`（`transfer.ts:42`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（transfer.ts:42） | 待实现 |
| `UT-TRANSFER-254` | `constructor`（`transfer.ts:42`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（transfer.ts:42） | 待实现 |
| `UT-TRANSFER-255` | `constructor`（`transfer.ts:42`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（transfer.ts:42） | 待实现 |
| `UT-TRANSFER-256` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 分支 L55 `if (!ref)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-257` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 分支 L55 `!ref`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-258` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 分支 L56 `if (this.keyPath)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-259` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 分支 L59 `if (!material)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-260` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 分支 L59 `!material`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-261` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 分支 L63 `? material.endsWith("\n") :`（ternary；transfer.ts） | 待实现 |
| `UT-TRANSFER-262` | `scpKeyPath`（`transfer.ts:53`） | `错误路径` × `每个 typed 错误码` | 分支 L66 `catch ()`（catch；transfer.ts） | 待实现 |
| `UT-TRANSFER-263` | `scpKeyPath`（`transfer.ts:53`） | `错误路径` × `每个 typed 错误码` | throw L59 `InputFetchFailed`（守卫 `if (!material)`；transfer.ts） | 待实现 |
| `UT-TRANSFER-264` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 状态写 L69 → `this.tempKey`（transfer.ts） | 待实现 |
| `UT-TRANSFER-265` | `scpKeyPath`（`transfer.ts:53`） | `状态分支` × `合法迁移` | 状态写 L70 → `this.keyPath`（transfer.ts） | 待实现 |
| `UT-TRANSFER-266` | `scpKeyPath`（`transfer.ts:53`） | `资源获取/释放` × `获取失败路径` | 资源操作 L61 `mkdirSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-267` | `scpKeyPath`（`transfer.ts:53`） | `资源获取/释放` × `获取失败路径` | 资源操作 L63 `writeFileSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-268` | `scpKeyPath`（`transfer.ts:53`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L55 值 `undefined` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-269` | `scpKeyPath`（`transfer.ts:53`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L56 值 `this.keyPath` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-270` | `scpKeyPath`（`transfer.ts:53`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L71 值 `file` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-271` | `close`（`transfer.ts:75`） | `状态分支` × `合法迁移` | 分支 L76 `if (this.tempKey)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-272` | `close`（`transfer.ts:75`） | `状态分支` × `合法迁移` | 状态写 L78 → `this.tempKey`（transfer.ts） | 待实现 |
| `UT-TRANSFER-273` | `close`（`transfer.ts:75`） | `状态分支` × `合法迁移` | 状态写 L79 → `this.keyPath`（transfer.ts） | 待实现 |
| `UT-TRANSFER-274` | `close`（`transfer.ts:75`） | `资源获取/释放` × `正常释放` | 资源操作 L77 `rmSync`（transfer.ts） | 待实现 |
| `UT-TRANSFER-275` | `stagingRoot`（`transfer.ts:83`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L84 值 `this.config.workspace.staging_root` 逐值断言（transfer.ts） | 待实现 |
| `UT-TRANSFER-276` | `assertAllowed`（`transfer.ts:87`） | `字符串/路径/枚举输入` × `空` | 参数 `target: string` 的 `空` 类（transfer.ts:87） | 待实现 |
| `UT-TRANSFER-277` | `assertAllowed`（`transfer.ts:87`） | `字符串/路径/枚举输入` × `超长` | 参数 `target: string` 的 `超长` 类（transfer.ts:87） | 待实现 |
| `UT-TRANSFER-278` | `assertAllowed`（`transfer.ts:87`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `target: string` 的 `注入字符` 类（transfer.ts:87） | 待实现 |
| `UT-TRANSFER-279` | `assertAllowed`（`transfer.ts:87`） | `状态分支` × `合法迁移` | 分支 L88 `this.config.transfer.target_allowlist ?? []`（??；transfer.ts） | 待实现 |
| `UT-TRANSFER-280` | `assertAllowed`（`transfer.ts:87`） | `状态分支` × `合法迁移` | 分支 L89 `if (!allow.some((a) => target.startsWith(a)))`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-281` | `assertAllowed`（`transfer.ts:87`） | `状态分支` × `合法迁移` | 分支 L89 `!allow.some((a) => target.startsWith(a))`（!；transfer.ts） | 待实现 |
| `UT-TRANSFER-282` | `assertAllowed`（`transfer.ts:87`） | `错误路径` × `每个 typed 错误码` | throw L90 `InputFetchFailed`（守卫 `if (!allow.some((a) => target.startsWit…`；transfer.ts） | 待实现 |
| `UT-TRANSFER-283` | `scpArgs`（`transfer.ts:94`） | `字符串/路径/枚举输入` × `空` | 参数 `remote: string` 的 `空` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-284` | `scpArgs`（`transfer.ts:94`） | `字符串/路径/枚举输入` × `超长` | 参数 `remote: string` 的 `超长` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-285` | `scpArgs`（`transfer.ts:94`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `remote: string` 的 `注入字符` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-286` | `scpArgs`（`transfer.ts:94`） | `字符串/路径/枚举输入` × `空` | 参数 `local: string` 的 `空` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-287` | `scpArgs`（`transfer.ts:94`） | `字符串/路径/枚举输入` × `超长` | 参数 `local: string` 的 `超长` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-288` | `scpArgs`（`transfer.ts:94`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `local: string` 的 `注入字符` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-289` | `scpArgs`（`transfer.ts:94`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `direction: "pull" \| "push"` 的 `每等价类合法值` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-290` | `scpArgs`（`transfer.ts:94`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `direction: "pull" \| "push"` 的 `边界(上/下/零/空/满)` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-291` | `scpArgs`（`transfer.ts:94`） | `纯函数/无副作用` × `非法值` | 参数 `direction: "pull" \| "push"` 的 `非法值` 类（transfer.ts:94） | 待实现 |
| `UT-TRANSFER-292` | `scpArgs`（`transfer.ts:94`） | `状态分支` × `合法迁移` | 分支 L97 `if (this.config.transfer.port)`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-293` | `scpArgs`（`transfer.ts:94`） | `状态分支` × `合法迁移` | 分支 L98 `if (direction === "pull")`（if；transfer.ts） | 待实现 |
| `UT-TRANSFER-294` | `scpArgs`（`transfer.ts:94`） | `状态分支` × `每个非法迁移拒绝` | 分支 L99 `args.push("--", local, remote);`（else；transfer.ts） | 待实现 |
| `UT-TRANSFER-295` | `scpArgs`（`transfer.ts:94`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；transfer.ts:94） | 待实现 |
| `UT-TRANSFER-296` | `scpArgs`（`transfer.ts:94`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L100 值 `args` 逐值断言（transfer.ts） | 待实现 |
