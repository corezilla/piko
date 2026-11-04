# UT 分卷登记 · POLICY（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：155**（对象类型分布：字符串/路径/枚举输入 42；状态分支 51；错误路径 20；纯函数/无副作用 41；资源获取/释放 1）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-POLICY-012` | `canonicalize`（`policy.ts:14`） | `字符串/路径/枚举输入` × `空` | 参数 `rel: string` 的 `空` 类（policy.ts:14） | 待实现 |
| `UT-POLICY-013` | `canonicalize`（`policy.ts:14`） | `字符串/路径/枚举输入` × `超长` | 参数 `rel: string` 的 `超长` 类（policy.ts:14） | 待实现 |
| `UT-POLICY-014` | `canonicalize`（`policy.ts:14`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `rel: string` 的 `注入字符` 类（policy.ts:14） | 待实现 |
| `UT-POLICY-015` | `canonicalize`（`policy.ts:14`） | `状态分支` × `合法迁移` | 分支 L15 `if (isAbsolute(rel))`（if；policy.ts） | 待实现 |
| `UT-POLICY-016` | `canonicalize`（`policy.ts:14`） | `状态分支` × `合法迁移` | 分支 L16 `if (rel.includes("\\"))`（if；policy.ts） | 待实现 |
| `UT-POLICY-017` | `canonicalize`（`policy.ts:14`） | `状态分支` × `合法迁移` | 分支 L18 `if (norm.split("/").some((s) => s === ".." \|\|…`（if；policy.ts） | 待实现 |
| `UT-POLICY-018` | `canonicalize`（`policy.ts:14`） | `状态分支` × `合法迁移` | 分支 L18 `s === ".." \|\| s === "." \|\| s === ""`（\|\|；policy.ts） | 待实现 |
| `UT-POLICY-019` | `canonicalize`（`policy.ts:14`） | `状态分支` × `合法迁移` | 分支 L18 `s === ".." \|\| s === "."`（\|\|；policy.ts） | 待实现 |
| `UT-POLICY-020` | `canonicalize`（`policy.ts:14`） | `错误路径` × `每个 typed 错误码` | throw L15 `InvalidRequest`（守卫 `if (isAbsolute(rel))`；policy.ts） | 待实现 |
| `UT-POLICY-021` | `canonicalize`（`policy.ts:14`） | `错误路径` × `每个 typed 错误码` | throw L16 `InvalidRequest`（守卫 `if (rel.includes("\\"))`；policy.ts） | 待实现 |
| `UT-POLICY-022` | `canonicalize`（`policy.ts:14`） | `错误路径` × `每个 typed 错误码` | throw L19 `InvalidRequest`（守卫 `if (norm.split("/").some((s) => s === "…`；policy.ts） | 待实现 |
| `UT-POLICY-023` | `canonicalize`（`policy.ts:14`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L21 值 `norm` 逐值断言（policy.ts） | 待实现 |
| `UT-POLICY-024` | `resolveWorkspace`（`policy.ts:24`） | `字符串/路径/枚举输入` × `空` | 参数 `workspaceRef: string` 的 `空` 类（policy.ts:24） | 待实现 |
| `UT-POLICY-025` | `resolveWorkspace`（`policy.ts:24`） | `字符串/路径/枚举输入` × `超长` | 参数 `workspaceRef: string` 的 `超长` 类（policy.ts:24） | 待实现 |
| `UT-POLICY-026` | `resolveWorkspace`（`policy.ts:24`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `workspaceRef: string` 的 `注入字符` 类（policy.ts:24） | 待实现 |
| `UT-POLICY-027` | `resolveWorkspace`（`policy.ts:24`） | `状态分支` × `合法迁移` | 分支 L25 `this.config.workspace.roots[workspaceRef] ?? …`（??；policy.ts） | 待实现 |
| `UT-POLICY-028` | `resolveWorkspace`（`policy.ts:24`） | `状态分支` × `合法迁移` | 分支 L26 `if (!root)`（if；policy.ts） | 待实现 |
| `UT-POLICY-029` | `resolveWorkspace`（`policy.ts:24`） | `状态分支` × `合法迁移` | 分支 L26 `!root`（!；policy.ts） | 待实现 |
| `UT-POLICY-030` | `resolveWorkspace`（`policy.ts:24`） | `错误路径` × `每个 typed 错误码` | throw L26 `ScopeDenied`（守卫 `if (!root)`；policy.ts） | 待实现 |
| `UT-POLICY-031` | `resolveWorkspace`（`policy.ts:24`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L27 值 `root` 逐值断言（policy.ts） | 待实现 |
| `UT-POLICY-032` | `validate`（`policy.ts:31`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `task: TaskRequest` 的 `每等价类合法值` 类（policy.ts:31） | 待实现 |
| `UT-POLICY-033` | `validate`（`policy.ts:31`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（policy.ts:31） | 待实现 |
| `UT-POLICY-034` | `validate`（`policy.ts:31`） | `纯函数/无副作用` × `非法值` | 参数 `task: TaskRequest` 的 `非法值` 类（policy.ts:31） | 待实现 |
| `UT-POLICY-035` | `validate`（`policy.ts:31`） | `字符串/路径/枚举输入` × `空` | 参数 `_principal: string` 的 `空` 类（policy.ts:31） | 待实现 |
| `UT-POLICY-036` | `validate`（`policy.ts:31`） | `字符串/路径/枚举输入` × `超长` | 参数 `_principal: string` 的 `超长` 类（policy.ts:31） | 待实现 |
| `UT-POLICY-037` | `validate`（`policy.ts:31`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `_principal: string` 的 `注入字符` 类（policy.ts:31） | 待实现 |
| `UT-POLICY-038` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L36 `if (!this.tools.profiles[task.permissions.too…`（if；policy.ts） | 待实现 |
| `UT-POLICY-039` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L36 `!this.tools.profiles[task.permissions.tool_pr…`（!；policy.ts） | 待实现 |
| `UT-POLICY-040` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L39 `loop (outputs)`（loop；policy.ts） | 待实现 |
| `UT-POLICY-041` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L42 `if (!inRead && !inWrite)`（if；policy.ts） | 待实现 |
| `UT-POLICY-042` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L42 `!inRead && !inWrite`（&&；policy.ts） | 待实现 |
| `UT-POLICY-043` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L42 `!inRead`（!；policy.ts） | 待实现 |
| `UT-POLICY-044` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L42 `!inWrite`（!；policy.ts） | 待实现 |
| `UT-POLICY-045` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L44 `loop (task.input_refs ?? [])`（loop；policy.ts） | 待实现 |
| `UT-POLICY-046` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L44 `task.input_refs ?? []`（??；policy.ts） | 待实现 |
| `UT-POLICY-047` | `validate`（`policy.ts:31`） | `状态分支` × `合法迁移` | 分支 L45 `if (ref.dest)`（if；policy.ts） | 待实现 |
| `UT-POLICY-048` | `validate`（`policy.ts:31`） | `错误路径` × `每个 typed 错误码` | throw L37 `ScopeDenied`（守卫 `if (!this.tools.profiles[task.permissio…`；policy.ts） | 待实现 |
| `UT-POLICY-049` | `validate`（`policy.ts:31`） | `错误路径` × `每个 typed 错误码` | throw L42 `ScopeDenied`（守卫 `if (!inRead && !inWrite)`；policy.ts） | 待实现 |
| `UT-POLICY-050` | `validate`（`policy.ts:31`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L47 值 `{ ...task, permissions: { ...task.permi…` 逐值断言（policy.ts） | 待实现 |
| `UT-POLICY-051` | `validateResult`（`policy.ts:55`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `result: AgentResult` 的 `每等价类合法值` 类（policy.ts:55） | 待实现 |
| `UT-POLICY-052` | `validateResult`（`policy.ts:55`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（policy.ts:55） | 待实现 |
| `UT-POLICY-053` | `validateResult`（`policy.ts:55`） | `纯函数/无副作用` × `非法值` | 参数 `result: AgentResult` 的 `非法值` 类（policy.ts:55） | 待实现 |
| `UT-POLICY-054` | `validateResult`（`policy.ts:55`） | `状态分支` × `合法迁移` | 分支 L56 `if (result.state === "Completed" && (result.p…`（if；policy.ts） | 待实现 |
| `UT-POLICY-055` | `validateResult`（`policy.ts:55`） | `状态分支` × `合法迁移` | 分支 L56 `result.state === "Completed" && (result.parti…`（&&；policy.ts） | 待实现 |
| `UT-POLICY-056` | `validateResult`（`policy.ts:55`） | `状态分支` × `合法迁移` | 分支 L56 `result.partial \|\| result.failure !== null`（\|\|；policy.ts） | 待实现 |
| `UT-POLICY-057` | `validateResult`（`policy.ts:55`） | `状态分支` × `合法迁移` | 分支 L59 `if (result.state === "Failed" && result.failu…`（if；policy.ts） | 待实现 |
| `UT-POLICY-058` | `validateResult`（`policy.ts:55`） | `状态分支` × `合法迁移` | 分支 L59 `result.state === "Failed" && result.failure =…`（&&；policy.ts） | 待实现 |
| `UT-POLICY-059` | `validateResult`（`policy.ts:55`） | `错误路径` × `每个 typed 错误码` | throw L57 `InternalError`（守卫 `if (result.state === "Completed" && (re…`；policy.ts） | 待实现 |
| `UT-POLICY-060` | `validateResult`（`policy.ts:55`） | `错误路径` × `每个 typed 错误码` | throw L60 `InternalError`（守卫 `if (result.state === "Failed" && result…`；policy.ts） | 待实现 |
| `UT-POLICY-061` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `空` | 参数 `root: string` 的 `空` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-062` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `超长` | 参数 `root: string` 的 `超长` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-063` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `root: string` 的 `注入字符` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-064` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `空` | 参数 `glob: string` 的 `空` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-065` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `超长` | 参数 `glob: string` 的 `超长` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-066` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `glob: string` 的 `注入字符` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-067` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-068` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-069` | `within`（`policy.ts:65`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（policy.ts:65） | 待实现 |
| `UT-POLICY-070` | `within`（`policy.ts:65`） | `状态分支` × `合法迁移` | 分支 L66 `? glob.endsWith("/**") :`（ternary；policy.ts） | 待实现 |
| `UT-POLICY-071` | `within`（`policy.ts:65`） | `状态分支` × `合法迁移` | 分支 L66 `? glob.endsWith("*") :`（ternary；policy.ts） | 待实现 |
| `UT-POLICY-072` | `within`（`policy.ts:65`） | `状态分支` × `合法迁移` | 分支 L67 `path === base \|\| path.startsWith(base.endsWit…`（\|\|；policy.ts） | 待实现 |
| `UT-POLICY-073` | `within`（`policy.ts:65`） | `状态分支` × `合法迁移` | 分支 L67 `? base.endsWith("/") :`（ternary；policy.ts） | 待实现 |
| `UT-POLICY-074` | `within`（`policy.ts:65`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L67 值 `path === base \|\| path.startsWith(base.e…` 逐值断言（policy.ts） | 待实现 |
| `UT-POLICY-075` | `constructor`（`policy.ts:8`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（policy.ts:8） | 待实现 |
| `UT-POLICY-076` | `constructor`（`policy.ts:8`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（policy.ts:8） | 待实现 |
| `UT-POLICY-077` | `constructor`（`policy.ts:8`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（policy.ts:8） | 待实现 |
| `UT-POLICY-078` | `constructor`（`policy.ts:8`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `tools: ToolRegistry` 的 `每等价类合法值` 类（policy.ts:8） | 待实现 |
| `UT-POLICY-079` | `constructor`（`policy.ts:8`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `tools: ToolRegistry` 的 `边界(上/下/零/空/满)` 类（policy.ts:8） | 待实现 |
| `UT-POLICY-080` | `constructor`（`policy.ts:8`） | `纯函数/无副作用` × `非法值` | 参数 `tools: ToolRegistry` 的 `非法值` 类（policy.ts:8） | 待实现 |
| `UT-POLICY-081` | `normalizedTask`（`task-equality.ts:3`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `t: TaskRequest` 的 `每等价类合法值` 类（task-equality.ts:3） | 待实现 |
| `UT-POLICY-082` | `normalizedTask`（`task-equality.ts:3`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `t: TaskRequest` 的 `边界(上/下/零/空/满)` 类（task-equality.ts:3） | 待实现 |
| `UT-POLICY-083` | `normalizedTask`（`task-equality.ts:3`） | `纯函数/无副作用` × `非法值` | 参数 `t: TaskRequest` 的 `非法值` 类（task-equality.ts:3） | 待实现 |
| `UT-POLICY-084` | `normalizedTask`（`task-equality.ts:3`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L3 值 `{...t,permissions:{...t.permissions,rea…` 逐值断言（task-equality.ts） | 待实现 |
| `UT-POLICY-085` | `sameTask`（`task-equality.ts:4`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `a: TaskRequest` 的 `每等价类合法值` 类（task-equality.ts:4） | 待实现 |
| `UT-POLICY-086` | `sameTask`（`task-equality.ts:4`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `a: TaskRequest` 的 `边界(上/下/零/空/满)` 类（task-equality.ts:4） | 待实现 |
| `UT-POLICY-087` | `sameTask`（`task-equality.ts:4`） | `纯函数/无副作用` × `非法值` | 参数 `a: TaskRequest` 的 `非法值` 类（task-equality.ts:4） | 待实现 |
| `UT-POLICY-088` | `sameTask`（`task-equality.ts:4`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `b: TaskRequest` 的 `每等价类合法值` 类（task-equality.ts:4） | 待实现 |
| `UT-POLICY-089` | `sameTask`（`task-equality.ts:4`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `b: TaskRequest` 的 `边界(上/下/零/空/满)` 类（task-equality.ts:4） | 待实现 |
| `UT-POLICY-090` | `sameTask`（`task-equality.ts:4`） | `纯函数/无副作用` × `非法值` | 参数 `b: TaskRequest` 的 `非法值` 类（task-equality.ts:4） | 待实现 |
| `UT-POLICY-091` | `sameTask`（`task-equality.ts:4`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L4 值 `JSON.stringify(normalizedTask(a))===JSO…` 逐值断言（task-equality.ts） | 待实现 |
| `UT-POLICY-092` | `realpathNearestAncestor`（`workspace.ts:14`） | `字符串/路径/枚举输入` × `空` | 参数 `p: string` 的 `空` 类（workspace.ts:14） | 待实现 |
| `UT-POLICY-093` | `realpathNearestAncestor`（`workspace.ts:14`） | `字符串/路径/枚举输入` × `超长` | 参数 `p: string` 的 `超长` 类（workspace.ts:14） | 待实现 |
| `UT-POLICY-094` | `realpathNearestAncestor`（`workspace.ts:14`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `p: string` 的 `注入字符` 类（workspace.ts:14） | 待实现 |
| `UT-POLICY-095` | `realpathNearestAncestor`（`workspace.ts:14`） | `状态分支` × `合法迁移` | 分支 L16 `loop ()`（loop；workspace.ts） | 待实现 |
| `UT-POLICY-096` | `realpathNearestAncestor`（`workspace.ts:14`） | `错误路径` × `每个 typed 错误码` | 分支 L16 `catch (cur)`（catch；workspace.ts） | 待实现 |
| `UT-POLICY-097` | `realpathNearestAncestor`（`workspace.ts:14`） | `状态分支` × `合法迁移` | 分支 L16 `if (parent===cur)`（if；workspace.ts） | 待实现 |
| `UT-POLICY-098` | `realpathNearestAncestor`（`workspace.ts:14`） | `错误路径` × `每个 typed 错误码` | throw L16 `ScopeDenied`（守卫 `if (parent===cur)`；workspace.ts） | 待实现 |
| `UT-POLICY-099` | `realpathNearestAncestor`（`workspace.ts:14`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L16 值 `await realpath(cur)` 逐值断言（workspace.ts） | 待实现 |
| `UT-POLICY-100` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `空` | 参数 `workspace: string` 的 `空` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-101` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `超长` | 参数 `workspace: string` 的 `超长` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-102` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `workspace: string` 的 `注入字符` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-103` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `空` | 参数 `input: string` 的 `空` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-104` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `超长` | 参数 `input: string` 的 `超长` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-105` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `input: string` 的 `注入字符` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-106` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `空` | 参数 `allowed: string[]` 的 `空` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-107` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `超长` | 参数 `allowed: string[]` 的 `超长` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-108` | `authorizePath`（`workspace.ts:18`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `allowed: string[]` 的 `注入字符` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-109` | `authorizePath`（`workspace.ts:18`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `write: inferred` 的 `每等价类合法值` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-110` | `authorizePath`（`workspace.ts:18`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `write: inferred` 的 `边界(上/下/零/空/满)` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-111` | `authorizePath`（`workspace.ts:18`） | `纯函数/无副作用` × `非法值` | 参数 `write: inferred` 的 `非法值` 类（workspace.ts:18） | 待实现 |
| `UT-POLICY-112` | `authorizePath`（`workspace.ts:18`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `write` 缺省/显式两态（workspace.ts:18） | 待实现 |
| `UT-POLICY-113` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L21 `if (!inside(workspace,candidate))`（if；workspace.ts） | 待实现 |
| `UT-POLICY-114` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L21 `!inside(workspace,candidate)`（!；workspace.ts） | 待实现 |
| `UT-POLICY-115` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L23 `? write :`（ternary；workspace.ts） | 待实现 |
| `UT-POLICY-116` | `authorizePath`（`workspace.ts:18`） | `错误路径` × `每个 typed 错误码` | 分支 L24 `catch (dirname(candidate)`（catch；workspace.ts） | 待实现 |
| `UT-POLICY-117` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L24 `? write :`（ternary；workspace.ts） | 待实现 |
| `UT-POLICY-118` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L25 `? write :`（ternary；workspace.ts） | 待实现 |
| `UT-POLICY-119` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L26 `if (!inside(wsReal,target))`（if；workspace.ts） | 待实现 |
| `UT-POLICY-120` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L26 `!inside(wsReal,target)`（!；workspace.ts） | 待实现 |
| `UT-POLICY-121` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L28 `if (!allowedAbs.every(p=>inside(wsReal,p)))`（if；workspace.ts） | 待实现 |
| `UT-POLICY-122` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L28 `!allowedAbs.every(p=>inside(wsReal,p))`（!；workspace.ts） | 待实现 |
| `UT-POLICY-123` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L29 `if (!allowedAbs.some(root=>inside(root,target…`（if；workspace.ts） | 待实现 |
| `UT-POLICY-124` | `authorizePath`（`workspace.ts:18`） | `状态分支` × `合法迁移` | 分支 L29 `!allowedAbs.some(root=>inside(root,target))`（!；workspace.ts） | 待实现 |
| `UT-POLICY-125` | `authorizePath`（`workspace.ts:18`） | `错误路径` × `每个 typed 错误码` | throw L21 `ScopeDenied`（守卫 `if (!inside(workspace,candidate))`；workspace.ts） | 待实现 |
| `UT-POLICY-126` | `authorizePath`（`workspace.ts:18`） | `错误路径` × `每个 typed 错误码` | throw L26 `ScopeDenied`（守卫 `if (!inside(wsReal,target))`；workspace.ts） | 待实现 |
| `UT-POLICY-127` | `authorizePath`（`workspace.ts:18`） | `错误路径` × `每个 typed 错误码` | throw L28 `ScopeDenied`（守卫 `if (!allowedAbs.every(p=>inside(wsReal,…`；workspace.ts） | 待实现 |
| `UT-POLICY-128` | `authorizePath`（`workspace.ts:18`） | `错误路径` × `每个 typed 错误码` | throw L29 `ScopeDenied`（守卫 `if (!allowedAbs.some(root=>inside(root,…`；workspace.ts） | 待实现 |
| `UT-POLICY-129` | `authorizePath`（`workspace.ts:18`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L30 值 `target` 逐值断言（workspace.ts） | 待实现 |
| `UT-POLICY-130` | `collectOutputs`（`workspace.ts:32`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `task: TaskRequest` 的 `每等价类合法值` 类（workspace.ts:32） | 待实现 |
| `UT-POLICY-131` | `collectOutputs`（`workspace.ts:32`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（workspace.ts:32） | 待实现 |
| `UT-POLICY-132` | `collectOutputs`（`workspace.ts:32`） | `纯函数/无副作用` × `非法值` | 参数 `task: TaskRequest` 的 `非法值` 类（workspace.ts:32） | 待实现 |
| `UT-POLICY-133` | `collectOutputs`（`workspace.ts:32`） | `字符串/路径/枚举输入` × `空` | 参数 `workspace: string` 的 `空` 类（workspace.ts:32） | 待实现 |
| `UT-POLICY-134` | `collectOutputs`（`workspace.ts:32`） | `字符串/路径/枚举输入` × `超长` | 参数 `workspace: string` 的 `超长` 类（workspace.ts:32） | 待实现 |
| `UT-POLICY-135` | `collectOutputs`（`workspace.ts:32`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `workspace: string` 的 `注入字符` 类（workspace.ts:32） | 待实现 |
| `UT-POLICY-136` | `collectOutputs`（`workspace.ts:32`） | `状态分支` × `合法迁移` | 分支 L34 `loop (task.output_paths)`（loop；workspace.ts） | 待实现 |
| `UT-POLICY-137` | `collectOutputs`（`workspace.ts:32`） | `状态分支` × `合法迁移` | 分支 L35 `if (!s.isFile())`（if；workspace.ts） | 待实现 |
| `UT-POLICY-138` | `collectOutputs`（`workspace.ts:32`） | `状态分支` × `合法迁移` | 分支 L35 `!s.isFile()`（!；workspace.ts） | 待实现 |
| `UT-POLICY-139` | `collectOutputs`（`workspace.ts:32`） | `错误路径` × `每个 typed 错误码` | 分支 L35 `catch ()`（catch；workspace.ts） | 待实现 |
| `UT-POLICY-140` | `collectOutputs`（`workspace.ts:32`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；workspace.ts:32） | 待实现 |
| `UT-POLICY-141` | `collectOutputs`（`workspace.ts:32`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2（无显式 throw，被调方拒绝必须 typed 化上抛；workspace.ts:32） | 待实现 |
| `UT-POLICY-142` | `collectOutputs`（`workspace.ts:32`） | `资源获取/释放` × `获取失败路径` | 资源操作 L35 `createHash`（workspace.ts） | 待实现 |
| `UT-POLICY-143` | `collectOutputs`（`workspace.ts:32`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L37 值 `out` 逐值断言（workspace.ts） | 待实现 |
| `UT-POLICY-144` | `ensureTaskDirs`（`workspace.ts:41`） | `字符串/路径/枚举输入` × `空` | 参数 `workspace: string` 的 `空` 类（workspace.ts:41） | 待实现 |
| `UT-POLICY-145` | `ensureTaskDirs`（`workspace.ts:41`） | `字符串/路径/枚举输入` × `超长` | 参数 `workspace: string` 的 `超长` 类（workspace.ts:41） | 待实现 |
| `UT-POLICY-146` | `ensureTaskDirs`（`workspace.ts:41`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `workspace: string` 的 `注入字符` 类（workspace.ts:41） | 待实现 |
| `UT-POLICY-147` | `ensureTaskDirs`（`workspace.ts:41`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `task: TaskRequest` 的 `每等价类合法值` 类（workspace.ts:41） | 待实现 |
| `UT-POLICY-148` | `ensureTaskDirs`（`workspace.ts:41`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（workspace.ts:41） | 待实现 |
| `UT-POLICY-149` | `ensureTaskDirs`（`workspace.ts:41`） | `纯函数/无副作用` × `非法值` | 参数 `task: TaskRequest` 的 `非法值` 类（workspace.ts:41） | 待实现 |
| `UT-POLICY-150` | `ensureTaskDirs`（`workspace.ts:41`） | `状态分支` × `合法迁移` | 分支 L44 `loop ([...task.permissions.write_paths, ...ta…`（loop；workspace.ts） | 待实现 |
| `UT-POLICY-151` | `ensureTaskDirs`（`workspace.ts:41`） | `状态分支` × `合法迁移` | 分支 L46 `if (!inside(workspace, abs))`（if；workspace.ts） | 待实现 |
| `UT-POLICY-152` | `ensureTaskDirs`（`workspace.ts:41`） | `状态分支` × `合法迁移` | 分支 L46 `!inside(workspace, abs)`（!；workspace.ts） | 待实现 |
| `UT-POLICY-153` | `ensureTaskDirs`（`workspace.ts:41`） | `状态分支` × `合法迁移` | 分支 L49 `loop (dirs)`（loop；workspace.ts） | 待实现 |
| `UT-POLICY-154` | `ensureTaskDirs`（`workspace.ts:41`） | `状态分支` × `合法迁移` | 分支 L50 `if (!inside(workspace, d))`（if；workspace.ts） | 待实现 |
| `UT-POLICY-155` | `ensureTaskDirs`（`workspace.ts:41`） | `状态分支` × `合法迁移` | 分支 L50 `!inside(workspace, d)`（!；workspace.ts） | 待实现 |
| `UT-POLICY-156` | `ensureTaskDirs`（`workspace.ts:41`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1（无显式 throw，被调方拒绝必须 typed 化上抛；workspace.ts:41） | 待实现 |
| `UT-POLICY-157` | `resolveWorkspace`（`workspace.ts:9`） | `字符串/路径/枚举输入` × `空` | 参数 `ref: string` 的 `空` 类（workspace.ts:9） | 待实现 |
| `UT-POLICY-158` | `resolveWorkspace`（`workspace.ts:9`） | `字符串/路径/枚举输入` × `超长` | 参数 `ref: string` 的 `超长` 类（workspace.ts:9） | 待实现 |
| `UT-POLICY-159` | `resolveWorkspace`（`workspace.ts:9`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `ref: string` 的 `注入字符` 类（workspace.ts:9） | 待实现 |
| `UT-POLICY-160` | `resolveWorkspace`（`workspace.ts:9`） | `字符串/路径/枚举输入` × `空` | 参数 `roots: Record<string,string>` 的 `空` 类（workspace.ts:9） | 待实现 |
| `UT-POLICY-161` | `resolveWorkspace`（`workspace.ts:9`） | `字符串/路径/枚举输入` × `超长` | 参数 `roots: Record<string,string>` 的 `超长` 类（workspace.ts:9） | 待实现 |
| `UT-POLICY-162` | `resolveWorkspace`（`workspace.ts:9`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `roots: Record<string,string>` 的 `注入字符` 类（workspace.ts:9） | 待实现 |
| `UT-POLICY-163` | `resolveWorkspace`（`workspace.ts:9`） | `状态分支` × `合法迁移` | 分支 L10 `if (!configured)`（if；workspace.ts） | 待实现 |
| `UT-POLICY-164` | `resolveWorkspace`（`workspace.ts:9`） | `状态分支` × `合法迁移` | 分支 L10 `!configured`（!；workspace.ts） | 待实现 |
| `UT-POLICY-165` | `resolveWorkspace`（`workspace.ts:9`） | `错误路径` × `每个 typed 错误码` | throw L10 `InvalidWorkspace`（守卫 `if (!configured)`；workspace.ts） | 待实现 |
| `UT-POLICY-166` | `resolveWorkspace`（`workspace.ts:9`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L11 值 `realpath(configured)` 逐值断言（workspace.ts） | 待实现 |
