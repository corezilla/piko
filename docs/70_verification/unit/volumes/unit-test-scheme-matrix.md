# UT 分卷登记 · MATRIX（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：213**（对象类型分布：字符串/路径/枚举输入 50；状态分支 94；错误路径 23；纯函数/无副作用 38；数值/长度上限参数 3；资源获取/释放 4；时间域行为 1）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-MATRIX-014` | `verifyDiscussion`（`matrix.ts:101`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（matrix.ts:101） | 待实现 |
| `UT-MATRIX-015` | `verifyDiscussion`（`matrix.ts:101`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（matrix.ts:101） | 待实现 |
| `UT-MATRIX-016` | `verifyDiscussion`（`matrix.ts:101`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（matrix.ts:101） | 待实现 |
| `UT-MATRIX-017` | `verifyDiscussion`（`matrix.ts:101`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（matrix.ts:101） | 待实现 |
| `UT-MATRIX-018` | `verifyDiscussion`（`matrix.ts:101`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（matrix.ts:101） | 待实现 |
| `UT-MATRIX-019` | `verifyDiscussion`（`matrix.ts:101`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（matrix.ts:101） | 待实现 |
| `UT-MATRIX-020` | `verifyDiscussion`（`matrix.ts:101`） | `状态分支` × `合法迁移` | 分支 L102 `!this.client\|\|!this.started`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-021` | `verifyDiscussion`（`matrix.ts:101`） | `状态分支` × `合法迁移` | 分支 L102 `!this.client`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-022` | `verifyDiscussion`（`matrix.ts:101`） | `状态分支` × `合法迁移` | 分支 L102 `!this.started`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-023` | `verifyDiscussion`（`matrix.ts:101`） | `状态分支` × `合法迁移` | 分支 L103 `!joined.includes(room)`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-024` | `verifyDiscussion`（`matrix.ts:101`） | `状态分支` × `合法迁移` | 分支 L105 `? typeof e.content?.body==="string" :`（ternary；matrix.ts） | 待实现 |
| `UT-MATRIX-025` | `verifyDiscussion`（`matrix.ts:101`） | `状态分支` × `合法迁移` | 分支 L105 `e.content?.body`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-026` | `verifyDiscussion`（`matrix.ts:101`） | `错误路径` × `每个 typed 错误码` | throw L102 `Matrix is not ready`（守卫 `if (!this.client\|\|!this.started)`；matrix.ts） | 待实现 |
| `UT-MATRIX-027` | `verifyDiscussion`（`matrix.ts:101`） | `错误路径` × `每个 typed 错误码` | throw L103 `Piko is not joined to discussion room`（守卫 `if (!joined.includes(room))`；matrix.ts） | 待实现 |
| `UT-MATRIX-028` | `verifyDiscussion`（`matrix.ts:101`） | `错误路径` × `每个 typed 错误码` | throw L104 `discussion trigger is not in the requested room`（守卫 `if (e.room_id!==room)`；matrix.ts） | 待实现 |
| `UT-MATRIX-029` | `verifyDiscussion`（`matrix.ts:101`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L105 值 `typeof e.content?.body==="string"?e.con…` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-030` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-031` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-032` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-033` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `空` | 参数 `txnId: string` 的 `空` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-034` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `超长` | 参数 `txnId: string` 的 `超长` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-035` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `txnId: string` 的 `注入字符` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-036` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `空` | 参数 `body: string` 的 `空` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-037` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `超长` | 参数 `body: string` 的 `超长` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-038` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `body: string` 的 `注入字符` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-039` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `空` | 参数 `replyTo: string` 的 `空` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-040` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `超长` | 参数 `replyTo: string` 的 `超长` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-041` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `replyTo: string` 的 `注入字符` 类（matrix.ts:107） | 待实现 |
| `UT-MATRIX-042` | `send`（`matrix.ts:107`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `replyTo` 缺省/显式两态（matrix.ts:107） | 待实现 |
| `UT-MATRIX-043` | `send`（`matrix.ts:107`） | `状态分支` × `合法迁移` | 分支 L108 `!this.client`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-044` | `send`（`matrix.ts:107`） | `状态分支` × `合法迁移` | 分支 L110 `if (replyTo)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-045` | `send`（`matrix.ts:107`） | `错误路径` × `每个 typed 错误码` | throw L108 `Matrix disabled`（守卫 `if (!this.client)`；matrix.ts） | 待实现 |
| `UT-MATRIX-046` | `send`（`matrix.ts:107`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L111 值 `this.client.sendEvent(room,"m.room.mess…` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-047` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `空` | 参数 `run: string` 的 `空` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-048` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `超长` | 参数 `run: string` 的 `超长` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-049` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `run: string` 的 `注入字符` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-050` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-051` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-052` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-053` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-054` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-055` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-056` | `sendDiscussionReply`（`matrix.ts:113`） | `数值/长度上限参数` × `恰好通过` | 参数 `turn: number` 的 `恰好通过` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-057` | `sendDiscussionReply`（`matrix.ts:113`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `turn: number` 的 `+1 拒绝` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-058` | `sendDiscussionReply`（`matrix.ts:113`） | `数值/长度上限参数` × `−1 通过` | 参数 `turn: number` 的 `−1 通过` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-059` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `空` | 参数 `body: string` 的 `空` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-060` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `超长` | 参数 `body: string` 的 `超长` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-061` | `sendDiscussionReply`（`matrix.ts:113`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `body: string` 的 `注入字符` 类（matrix.ts:113） | 待实现 |
| `UT-MATRIX-062` | `sendDiscussionReply`（`matrix.ts:113`） | `状态分支` × `合法迁移` | 分支 L114 `if (prepared.state==="Sent")`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-063` | `sendDiscussionReply`（`matrix.ts:113`） | `错误路径` × `每个 typed 错误码` | 分支 L115 `catch (error)`（catch；matrix.ts） | 待实现 |
| `UT-MATRIX-064` | `sendDiscussionReply`（`matrix.ts:113`） | `错误路径` × `每个 typed 错误码` | throw L115 `reject`（守卫 `catch`；matrix.ts） | 待实现 |
| `UT-MATRIX-065` | `sendDiscussionReply`（`matrix.ts:113`） | `资源获取/释放` × `获取失败路径` | 资源操作 L114 `createHash`（matrix.ts） | 待实现 |
| `UT-MATRIX-066` | `sendDiscussionReply`（`matrix.ts:113`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L114 值 `prepared.event_id` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-067` | `sendDiscussionReply`（`matrix.ts:113`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L115 值 `result.event_id` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-068` | `close`（`matrix.ts:117`） | `状态分支` × `合法迁移` | 分支 L117 `if (this.client)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-069` | `close`（`matrix.ts:117`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `被调方` 拒绝必须 typed 化上抛（matrix.ts:117） | 待实现 |
| `UT-MATRIX-070` | `close`（`matrix.ts:117`） | `状态分支` × `合法迁移` | 状态写 L117 → `this.started`（matrix.ts） | 待实现 |
| `UT-MATRIX-071` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `error: unknown` 的 `每等价类合法值` 类（matrix.ts:120） | 待实现 |
| `UT-MATRIX-072` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `error: unknown` 的 `边界(上/下/零/空/满)` 类（matrix.ts:120） | 待实现 |
| `UT-MATRIX-073` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `非法值` | 参数 `error: unknown` 的 `非法值` 类（matrix.ts:120） | 待实现 |
| `UT-MATRIX-074` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L121 `if (!error\|\|typeof error!=="object")`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-075` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L121 `!error\|\|typeof error!=="object"`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-076` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L121 `!error`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-077` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L123 `e.errcode??e.data?.errcode`（??；matrix.ts） | 待实现 |
| `UT-MATRIX-078` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L123 `e.data?.errcode`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-079` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L124 `if (code==="M_UNKNOWN_TOKEN"\|\|code==="M_FORBI…`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-080` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L124 `code==="M_UNKNOWN_TOKEN"\|\|code==="M_FORBIDDEN…`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-081` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L124 `code==="M_UNKNOWN_TOKEN"\|\|code==="M_FORBIDDEN"`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-082` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L125 `if (typeof e.httpStatus==="number"&&e.httpSta…`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-083` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L125 `typeof e.httpStatus==="number"&&e.httpStatus>…`（&&；matrix.ts） | 待实现 |
| `UT-MATRIX-084` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L126 `e.message??""`（??；matrix.ts） | 待实现 |
| `UT-MATRIX-085` | `isPermanentMatrixError`（`matrix.ts:120`） | `状态分支` × `合法迁移` | 分支 L127 `if (/credential identity mismatch\|no longer j…`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-086` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L121 值 `false` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-087` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L124 值 `true` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-088` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L125 值 `true` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-089` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L127 值 `true` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-090` | `isPermanentMatrixError`（`matrix.ts:120`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L128 值 `false` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-091` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-092` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `config: RuntimeConfig` 的 `边界(上/下/零/空/满)` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-093` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `纯函数/无副作用` × `非法值` | 参数 `config: RuntimeConfig` 的 `非法值` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-094` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStore` 的 `每等价类合法值` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-095` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-096` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStore` 的 `非法值` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-097` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `字符串/路径/枚举输入` × `空` | 参数 `token: string` 的 `空` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-098` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `字符串/路径/枚举输入` × `超长` | 参数 `token: string` 的 `超长` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-099` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `token: string` 的 `注入字符` 类（matrix.ts:14） | 待实现 |
| `UT-MATRIX-100` | `MatrixRuntime.constructor`（`matrix.ts:14`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `token` 缺省/显式两态（matrix.ts:14） | 待实现 |
| `UT-MATRIX-101` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L16 `if (!this.config.matrix.enabled)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-102` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L16 `!this.config.matrix.enabled`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-103` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L19 `if (cursor)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-104` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `if (state!=="PREPARED"&&state!=="SYNCING")`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-105` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `state!=="PREPARED"&&state!=="SYNCING"`（&&；matrix.ts） | 待实现 |
| `UT-MATRIX-106` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `this.client?.getSyncStateData()?.nextSyncToken`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-107` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `this.client?.getSyncStateData`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-108` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `if (!next)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-109` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `!next`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-110` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `if (!readySettled)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-111` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `!readySettled`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-112` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `if (!readySettled\|\|permanent)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-113` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `!readySettled\|\|permanent`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-114` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L22 `this.client?.stopClient`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-115` | `start`（`matrix.ts:15`） | `时间域行为` × `超时边界 ±1 tick` | 分支 L23 `this.config.matrix.sync_timeout_ms??30000`（??；matrix.ts） | 待实现 |
| `UT-MATRIX-116` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L26 `if (!readySettled)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-117` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 分支 L26 `!readySettled`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-118` | `start`（`matrix.ts:15`） | `错误路径` × `每个 typed 错误码` | throw L18 `Matrix credential identity mismatch`（守卫 `if (who.user_id!==this.config.matrix.us…`；matrix.ts） | 待实现 |
| `UT-MATRIX-119` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 状态写 L17 → `this.client`（matrix.ts） | 待实现 |
| `UT-MATRIX-120` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 状态写 L22 → `this.syncWork`（matrix.ts） | 待实现 |
| `UT-MATRIX-121` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 状态写 L25 → `this.membershipTimer`（matrix.ts） | 待实现 |
| `UT-MATRIX-122` | `start`（`matrix.ts:15`） | `状态分支` × `合法迁移` | 状态写 L27 → `this.started`（matrix.ts） | 待实现 |
| `UT-MATRIX-123` | `start`（`matrix.ts:15`） | `资源获取/释放` × `获取失败路径` | 资源操作 L25 `setInterval`（matrix.ts） | 待实现 |
| `UT-MATRIX-124` | `start`（`matrix.ts:15`） | `资源获取/释放` × `获取失败路径` | 资源操作 L26 `setTimeout`（matrix.ts） | 待实现 |
| `UT-MATRIX-125` | `start`（`matrix.ts:15`） | `资源获取/释放` × `正常释放` | 资源操作 L26 `clearTimeout`（matrix.ts） | 待实现 |
| `UT-MATRIX-126` | `start`（`matrix.ts:15`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L16 值 `（无值 return：提前退出）` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-127` | `start`（`matrix.ts:15`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L22 值 `（无值 return：提前退出）` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-128` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `event: MatrixEvent` 的 `每等价类合法值` 类（matrix.ts:29） | 待实现 |
| `UT-MATRIX-129` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `event: MatrixEvent` 的 `边界(上/下/零/空/满)` 类（matrix.ts:29） | 待实现 |
| `UT-MATRIX-130` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `非法值` | 参数 `event: MatrixEvent` 的 `非法值` 类（matrix.ts:29） | 待实现 |
| `UT-MATRIX-131` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L30 `if (event.getType()!=="m.room.message")`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-132` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L31 `if (!room\|\|!id)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-133` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L31 `!room\|\|!id`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-134` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L31 `!room`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-135` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L31 `!id`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-136` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L32 `event.getSender()??""`（??；matrix.ts） | 待实现 |
| `UT-MATRIX-137` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L32 `event.getUnsigned()?.transaction_id`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-138` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L33 `if (sender===this.config.matrix.user_id)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-139` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L34 `if (typeof content.msgtype!=="string"\|\|!["m.t…`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-140` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L34 `typeof content.msgtype!=="string"\|\|!["m.text"…`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-141` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L34 `!["m.text","m.file","m.image","m.audio","m.vi…`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-142` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L35 `if (this.store.hasMatrixEvent(room,id))`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-143` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L36 `loop (this.store.openDiscussionRuns(room))`（loop；matrix.ts） | 待实现 |
| `UT-MATRIX-144` | `prepareEvent`（`matrix.ts:29`） | `状态分支` × `合法迁移` | 分支 L38 `if (content.msgtype!=="m.text")`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-145` | `prepareEvent`（`matrix.ts:29`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.downloadMedia(run,id,content` 拒绝必须 typed 化上抛（matrix.ts:29） | 待实现 |
| `UT-MATRIX-146` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L30 值 `undefined` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-147` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L31 值 `（无值 return：提前退出）` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-148` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L33 值 `{room,event:id,sender,txn,turns:[]}` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-149` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L34 值 `（无值 return：提前退出）` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-150` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L35 值 `undefined` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-151` | `prepareEvent`（`matrix.ts:29`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L41 值 `{room,event:id,sender,txn,turns}` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-152` | `auditMembership`（`matrix.ts:48`） | `状态分支` × `合法迁移` | 分支 L51 `loop (this.store.discussionRoomsInUse())`（loop；matrix.ts） | 待实现 |
| `UT-MATRIX-153` | `auditMembership`（`matrix.ts:48`） | `状态分支` × `合法迁移` | 分支 L52 `if (!joined.has(room))`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-154` | `auditMembership`（`matrix.ts:48`） | `状态分支` × `合法迁移` | 分支 L52 `!joined.has(room)`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-155` | `auditMembership`（`matrix.ts:48`） | `错误路径` × `每个 typed 错误码` | 分支 L57 `catch ()`（catch；matrix.ts） | 待实现 |
| `UT-MATRIX-156` | `auditMembership`（`matrix.ts:48`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.client!.getJoinedRooms(` 拒绝必须 typed 化上抛（matrix.ts:48） | 待实现 |
| `UT-MATRIX-157` | `isJoined`（`matrix.ts:63`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（matrix.ts:63） | 待实现 |
| `UT-MATRIX-158` | `isJoined`（`matrix.ts:63`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（matrix.ts:63） | 待实现 |
| `UT-MATRIX-159` | `isJoined`（`matrix.ts:63`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（matrix.ts:63） | 待实现 |
| `UT-MATRIX-160` | `isJoined`（`matrix.ts:63`） | `错误路径` × `每个 typed 错误码` | 分支 L67 `catch ()`（catch；matrix.ts） | 待实现 |
| `UT-MATRIX-161` | `isJoined`（`matrix.ts:63`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.client!.getJoinedRooms(` 拒绝必须 typed 化上抛（matrix.ts:63） | 待实现 |
| `UT-MATRIX-162` | `isJoined`（`matrix.ts:63`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L66 值 `joined.joined_rooms.includes(room)` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-163` | `isJoined`（`matrix.ts:63`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L68 值 `true` 逐值断言（matrix.ts） | 待实现 |
| `UT-MATRIX-164` | `recordDiscussionAccessLost`（`matrix.ts:73`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（matrix.ts:73） | 待实现 |
| `UT-MATRIX-165` | `recordDiscussionAccessLost`（`matrix.ts:73`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（matrix.ts:73） | 待实现 |
| `UT-MATRIX-166` | `recordDiscussionAccessLost`（`matrix.ts:73`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（matrix.ts:73） | 待实现 |
| `UT-MATRIX-167` | `processBatch`（`matrix.ts:79`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `events: MatrixEvent[]` 的 `每等价类合法值` 类（matrix.ts:79） | 待实现 |
| `UT-MATRIX-168` | `processBatch`（`matrix.ts:79`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `events: MatrixEvent[]` 的 `边界(上/下/零/空/满)` 类（matrix.ts:79） | 待实现 |
| `UT-MATRIX-169` | `processBatch`（`matrix.ts:79`） | `纯函数/无副作用` × `非法值` | 参数 `events: MatrixEvent[]` 的 `非法值` 类（matrix.ts:79） | 待实现 |
| `UT-MATRIX-170` | `processBatch`（`matrix.ts:79`） | `字符串/路径/枚举输入` × `空` | 参数 `cursor: string` 的 `空` 类（matrix.ts:79） | 待实现 |
| `UT-MATRIX-171` | `processBatch`（`matrix.ts:79`） | `字符串/路径/枚举输入` × `超长` | 参数 `cursor: string` 的 `超长` 类（matrix.ts:79） | 待实现 |
| `UT-MATRIX-172` | `processBatch`（`matrix.ts:79`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `cursor: string` 的 `注入字符` 类（matrix.ts:79） | 待实现 |
| `UT-MATRIX-173` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L80 `!!room&&this.store.openDiscussionRuns(room).l…`（&&；matrix.ts） | 待实现 |
| `UT-MATRIX-174` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L80 `!!room`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-175` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L80 `!room`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-176` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L86 `if (rooms.size)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-177` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L86 `loop (rooms)`（loop；matrix.ts） | 待实现 |
| `UT-MATRIX-178` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L86 `if (!joined.has(room))`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-179` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L86 `!joined.has(room)`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-180` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L88 `loop (events)`（loop；matrix.ts） | 待实现 |
| `UT-MATRIX-181` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L88 `if (!room\|\|!allowed.has(room))`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-182` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L88 `!room\|\|!allowed.has(room)`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-183` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L88 `!room`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-184` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L88 `!allowed.has(room)`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-185` | `processBatch`（`matrix.ts:79`） | `状态分支` × `合法迁移` | 分支 L88 `if (item)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-186` | `processBatch`（`matrix.ts:79`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #1：被调方 `this.client!.getJoinedRooms(` 拒绝必须 typed 化上抛（matrix.ts:79） | 待实现 |
| `UT-MATRIX-187` | `processBatch`（`matrix.ts:79`） | `错误路径` × `每个 typed 错误码` | await 拒绝传播 #2：被调方 `this.prepareEvent(event` 拒绝必须 typed 化上抛（matrix.ts:79） | 待实现 |
| `UT-MATRIX-188` | `downloadMedia`（`matrix.ts:91`） | `字符串/路径/枚举输入` × `空` | 参数 `run: string` 的 `空` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-189` | `downloadMedia`（`matrix.ts:91`） | `字符串/路径/枚举输入` × `超长` | 参数 `run: string` 的 `超长` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-190` | `downloadMedia`（`matrix.ts:91`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `run: string` 的 `注入字符` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-191` | `downloadMedia`（`matrix.ts:91`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-192` | `downloadMedia`（`matrix.ts:91`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-193` | `downloadMedia`（`matrix.ts:91`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-194` | `downloadMedia`（`matrix.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `content: any` 的 `每等价类合法值` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-195` | `downloadMedia`（`matrix.ts:91`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `content: any` 的 `边界(上/下/零/空/满)` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-196` | `downloadMedia`（`matrix.ts:91`） | `纯函数/无副作用` × `非法值` | 参数 `content: any` 的 `非法值` 类（matrix.ts:91） | 待实现 |
| `UT-MATRIX-197` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L92 `!this.client\|\|typeof content.url!=="string"\|\|…`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-198` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L92 `!this.client\|\|typeof content.url!=="string"`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-199` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L92 `!this.client`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-200` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L92 `!content.url.startsWith("mxc://")`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-201` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L93 `content.info?.size`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-202` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L93 `typeof declaredSize!=="number"\|\|declaredSize<…`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-203` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L93 `typeof declaredSize!=="number"\|\|declaredSize<0`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-204` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L93 `this.config.matrix.max_media_bytes??0`（??；matrix.ts） | 待实现 |
| `UT-MATRIX-205` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L94 `content.info?.mimetype`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-206` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L94 `typeof declaredMime!=="string"\|\|!this.config.…`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-207` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L94 `!this.config.matrix.allowed_mime_types?.inclu…`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-208` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L94 `this.config.matrix.allowed_mime_types?.includ…`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-209` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L95 `!url`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-210` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L96 `!response.ok\|\|!response.body`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-211` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L96 `!response.ok`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-212` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L96 `!response.body`（!；matrix.ts） | 待实现 |
| `UT-MATRIX-213` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L97 `response.headers.get("content-type")?.split`（?.；matrix.ts） | 待实现 |
| `UT-MATRIX-214` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L98 `loop ()`（loop；matrix.ts） | 待实现 |
| `UT-MATRIX-215` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L98 `if (x.done)`（if；matrix.ts） | 待实现 |
| `UT-MATRIX-216` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L98 `this.config.matrix.max_media_bytes??0`（??；matrix.ts） | 待实现 |
| `UT-MATRIX-217` | `downloadMedia`（`matrix.ts:91`） | `状态分支` × `合法迁移` | 分支 L99 `basename(content.body).replace(/[^A-Za-z0-9._…`（\|\|；matrix.ts） | 待实现 |
| `UT-MATRIX-218` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L92 `invalid Matrix media URL`（守卫 `if (!this.client\|\|typeof content.url!==…`；matrix.ts） | 待实现 |
| `UT-MATRIX-219` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L93 `Matrix media size is not allowed`（守卫 `if (typeof declaredSize!=="number"\|\|dec…`；matrix.ts） | 待实现 |
| `UT-MATRIX-220` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L94 `Matrix media MIME is not allowed`（守卫 `if (typeof declaredMime!=="string"\|\|!th…`；matrix.ts） | 待实现 |
| `UT-MATRIX-221` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L95 `cannot resolve Matrix media URL`（守卫 `if (!url)`；matrix.ts） | 待实现 |
| `UT-MATRIX-222` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L96 `reject`（守卫 `if (!response.ok\|\|!response.body)`；matrix.ts） | 待实现 |
| `UT-MATRIX-223` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L97 `Matrix media MIME mismatch`（守卫 `if (actualMime!==declaredMime)`；matrix.ts） | 待实现 |
| `UT-MATRIX-224` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L98 `Matrix media exceeds limit`（守卫 `if (size>(this.config.matrix.max_media_…`；matrix.ts） | 待实现 |
| `UT-MATRIX-225` | `downloadMedia`（`matrix.ts:91`） | `错误路径` × `每个 typed 错误码` | throw L98 `Matrix media size mismatch`（守卫 `if (size!==declaredSize)`；matrix.ts） | 待实现 |
| `UT-MATRIX-226` | `downloadMedia`（`matrix.ts:91`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L99 值 ``[Matrix attachment: ${target} (${actua…` 逐值断言（matrix.ts） | 待实现 |
