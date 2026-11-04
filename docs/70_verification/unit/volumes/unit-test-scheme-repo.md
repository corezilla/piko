# UT 分卷登记 · REPO（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：612**（对象类型分布：纯函数/无副作用 125；错误路径 21；持久化/序列化 61；字符串/路径/枚举输入 228；数值/长度上限参数 39；状态分支 125；并发/可重入 10；资源获取/释放 3）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-REPO-052` | `tx`（`store.ts:170`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `fn: () => T` 的 `每等价类合法值` 类（store.ts:170） | 待实现 |
| `UT-REPO-053` | `tx`（`store.ts:170`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `fn: () => T` 的 `边界(上/下/零/空/满)` 类（store.ts:170） | 待实现 |
| `UT-REPO-054` | `tx`（`store.ts:170`） | `纯函数/无副作用` × `非法值` | 参数 `fn: () => T` 的 `非法值` 类（store.ts:170） | 待实现 |
| `UT-REPO-055` | `tx`（`store.ts:170`） | `错误路径` × `每个 typed 错误码` | 分支 L176 `catch (e)`（catch；store.ts） | 待实现 |
| `UT-REPO-056` | `tx`（`store.ts:170`） | `错误路径` × `每个 typed 错误码` | throw L178 `reject`（守卫 `catch`；store.ts） | 待实现 |
| `UT-REPO-057` | `tx`（`store.ts:170`） | `持久化/序列化` × `round-trip` | 状态写 L171 → `db`（store.ts） | 待实现 |
| `UT-REPO-058` | `tx`（`store.ts:170`） | `持久化/序列化` × `round-trip` | 状态写 L174 → `db`（store.ts） | 待实现 |
| `UT-REPO-059` | `tx`（`store.ts:170`） | `持久化/序列化` × `round-trip` | 状态写 L177 → `db`（store.ts） | 待实现 |
| `UT-REPO-060` | `tx`（`store.ts:170`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L175 值 `x` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-061` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `task: TaskRequest` 的 `每等价类合法值` 类（store.ts:183） | 待实现 |
| `UT-REPO-062` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `task: TaskRequest` 的 `边界(上/下/零/空/满)` 类（store.ts:183） | 待实现 |
| `UT-REPO-063` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `非法值` | 参数 `task: TaskRequest` 的 `非法值` 类（store.ts:183） | 待实现 |
| `UT-REPO-064` | `createOrGet`（`store.ts:183`） | `字符串/路径/枚举输入` × `空` | 参数 `principal: string` 的 `空` 类（store.ts:183） | 待实现 |
| `UT-REPO-065` | `createOrGet`（`store.ts:183`） | `字符串/路径/枚举输入` × `超长` | 参数 `principal: string` 的 `超长` 类（store.ts:183） | 待实现 |
| `UT-REPO-066` | `createOrGet`（`store.ts:183`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `principal: string` 的 `注入字符` 类（store.ts:183） | 待实现 |
| `UT-REPO-067` | `createOrGet`（`store.ts:183`） | `数值/长度上限参数` × `恰好通过` | 参数 `capacity: number` 的 `恰好通过` 类（store.ts:183） | 待实现 |
| `UT-REPO-068` | `createOrGet`（`store.ts:183`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `capacity: number` 的 `+1 拒绝` 类（store.ts:183） | 待实现 |
| `UT-REPO-069` | `createOrGet`（`store.ts:183`） | `数值/长度上限参数` × `−1 通过` | 参数 `capacity: number` 的 `−1 通过` 类（store.ts:183） | 待实现 |
| `UT-REPO-070` | `createOrGet`（`store.ts:183`） | `字符串/路径/枚举输入` × `空` | 参数 `triggerContent: string` 的 `空` 类（store.ts:183） | 待实现 |
| `UT-REPO-071` | `createOrGet`（`store.ts:183`） | `字符串/路径/枚举输入` × `超长` | 参数 `triggerContent: string` 的 `超长` 类（store.ts:183） | 待实现 |
| `UT-REPO-072` | `createOrGet`（`store.ts:183`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `triggerContent: string` 的 `注入字符` 类（store.ts:183） | 待实现 |
| `UT-REPO-073` | `createOrGet`（`store.ts:183`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `triggerContent` 缺省/显式两态（store.ts:183） | 待实现 |
| `UT-REPO-074` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L186 `if (old)`（if；store.ts） | 待实现 |
| `UT-REPO-075` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L187 `if (old.identity_state === "Tombstone")`（if；store.ts） | 待实现 |
| `UT-REPO-076` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L188 `if (!sameTask(JSON.parse(old.task_json), task…`（if；store.ts） | 待实现 |
| `UT-REPO-077` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L188 `!sameTask(JSON.parse(old.task_json), task)`（!；store.ts） | 待实现 |
| `UT-REPO-078` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L193 `if (q >= capacity)`（if；store.ts） | 待实现 |
| `UT-REPO-079` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L196 `? task.input_refs?.length :`（ternary；store.ts） | 待实现 |
| `UT-REPO-080` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L196 `task.input_refs?.length`（?.；store.ts） | 待实现 |
| `UT-REPO-081` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L209 `? task.discussion :`（ternary；store.ts） | 待实现 |
| `UT-REPO-082` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L214 `if (task.discussion)`（if；store.ts） | 待实现 |
| `UT-REPO-083` | `createOrGet`（`store.ts:183`） | `状态分支` × `合法迁移` | 分支 L219 `triggerContent ?? ""`（??；store.ts） | 待实现 |
| `UT-REPO-084` | `createOrGet`（`store.ts:183`） | `持久化/序列化` × `round-trip` | 状态写 L198 → `db`（store.ts） | 待实现 |
| `UT-REPO-085` | `createOrGet`（`store.ts:183`） | `持久化/序列化` × `round-trip` | 状态写 L203 → `db`（store.ts） | 待实现 |
| `UT-REPO-086` | `createOrGet`（`store.ts:183`） | `持久化/序列化` × `round-trip` | 状态写 L215 → `db`（store.ts） | 待实现 |
| `UT-REPO-087` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L184 值 `this.tx(() => { const old = this.db.pre…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-088` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L187 值 `{ kind: "tombstone" }` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-089` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L188 值 `{ kind: "conflict" }` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-090` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L190 值 `{ kind: "existing", task_id: task.task_…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-091` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L193 值 `{ kind: "queue_full" }` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-092` | `createOrGet`（`store.ts:183`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L221 值 `{ kind: "created", task_id: task.task_i…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-093` | `getTask`（`store.ts:225`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:225） | 待实现 |
| `UT-REPO-094` | `getTask`（`store.ts:225`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:225） | 待实现 |
| `UT-REPO-095` | `getTask`（`store.ts:225`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:225） | 待实现 |
| `UT-REPO-096` | `getTask`（`store.ts:225`） | `状态分支` × `合法迁移` | 分支 L227 `if (!r)`（if；store.ts） | 待实现 |
| `UT-REPO-097` | `getTask`（`store.ts:225`） | `状态分支` × `合法迁移` | 分支 L227 `!r`（!；store.ts） | 待实现 |
| `UT-REPO-098` | `getTask`（`store.ts:225`） | `错误路径` × `每个 typed 错误码` | throw L227 `NotFound`（守卫 `if (!r)`；store.ts） | 待实现 |
| `UT-REPO-099` | `getTask`（`store.ts:225`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L228 值 `JSON.parse(r.task_json)` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-100` | `mutateRun`（`store.ts:232`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `command: FencedRunCommand` 的 `每等价类合法值` 类（store.ts:232） | 待实现 |
| `UT-REPO-101` | `mutateRun`（`store.ts:232`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `command: FencedRunCommand` 的 `边界(上/下/零/空/满)` 类（store.ts:232） | 待实现 |
| `UT-REPO-102` | `mutateRun`（`store.ts:232`） | `纯函数/无副作用` × `非法值` | 参数 `command: FencedRunCommand` 的 `非法值` 类（store.ts:232） | 待实现 |
| `UT-REPO-103` | `mutateRun`（`store.ts:232`） | `状态分支` × `合法迁移` | 分支 L235 `if (!r)`（if；store.ts） | 待实现 |
| `UT-REPO-104` | `mutateRun`（`store.ts:232`） | `状态分支` × `合法迁移` | 分支 L235 `!r`（!；store.ts） | 待实现 |
| `UT-REPO-105` | `mutateRun`（`store.ts:232`） | `状态分支` × `合法迁移` | 分支 L236 `if (r.generation !== command.expected_generat…`（if；store.ts） | 待实现 |
| `UT-REPO-106` | `mutateRun`（`store.ts:232`） | `状态分支` × `合法迁移` | 分支 L237 `if (command.expected_state_in && !command.exp…`（if；store.ts） | 待实现 |
| `UT-REPO-107` | `mutateRun`（`store.ts:232`） | `状态分支` × `合法迁移` | 分支 L237 `command.expected_state_in && !command.expecte…`（&&；store.ts） | 待实现 |
| `UT-REPO-108` | `mutateRun`（`store.ts:232`） | `状态分支` × `合法迁移` | 分支 L237 `!command.expected_state_in.includes(r.state)`（!；store.ts） | 待实现 |
| `UT-REPO-109` | `mutateRun`（`store.ts:232`） | `并发/可重入` × `并发对偶/交错` | 分支 L240 `if (command.expected_lease_epoch !== undefine…`（if；store.ts） | 待实现 |
| `UT-REPO-110` | `mutateRun`（`store.ts:232`） | `并发/可重入` × `并发对偶/交错` | 分支 L242 `if (slot.task_id !== command.task_id \|\| slot.…`（if；store.ts） | 待实现 |
| `UT-REPO-111` | `mutateRun`（`store.ts:232`） | `并发/可重入` × `并发对偶/交错` | 分支 L242 `slot.task_id !== command.task_id \|\| slot.leas…`（\|\|；store.ts） | 待实现 |
| `UT-REPO-112` | `mutateRun`（`store.ts:232`） | `错误路径` × `每个 typed 错误码` | throw L235 `NotFound`（守卫 `if (!r)`；store.ts） | 待实现 |
| `UT-REPO-113` | `mutateRun`（`store.ts:232`） | `错误路径` × `每个 typed 错误码` | throw L236 `FencedWrite`（守卫 `if (r.generation !== command.expected_g…`；store.ts） | 待实现 |
| `UT-REPO-114` | `mutateRun`（`store.ts:232`） | `错误路径` × `每个 typed 错误码` | throw L238 `FencedWrite`（守卫 `if (command.expected_state_in && !comma…`；store.ts） | 待实现 |
| `UT-REPO-115` | `mutateRun`（`store.ts:232`） | `错误路径` × `每个 typed 错误码` | throw L243 `LeaseLost`（守卫 `if (slot.task_id !== command.task_id \|\|…`；store.ts） | 待实现 |
| `UT-REPO-116` | `mutateRun`（`store.ts:232`） | `持久化/序列化` × `round-trip` | 状态写 L248 → `db`（store.ts） | 待实现 |
| `UT-REPO-117` | `mutateRun`（`store.ts:232`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L233 值 `this.tx(() => { const r = this.db.prepa…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-118` | `mutateRun`（`store.ts:232`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L251 值 `next.generation` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-119` | `getRun`（`store.ts:255`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:255） | 待实现 |
| `UT-REPO-120` | `getRun`（`store.ts:255`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:255） | 待实现 |
| `UT-REPO-121` | `getRun`（`store.ts:255`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:255） | 待实现 |
| `UT-REPO-122` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L257 `if (!r)`（if；store.ts） | 待实现 |
| `UT-REPO-123` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L257 `!r`（!；store.ts） | 待实现 |
| `UT-REPO-124` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L259 `if (t?.identity_state === "Tombstone")`（if；store.ts） | 待实现 |
| `UT-REPO-125` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L259 `t?.identity_state`（?.；store.ts） | 待实现 |
| `UT-REPO-126` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L262 `!!this.db.prepare("SELECT 1 FROM results WHER…`（!；store.ts） | 待实现 |
| `UT-REPO-127` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L262 `!this.db.prepare("SELECT 1 FROM results WHERE…`（!；store.ts） | 待实现 |
| `UT-REPO-128` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L272 `!!r.cancel_requested`（!；store.ts） | 待实现 |
| `UT-REPO-129` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L272 `!r.cancel_requested`（!；store.ts） | 待实现 |
| `UT-REPO-130` | `getRun`（`store.ts:255`） | `状态分支` × `合法迁移` | 分支 L279 `? r.started_at :`（ternary；store.ts） | 待实现 |
| `UT-REPO-131` | `getRun`（`store.ts:255`） | `错误路径` × `每个 typed 错误码` | throw L259 `Gone`（守卫 `if (t?.identity_state === "Tombstone")`；store.ts） | 待实现 |
| `UT-REPO-132` | `getRun`（`store.ts:255`） | `错误路径` × `每个 typed 错误码` | throw L260 `NotFound`（守卫 `if (!r)`；store.ts） | 待实现 |
| `UT-REPO-133` | `getRun`（`store.ts:255`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L264 值 `{ task_id: r.task_id, state: r.state, g…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-134` | `setInputStaging`（`store.ts:288`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:288） | 待实现 |
| `UT-REPO-135` | `setInputStaging`（`store.ts:288`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:288） | 待实现 |
| `UT-REPO-136` | `setInputStaging`（`store.ts:288`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:288） | 待实现 |
| `UT-REPO-137` | `setInputStaging`（`store.ts:288`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `staging: InputStaging` 的 `每等价类合法值` 类（store.ts:288） | 待实现 |
| `UT-REPO-138` | `setInputStaging`（`store.ts:288`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `staging: InputStaging` 的 `边界(上/下/零/空/满)` 类（store.ts:288） | 待实现 |
| `UT-REPO-139` | `setInputStaging`（`store.ts:288`） | `纯函数/无副作用` × `非法值` | 参数 `staging: InputStaging` 的 `非法值` 类（store.ts:288） | 待实现 |
| `UT-REPO-140` | `setInputStaging`（`store.ts:288`） | `状态分支` × `合法迁移` | 分支 L293 `if (r.changes === 0)`（if；store.ts） | 待实现 |
| `UT-REPO-141` | `setInputStaging`（`store.ts:288`） | `错误路径` × `每个 typed 错误码` | throw L293 `TaskNotFound`（守卫 `if (r.changes === 0)`；store.ts） | 待实现 |
| `UT-REPO-142` | `setInputStaging`（`store.ts:288`） | `持久化/序列化` × `round-trip` | 状态写 L292 → `db`（store.ts） | 待实现 |
| `UT-REPO-143` | `setArtifactDelivery`（`store.ts:295`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:295） | 待实现 |
| `UT-REPO-144` | `setArtifactDelivery`（`store.ts:295`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:295） | 待实现 |
| `UT-REPO-145` | `setArtifactDelivery`（`store.ts:295`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:295） | 待实现 |
| `UT-REPO-146` | `setArtifactDelivery`（`store.ts:295`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `delivery: ArtifactDelivery` 的 `每等价类合法值` 类（store.ts:295） | 待实现 |
| `UT-REPO-147` | `setArtifactDelivery`（`store.ts:295`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `delivery: ArtifactDelivery` 的 `边界(上/下/零/空/满)` 类（store.ts:295） | 待实现 |
| `UT-REPO-148` | `setArtifactDelivery`（`store.ts:295`） | `纯函数/无副作用` × `非法值` | 参数 `delivery: ArtifactDelivery` 的 `非法值` 类（store.ts:295） | 待实现 |
| `UT-REPO-149` | `setArtifactDelivery`（`store.ts:295`） | `状态分支` × `合法迁移` | 分支 L297 `if (r.changes === 0)`（if；store.ts） | 待实现 |
| `UT-REPO-150` | `setArtifactDelivery`（`store.ts:295`） | `错误路径` × `每个 typed 错误码` | throw L297 `TaskNotFound`（守卫 `if (r.changes === 0)`；store.ts） | 待实现 |
| `UT-REPO-151` | `setArtifactDelivery`（`store.ts:295`） | `持久化/序列化` × `round-trip` | 状态写 L296 → `db`（store.ts） | 待实现 |
| `UT-REPO-152` | `inputStaging`（`store.ts:299`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:299） | 待实现 |
| `UT-REPO-153` | `inputStaging`（`store.ts:299`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:299） | 待实现 |
| `UT-REPO-154` | `inputStaging`（`store.ts:299`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:299） | 待实现 |
| `UT-REPO-155` | `inputStaging`（`store.ts:299`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L300 值 `JSON.parse((this.db.prepare("SELECT inp…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-156` | `tryClaimSlot`（`store.ts:304`） | `字符串/路径/枚举输入` × `空` | 参数 `owner: string` 的 `空` 类（store.ts:304） | 待实现 |
| `UT-REPO-157` | `tryClaimSlot`（`store.ts:304`） | `字符串/路径/枚举输入` × `超长` | 参数 `owner: string` 的 `超长` 类（store.ts:304） | 待实现 |
| `UT-REPO-158` | `tryClaimSlot`（`store.ts:304`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `owner: string` 的 `注入字符` 类（store.ts:304） | 待实现 |
| `UT-REPO-159` | `tryClaimSlot`（`store.ts:304`） | `字符串/路径/枚举输入` × `空` | 参数 `boot: string` 的 `空` 类（store.ts:304） | 待实现 |
| `UT-REPO-160` | `tryClaimSlot`（`store.ts:304`） | `字符串/路径/枚举输入` × `超长` | 参数 `boot: string` 的 `超长` 类（store.ts:304） | 待实现 |
| `UT-REPO-161` | `tryClaimSlot`（`store.ts:304`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `boot: string` 的 `注入字符` 类（store.ts:304） | 待实现 |
| `UT-REPO-162` | `tryClaimSlot`（`store.ts:304`） | `并发/可重入` × `并发对偶/交错` | 分支 L307 `if (slot.task_id)`（if；store.ts） | 待实现 |
| `UT-REPO-163` | `tryClaimSlot`（`store.ts:304`） | `状态分支` × `合法迁移` | 分支 L315 `if (!r)`（if；store.ts） | 待实现 |
| `UT-REPO-164` | `tryClaimSlot`（`store.ts:304`） | `状态分支` × `合法迁移` | 分支 L315 `!r`（!；store.ts） | 待实现 |
| `UT-REPO-165` | `tryClaimSlot`（`store.ts:304`） | `持久化/序列化` × `round-trip` | 状态写 L317 → `db`（store.ts） | 待实现 |
| `UT-REPO-166` | `tryClaimSlot`（`store.ts:304`） | `持久化/序列化` × `round-trip` | 状态写 L320 → `db`（store.ts） | 待实现 |
| `UT-REPO-167` | `tryClaimSlot`（`store.ts:304`） | `持久化/序列化` × `round-trip` | 状态写 L323 → `db`（store.ts） | 待实现 |
| `UT-REPO-168` | `tryClaimSlot`（`store.ts:304`） | `持久化/序列化` × `round-trip` | 状态写 L326 → `db`（store.ts） | 待实现 |
| `UT-REPO-169` | `tryClaimSlot`（`store.ts:304`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L305 值 `this.tx(() => { const slot = this.db.pr…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-170` | `tryClaimSlot`（`store.ts:304`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L307 值 `"slot_busy"` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-171` | `tryClaimSlot`（`store.ts:304`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L315 值 `"slot_busy"` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-172` | `tryClaimSlot`（`store.ts:304`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L327 值 `{ task_id: r.task_id, lease_epoch: epoc…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-173` | `failAccessLostTasks`（`store.ts:336`） | `状态分支` × `合法迁移` | 分支 L348 `loop (rows)`（loop；store.ts） | 待实现 |
| `UT-REPO-174` | `failAccessLostTasks`（`store.ts:336`） | `状态分支` × `合法迁移` | 分支 L351 `(this.db.prepare("SELECT generation FROM runs…`（??；store.ts） | 待实现 |
| `UT-REPO-175` | `failAccessLostTasks`（`store.ts:336`） | `状态分支` × `合法迁移` | 分支 L351 `(this.db.prepare("SELECT generation FROM runs…`（?.；store.ts） | 待实现 |
| `UT-REPO-176` | `failAccessLostTasks`（`store.ts:336`） | `状态分支` × `合法迁移` | 分支 L375 `if (owned)`（if；store.ts） | 待实现 |
| `UT-REPO-177` | `failAccessLostTasks`（`store.ts:336`） | `持久化/序列化` × `round-trip` | 状态写 L363 → `db`（store.ts） | 待实现 |
| `UT-REPO-178` | `failAccessLostTasks`（`store.ts:336`） | `持久化/序列化` × `round-trip` | 状态写 L366 → `db`（store.ts） | 待实现 |
| `UT-REPO-179` | `failAccessLostTasks`（`store.ts:336`） | `持久化/序列化` × `round-trip` | 状态写 L367 → `db`（store.ts） | 待实现 |
| `UT-REPO-180` | `failAccessLostTasks`（`store.ts:336`） | `持久化/序列化` × `round-trip` | 状态写 L376 → `db`（store.ts） | 待实现 |
| `UT-REPO-181` | `failAccessLostTasks`（`store.ts:336`） | `资源获取/释放` × `获取失败路径` | 资源操作 L365 `createHash`（store.ts） | 待实现 |
| `UT-REPO-182` | `failAccessLostTasks`（`store.ts:336`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L337 值 `this.tx(() => { const rows = this.db .p…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-183` | `failAccessLostTasks`（`store.ts:336`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L381 值 `rows.map((r) => r.task_id as string)` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-184` | `recoverOrphaned`（`store.ts:385`） | `字符串/路径/枚举输入` × `空` | 参数 `owner: string` 的 `空` 类（store.ts:385） | 待实现 |
| `UT-REPO-185` | `recoverOrphaned`（`store.ts:385`） | `字符串/路径/枚举输入` × `超长` | 参数 `owner: string` 的 `超长` 类（store.ts:385） | 待实现 |
| `UT-REPO-186` | `recoverOrphaned`（`store.ts:385`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `owner: string` 的 `注入字符` 类（store.ts:385） | 待实现 |
| `UT-REPO-187` | `recoverOrphaned`（`store.ts:385`） | `字符串/路径/枚举输入` × `空` | 参数 `boot: string` 的 `空` 类（store.ts:385） | 待实现 |
| `UT-REPO-188` | `recoverOrphaned`（`store.ts:385`） | `字符串/路径/枚举输入` × `超长` | 参数 `boot: string` 的 `超长` 类（store.ts:385） | 待实现 |
| `UT-REPO-189` | `recoverOrphaned`（`store.ts:385`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `boot: string` 的 `注入字符` 类（store.ts:385） | 待实现 |
| `UT-REPO-190` | `recoverOrphaned`（`store.ts:385`） | `并发/可重入` × `并发对偶/交错` | 分支 L388 `if (!slot.task_id)`（if；store.ts） | 待实现 |
| `UT-REPO-191` | `recoverOrphaned`（`store.ts:385`） | `并发/可重入` × `并发对偶/交错` | 分支 L388 `!slot.task_id`（!；store.ts） | 待实现 |
| `UT-REPO-192` | `recoverOrphaned`（`store.ts:385`） | `状态分支` × `合法迁移` | 分支 L390 `if (!run \|\| isTerminal(run.state))`（if；store.ts） | 待实现 |
| `UT-REPO-193` | `recoverOrphaned`（`store.ts:385`） | `状态分支` × `合法迁移` | 分支 L390 `!run \|\| isTerminal(run.state)`（\|\|；store.ts） | 待实现 |
| `UT-REPO-194` | `recoverOrphaned`（`store.ts:385`） | `状态分支` × `合法迁移` | 分支 L390 `!run`（!；store.ts） | 待实现 |
| `UT-REPO-195` | `recoverOrphaned`（`store.ts:385`） | `持久化/序列化` × `round-trip` | 状态写 L391 → `db`（store.ts） | 待实现 |
| `UT-REPO-196` | `recoverOrphaned`（`store.ts:385`） | `持久化/序列化` × `round-trip` | 状态写 L395 → `db`（store.ts） | 待实现 |
| `UT-REPO-197` | `recoverOrphaned`（`store.ts:385`） | `持久化/序列化` × `round-trip` | 状态写 L398 → `db`（store.ts） | 待实现 |
| `UT-REPO-198` | `recoverOrphaned`（`store.ts:385`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L386 值 `this.tx(() => { const slot = this.db.pr…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-199` | `recoverOrphaned`（`store.ts:385`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L388 值 `null` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-200` | `recoverOrphaned`（`store.ts:385`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L392 值 `null` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-201` | `recoverOrphaned`（`store.ts:385`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L399 值 `{ task_id: slot.task_id, lease_epoch: e…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-202` | `readSlot`（`store.ts:403`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L404 值 `this.db.prepare("SELECT task_id,owner_i…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-203` | `renewSlot`（`store.ts:406`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:406） | 待实现 |
| `UT-REPO-204` | `renewSlot`（`store.ts:406`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:406） | 待实现 |
| `UT-REPO-205` | `renewSlot`（`store.ts:406`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:406） | 待实现 |
| `UT-REPO-206` | `renewSlot`（`store.ts:406`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（store.ts:406） | 待实现 |
| `UT-REPO-207` | `renewSlot`（`store.ts:406`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:406） | 待实现 |
| `UT-REPO-208` | `renewSlot`（`store.ts:406`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（store.ts:406） | 待实现 |
| `UT-REPO-209` | `renewSlot`（`store.ts:406`） | `持久化/序列化` × `round-trip` | 状态写 L407 → `db`（store.ts） | 待实现 |
| `UT-REPO-210` | `renewSlot`（`store.ts:406`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L408 值 `x.changes === 1` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-211` | `releaseSlot`（`store.ts:410`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:410） | 待实现 |
| `UT-REPO-212` | `releaseSlot`（`store.ts:410`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:410） | 待实现 |
| `UT-REPO-213` | `releaseSlot`（`store.ts:410`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:410） | 待实现 |
| `UT-REPO-214` | `releaseSlot`（`store.ts:410`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（store.ts:410） | 待实现 |
| `UT-REPO-215` | `releaseSlot`（`store.ts:410`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:410） | 待实现 |
| `UT-REPO-216` | `releaseSlot`（`store.ts:410`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（store.ts:410） | 待实现 |
| `UT-REPO-217` | `releaseSlot`（`store.ts:410`） | `持久化/序列化` × `round-trip` | 状态写 L411 → `db`（store.ts） | 待实现 |
| `UT-REPO-218` | `releaseSlot`（`store.ts:410`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L414 值 `x.changes === 1` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-219` | `scanNonTerminal`（`store.ts:416`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L417 值 `(this.db.prepare("SELECT task_id FROM r…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-220` | `nextNeedingStaging`（`store.ts:421`） | `状态分支` × `合法迁移` | 分支 L427 `r?.task_id ?? null`（??；store.ts） | 待实现 |
| `UT-REPO-221` | `nextNeedingStaging`（`store.ts:421`） | `状态分支` × `合法迁移` | 分支 L427 `r?.task_id`（?.；store.ts） | 待实现 |
| `UT-REPO-222` | `nextNeedingStaging`（`store.ts:421`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L427 值 `r?.task_id ?? null` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-223` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:431） | 待实现 |
| `UT-REPO-224` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:431） | 待实现 |
| `UT-REPO-225` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:431） | 待实现 |
| `UT-REPO-226` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `空` | 参数 `op: string` 的 `空` 类（store.ts:431） | 待实现 |
| `UT-REPO-227` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `超长` | 参数 `op: string` 的 `超长` 类（store.ts:431） | 待实现 |
| `UT-REPO-228` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `op: string` 的 `注入字符` 类（store.ts:431） | 待实现 |
| `UT-REPO-229` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `空` | 参数 `step: string` 的 `空` 类（store.ts:431） | 待实现 |
| `UT-REPO-230` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `超长` | 参数 `step: string` 的 `超长` 类（store.ts:431） | 待实现 |
| `UT-REPO-231` | `reserveModel`（`store.ts:431`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `step: string` 的 `注入字符` 类（store.ts:431） | 待实现 |
| `UT-REPO-232` | `reserveModel`（`store.ts:431`） | `数值/长度上限参数` × `恰好通过` | 参数 `attempt: number` 的 `恰好通过` 类（store.ts:431） | 待实现 |
| `UT-REPO-233` | `reserveModel`（`store.ts:431`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `attempt: number` 的 `+1 拒绝` 类（store.ts:431） | 待实现 |
| `UT-REPO-234` | `reserveModel`（`store.ts:431`） | `数值/长度上限参数` × `−1 通过` | 参数 `attempt: number` 的 `−1 通过` 类（store.ts:431） | 待实现 |
| `UT-REPO-235` | `reserveModel`（`store.ts:431`） | `状态分支` × `合法迁移` | 分支 L436 `if (ex)`（if；store.ts） | 待实现 |
| `UT-REPO-236` | `reserveModel`（`store.ts:431`） | `持久化/序列化` × `round-trip` | 状态写 L437 → `db`（store.ts） | 待实现 |
| `UT-REPO-237` | `reserveModel`（`store.ts:431`） | `持久化/序列化` × `round-trip` | 状态写 L438 → `db`（store.ts） | 待实现 |
| `UT-REPO-238` | `reserveModel`（`store.ts:431`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L432 值 `this.tx(() => { const ex = this.db .pre…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-239` | `reserveModel`（`store.ts:431`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L436 值 `true` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-240` | `reserveModel`（`store.ts:431`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L439 值 `true` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-241` | `constructor`（`store.ts:44`） | `字符串/路径/枚举输入` × `空` | 参数 `path: string` 的 `空` 类（store.ts:44） | 待实现 |
| `UT-REPO-242` | `constructor`（`store.ts:44`） | `字符串/路径/枚举输入` × `超长` | 参数 `path: string` 的 `超长` 类（store.ts:44） | 待实现 |
| `UT-REPO-243` | `constructor`（`store.ts:44`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `path: string` 的 `注入字符` 类（store.ts:44） | 待实现 |
| `UT-REPO-244` | `constructor`（`store.ts:44`） | `数值/长度上限参数` × `恰好通过` | 参数 `busyMs: number` 的 `恰好通过` 类（store.ts:44） | 待实现 |
| `UT-REPO-245` | `constructor`（`store.ts:44`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `busyMs: number` 的 `+1 拒绝` 类（store.ts:44） | 待实现 |
| `UT-REPO-246` | `constructor`（`store.ts:44`） | `数值/长度上限参数` × `−1 通过` | 参数 `busyMs: number` 的 `−1 通过` 类（store.ts:44） | 待实现 |
| `UT-REPO-247` | `constructor`（`store.ts:44`） | `状态分支` × `合法迁移` | 分支 L45 `if (path !== ":memory:")`（if；store.ts） | 待实现 |
| `UT-REPO-248` | `constructor`（`store.ts:44`） | `状态分支` × `合法迁移` | 状态写 L46 → `this.db`（store.ts） | 待实现 |
| `UT-REPO-249` | `constructor`（`store.ts:44`） | `持久化/序列化` × `round-trip` | 状态写 L47 → `db`（store.ts） | 待实现 |
| `UT-REPO-250` | `constructor`（`store.ts:44`） | `资源获取/释放` × `获取失败路径` | 资源操作 L45 `mkdirSync`（store.ts） | 待实现 |
| `UT-REPO-251` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:442） | 待实现 |
| `UT-REPO-252` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:442） | 待实现 |
| `UT-REPO-253` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:442） | 待实现 |
| `UT-REPO-254` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `空` | 参数 `op: string` 的 `空` 类（store.ts:442） | 待实现 |
| `UT-REPO-255` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `超长` | 参数 `op: string` 的 `超长` 类（store.ts:442） | 待实现 |
| `UT-REPO-256` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `op: string` 的 `注入字符` 类（store.ts:442） | 待实现 |
| `UT-REPO-257` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `空` | 参数 `step: string` 的 `空` 类（store.ts:442） | 待实现 |
| `UT-REPO-258` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `超长` | 参数 `step: string` 的 `超长` 类（store.ts:442） | 待实现 |
| `UT-REPO-259` | `observeUsage`（`store.ts:442`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `step: string` 的 `注入字符` 类（store.ts:442） | 待实现 |
| `UT-REPO-260` | `observeUsage`（`store.ts:442`） | `数值/长度上限参数` × `恰好通过` | 参数 `attempt: number` 的 `恰好通过` 类（store.ts:442） | 待实现 |
| `UT-REPO-261` | `observeUsage`（`store.ts:442`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `attempt: number` 的 `+1 拒绝` 类（store.ts:442） | 待实现 |
| `UT-REPO-262` | `observeUsage`（`store.ts:442`） | `数值/长度上限参数` × `−1 通过` | 参数 `attempt: number` 的 `−1 通过` 类（store.ts:442） | 待实现 |
| `UT-REPO-263` | `observeUsage`（`store.ts:442`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `raw: unknown` 的 `每等价类合法值` 类（store.ts:442） | 待实现 |
| `UT-REPO-264` | `observeUsage`（`store.ts:442`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `raw: unknown` 的 `边界(上/下/零/空/满)` 类（store.ts:442） | 待实现 |
| `UT-REPO-265` | `observeUsage`（`store.ts:442`） | `纯函数/无副作用` × `非法值` | 参数 `raw: unknown` 的 `非法值` 类（store.ts:442） | 待实现 |
| `UT-REPO-266` | `observeUsage`（`store.ts:442`） | `持久化/序列化` × `round-trip` | 状态写 L443 → `db`（store.ts） | 待实现 |
| `UT-REPO-267` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:449） | 待实现 |
| `UT-REPO-268` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:449） | 待实现 |
| `UT-REPO-269` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:449） | 待实现 |
| `UT-REPO-270` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `空` | 参数 `op: string` 的 `空` 类（store.ts:449） | 待实现 |
| `UT-REPO-271` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `超长` | 参数 `op: string` 的 `超长` 类（store.ts:449） | 待实现 |
| `UT-REPO-272` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `op: string` 的 `注入字符` 类（store.ts:449） | 待实现 |
| `UT-REPO-273` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `空` | 参数 `step: string` 的 `空` 类（store.ts:449） | 待实现 |
| `UT-REPO-274` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `超长` | 参数 `step: string` 的 `超长` 类（store.ts:449） | 待实现 |
| `UT-REPO-275` | `terminalModel`（`store.ts:449`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `step: string` 的 `注入字符` 类（store.ts:449） | 待实现 |
| `UT-REPO-276` | `terminalModel`（`store.ts:449`） | `数值/长度上限参数` × `恰好通过` | 参数 `attempt: number` 的 `恰好通过` 类（store.ts:449） | 待实现 |
| `UT-REPO-277` | `terminalModel`（`store.ts:449`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `attempt: number` 的 `+1 拒绝` 类（store.ts:449） | 待实现 |
| `UT-REPO-278` | `terminalModel`（`store.ts:449`） | `数值/长度上限参数` × `−1 通过` | 参数 `attempt: number` 的 `−1 通过` 类（store.ts:449） | 待实现 |
| `UT-REPO-279` | `terminalModel`（`store.ts:449`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `unknown: inferred` 的 `每等价类合法值` 类（store.ts:449） | 待实现 |
| `UT-REPO-280` | `terminalModel`（`store.ts:449`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `unknown: inferred` 的 `边界(上/下/零/空/满)` 类（store.ts:449） | 待实现 |
| `UT-REPO-281` | `terminalModel`（`store.ts:449`） | `纯函数/无副作用` × `非法值` | 参数 `unknown: inferred` 的 `非法值` 类（store.ts:449） | 待实现 |
| `UT-REPO-282` | `terminalModel`（`store.ts:449`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `unknown` 缺省/显式两态（store.ts:449） | 待实现 |
| `UT-REPO-283` | `terminalModel`（`store.ts:449`） | `状态分支` × `合法迁移` | 分支 L454 `? unknown :`（ternary；store.ts） | 待实现 |
| `UT-REPO-284` | `terminalModel`（`store.ts:449`） | `持久化/序列化` × `round-trip` | 状态写 L450 → `db`（store.ts） | 待实现 |
| `UT-REPO-285` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:456） | 待实现 |
| `UT-REPO-286` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:456） | 待实现 |
| `UT-REPO-287` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:456） | 待实现 |
| `UT-REPO-288` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `空` | 参数 `op: string` 的 `空` 类（store.ts:456） | 待实现 |
| `UT-REPO-289` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `超长` | 参数 `op: string` 的 `超长` 类（store.ts:456） | 待实现 |
| `UT-REPO-290` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `op: string` 的 `注入字符` 类（store.ts:456） | 待实现 |
| `UT-REPO-291` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `空` | 参数 `id: string` 的 `空` 类（store.ts:456） | 待实现 |
| `UT-REPO-292` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `超长` | 参数 `id: string` 的 `超长` 类（store.ts:456） | 待实现 |
| `UT-REPO-293` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `id: string` 的 `注入字符` 类（store.ts:456） | 待实现 |
| `UT-REPO-294` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `空` | 参数 `name: string` 的 `空` 类（store.ts:456） | 待实现 |
| `UT-REPO-295` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `超长` | 参数 `name: string` 的 `超长` 类（store.ts:456） | 待实现 |
| `UT-REPO-296` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `name: string` 的 `注入字符` 类（store.ts:456） | 待实现 |
| `UT-REPO-297` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `空` | 参数 `effect: string` 的 `空` 类（store.ts:456） | 待实现 |
| `UT-REPO-298` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `超长` | 参数 `effect: string` 的 `超长` 类（store.ts:456） | 待实现 |
| `UT-REPO-299` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `effect: string` 的 `注入字符` 类（store.ts:456） | 待实现 |
| `UT-REPO-300` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `空` | 参数 `replay: string` 的 `空` 类（store.ts:456） | 待实现 |
| `UT-REPO-301` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `超长` | 参数 `replay: string` 的 `超长` 类（store.ts:456） | 待实现 |
| `UT-REPO-302` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `replay: string` 的 `注入字符` 类（store.ts:456） | 待实现 |
| `UT-REPO-303` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `空` | 参数 `contract: string` 的 `空` 类（store.ts:456） | 待实现 |
| `UT-REPO-304` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `超长` | 参数 `contract: string` 的 `超长` 类（store.ts:456） | 待实现 |
| `UT-REPO-305` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `contract: string` 的 `注入字符` 类（store.ts:456） | 待实现 |
| `UT-REPO-306` | `reserveTool`（`store.ts:456`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `contract` 缺省/显式两态（store.ts:456） | 待实现 |
| `UT-REPO-307` | `reserveTool`（`store.ts:456`） | `状态分支` × `合法迁移` | 分支 L469 `if (ex)`（if；store.ts） | 待实现 |
| `UT-REPO-308` | `reserveTool`（`store.ts:456`） | `状态分支` × `合法迁移` | 分支 L470 `if (ex.replay !== "safe")`（if；store.ts） | 待实现 |
| `UT-REPO-309` | `reserveTool`（`store.ts:456`） | `状态分支` × `合法迁移` | 分支 L478 `contract ?? null`（??；store.ts） | 待实现 |
| `UT-REPO-310` | `reserveTool`（`store.ts:456`） | `持久化/序列化` × `round-trip` | 状态写 L471 → `db`（store.ts） | 待实现 |
| `UT-REPO-311` | `reserveTool`（`store.ts:456`） | `持久化/序列化` × `round-trip` | 状态写 L476 → `db`（store.ts） | 待实现 |
| `UT-REPO-312` | `reserveTool`（`store.ts:456`） | `持久化/序列化` × `round-trip` | 状态写 L479 → `db`（store.ts） | 待实现 |
| `UT-REPO-313` | `reserveTool`（`store.ts:456`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L465 值 `this.tx(() => { const ex = this.db .pre…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-314` | `reserveTool`（`store.ts:456`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L470 值 `"UnsafeRetryBlocked"` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-315` | `reserveTool`（`store.ts:456`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L474 值 `"Admitted"` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-316` | `reserveTool`（`store.ts:456`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L480 值 `"Admitted"` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-317` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:483） | 待实现 |
| `UT-REPO-318` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:483） | 待实现 |
| `UT-REPO-319` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:483） | 待实现 |
| `UT-REPO-320` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `空` | 参数 `op: string` 的 `空` 类（store.ts:483） | 待实现 |
| `UT-REPO-321` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `超长` | 参数 `op: string` 的 `超长` 类（store.ts:483） | 待实现 |
| `UT-REPO-322` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `op: string` 的 `注入字符` 类（store.ts:483） | 待实现 |
| `UT-REPO-323` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `空` | 参数 `id: string` 的 `空` 类（store.ts:483） | 待实现 |
| `UT-REPO-324` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `超长` | 参数 `id: string` 的 `超长` 类（store.ts:483） | 待实现 |
| `UT-REPO-325` | `terminalTool`（`store.ts:483`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `id: string` 的 `注入字符` 类（store.ts:483） | 待实现 |
| `UT-REPO-326` | `terminalTool`（`store.ts:483`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `unknown: inferred` 的 `每等价类合法值` 类（store.ts:483） | 待实现 |
| `UT-REPO-327` | `terminalTool`（`store.ts:483`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `unknown: inferred` 的 `边界(上/下/零/空/满)` 类（store.ts:483） | 待实现 |
| `UT-REPO-328` | `terminalTool`（`store.ts:483`） | `纯函数/无副作用` × `非法值` | 参数 `unknown: inferred` 的 `非法值` 类（store.ts:483） | 待实现 |
| `UT-REPO-329` | `terminalTool`（`store.ts:483`） | `纯函数/无副作用` × `未知枚举` | 可选参数 `unknown` 缺省/显式两态（store.ts:483） | 待实现 |
| `UT-REPO-330` | `terminalTool`（`store.ts:483`） | `状态分支` × `合法迁移` | 分支 L486 `? unknown :`（ternary；store.ts） | 待实现 |
| `UT-REPO-331` | `terminalTool`（`store.ts:483`） | `持久化/序列化` × `round-trip` | 状态写 L484 → `db`（store.ts） | 待实现 |
| `UT-REPO-332` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:489） | 待实现 |
| `UT-REPO-333` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:489） | 待实现 |
| `UT-REPO-334` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:489） | 待实现 |
| `UT-REPO-335` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（store.ts:489） | 待实现 |
| `UT-REPO-336` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（store.ts:489） | 待实现 |
| `UT-REPO-337` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（store.ts:489） | 待实现 |
| `UT-REPO-338` | `markTurn`（`store.ts:489`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `status: "QueuedInPi" \| "Consumed" \| "Abandoned"` 的 `每等价类合法值` 类（store.ts:489） | 待实现 |
| `UT-REPO-339` | `markTurn`（`store.ts:489`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `status: "QueuedInPi" \| "Consumed" \| "Abandoned"` 的 `边界(上/下/零/空/满)` 类（store.ts:489） | 待实现 |
| `UT-REPO-340` | `markTurn`（`store.ts:489`） | `纯函数/无副作用` × `非法值` | 参数 `status: "QueuedInPi" \| "Consumed" \| "Abandoned"` 的 `非法值` 类（store.ts:489） | 待实现 |
| `UT-REPO-341` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `空` | 参数 `entry: string` 的 `空` 类（store.ts:489） | 待实现 |
| `UT-REPO-342` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `超长` | 参数 `entry: string` 的 `超长` 类（store.ts:489） | 待实现 |
| `UT-REPO-343` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `entry: string` 的 `注入字符` 类（store.ts:489） | 待实现 |
| `UT-REPO-344` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `entry` 缺省/显式两态（store.ts:489） | 待实现 |
| `UT-REPO-345` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `空` | 参数 `op: string` 的 `空` 类（store.ts:489） | 待实现 |
| `UT-REPO-346` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `超长` | 参数 `op: string` 的 `超长` 类（store.ts:489） | 待实现 |
| `UT-REPO-347` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `op: string` 的 `注入字符` 类（store.ts:489） | 待实现 |
| `UT-REPO-348` | `markTurn`（`store.ts:489`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `op` 缺省/显式两态（store.ts:489） | 待实现 |
| `UT-REPO-349` | `markTurn`（`store.ts:489`） | `状态分支` × `合法迁移` | 分支 L492 `entry ?? null`（??；store.ts） | 待实现 |
| `UT-REPO-350` | `markTurn`（`store.ts:489`） | `状态分支` × `合法迁移` | 分支 L492 `op ?? null`（??；store.ts） | 待实现 |
| `UT-REPO-351` | `markTurn`（`store.ts:489`） | `持久化/序列化` × `round-trip` | 状态写 L490 → `db`（store.ts） | 待实现 |
| `UT-REPO-352` | `pendingTurns`（`store.ts:494`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:494） | 待实现 |
| `UT-REPO-353` | `pendingTurns`（`store.ts:494`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:494） | 待实现 |
| `UT-REPO-354` | `pendingTurns`（`store.ts:494`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:494） | 待实现 |
| `UT-REPO-355` | `pendingTurns`（`store.ts:494`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L495 值 `this.db.prepare("SELECT * FROM discussi…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-356` | `markDiscussionAccessLost`（`store.ts:497`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（store.ts:497） | 待实现 |
| `UT-REPO-357` | `markDiscussionAccessLost`（`store.ts:497`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（store.ts:497） | 待实现 |
| `UT-REPO-358` | `markDiscussionAccessLost`（`store.ts:497`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（store.ts:497） | 待实现 |
| `UT-REPO-359` | `markDiscussionAccessLost`（`store.ts:497`） | `状态分支` × `合法迁移` | 分支 L505 `JSON.parse(x.task_json).discussion?.room_id`（?.；store.ts） | 待实现 |
| `UT-REPO-360` | `markDiscussionAccessLost`（`store.ts:497`） | `错误路径` × `每个 typed 错误码` | 分支 L506 `catch ()`（catch；store.ts） | 待实现 |
| `UT-REPO-361` | `markDiscussionAccessLost`（`store.ts:497`） | `状态分支` × `合法迁移` | 分支 L512 `loop (affected)`（loop；store.ts） | 待实现 |
| `UT-REPO-362` | `markDiscussionAccessLost`（`store.ts:497`） | `持久化/序列化` × `round-trip` | 状态写 L512 → `db`（store.ts） | 待实现 |
| `UT-REPO-363` | `markDiscussionAccessLost`（`store.ts:497`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L498 值 `this.tx(() => { const rows = this.db .p…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-364` | `markDiscussionAccessLost`（`store.ts:497`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L505 值 `JSON.parse(x.task_json).discussion?.roo…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-365` | `markDiscussionAccessLost`（`store.ts:497`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L507 值 `false` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-366` | `markDiscussionAccessLost`（`store.ts:497`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L513 值 `affected` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-367` | `discussionAccessLost`（`store.ts:516`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:516） | 待实现 |
| `UT-REPO-368` | `discussionAccessLost`（`store.ts:516`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:516） | 待实现 |
| `UT-REPO-369` | `discussionAccessLost`（`store.ts:516`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:516） | 待实现 |
| `UT-REPO-370` | `discussionAccessLost`（`store.ts:516`） | `状态分支` × `合法迁移` | 分支 L517 `!!this.db.prepare("SELECT 1 FROM discussion_a…`（!；store.ts） | 待实现 |
| `UT-REPO-371` | `discussionAccessLost`（`store.ts:516`） | `状态分支` × `合法迁移` | 分支 L517 `!this.db.prepare("SELECT 1 FROM discussion_ac…`（!；store.ts） | 待实现 |
| `UT-REPO-372` | `discussionAccessLost`（`store.ts:516`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L517 值 `!!this.db.prepare("SELECT 1 FROM discus…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-373` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:519） | 待实现 |
| `UT-REPO-374` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:519） | 待实现 |
| `UT-REPO-375` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:519） | 待实现 |
| `UT-REPO-376` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `空` | 参数 `operationId: string` 的 `空` 类（store.ts:519） | 待实现 |
| `UT-REPO-377` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `超长` | 参数 `operationId: string` 的 `超长` 类（store.ts:519） | 待实现 |
| `UT-REPO-378` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `operationId: string` 的 `注入字符` 类（store.ts:519） | 待实现 |
| `UT-REPO-379` | `recordProviderCall`（`store.ts:519`） | `数值/长度上限参数` × `恰好通过` | 参数 `status: number \| null` 的 `恰好通过` 类（store.ts:519） | 待实现 |
| `UT-REPO-380` | `recordProviderCall`（`store.ts:519`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `status: number \| null` 的 `+1 拒绝` 类（store.ts:519） | 待实现 |
| `UT-REPO-381` | `recordProviderCall`（`store.ts:519`） | `数值/长度上限参数` × `−1 通过` | 参数 `status: number \| null` 的 `−1 通过` 类（store.ts:519） | 待实现 |
| `UT-REPO-382` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `空` | 参数 `requestId: string \| null` 的 `空` 类（store.ts:519） | 待实现 |
| `UT-REPO-383` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `超长` | 参数 `requestId: string \| null` 的 `超长` 类（store.ts:519） | 待实现 |
| `UT-REPO-384` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `requestId: string \| null` 的 `注入字符` 类（store.ts:519） | 待实现 |
| `UT-REPO-385` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `空` | 参数 `note: string` 的 `空` 类（store.ts:519） | 待实现 |
| `UT-REPO-386` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `超长` | 参数 `note: string` 的 `超长` 类（store.ts:519） | 待实现 |
| `UT-REPO-387` | `recordProviderCall`（`store.ts:519`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `note: string` 的 `注入字符` 类（store.ts:519） | 待实现 |
| `UT-REPO-388` | `recordProviderCall`（`store.ts:519`） | `数值/长度上限参数` × `恰好通过` | 参数 `latencyMs: number \| null` 的 `恰好通过` 类（store.ts:519） | 待实现 |
| `UT-REPO-389` | `recordProviderCall`（`store.ts:519`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `latencyMs: number \| null` 的 `+1 拒绝` 类（store.ts:519） | 待实现 |
| `UT-REPO-390` | `recordProviderCall`（`store.ts:519`） | `数值/长度上限参数` × `−1 通过` | 参数 `latencyMs: number \| null` 的 `−1 通过` 类（store.ts:519） | 待实现 |
| `UT-REPO-391` | `recordProviderCall`（`store.ts:519`） | `持久化/序列化` × `round-trip` | 状态写 L520 → `db`（store.ts） | 待实现 |
| `UT-REPO-392` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（store.ts:524） | 待实现 |
| `UT-REPO-393` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（store.ts:524） | 待实现 |
| `UT-REPO-394` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（store.ts:524） | 待实现 |
| `UT-REPO-395` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（store.ts:524） | 待实现 |
| `UT-REPO-396` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（store.ts:524） | 待实现 |
| `UT-REPO-397` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（store.ts:524） | 待实现 |
| `UT-REPO-398` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `空` | 参数 `sender: string` 的 `空` 类（store.ts:524） | 待实现 |
| `UT-REPO-399` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `超长` | 参数 `sender: string` 的 `超长` 类（store.ts:524） | 待实现 |
| `UT-REPO-400` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `sender: string` 的 `注入字符` 类（store.ts:524） | 待实现 |
| `UT-REPO-401` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `空` | 参数 `txn: string` 的 `空` 类（store.ts:524） | 待实现 |
| `UT-REPO-402` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `超长` | 参数 `txn: string` 的 `超长` 类（store.ts:524） | 待实现 |
| `UT-REPO-403` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `txn: string` 的 `注入字符` 类（store.ts:524） | 待实现 |
| `UT-REPO-404` | `recordMatrixEvent`（`store.ts:524`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `txn` 缺省/显式两态（store.ts:524） | 待实现 |
| `UT-REPO-405` | `recordMatrixEvent`（`store.ts:524`） | `状态分支` × `合法迁移` | 分支 L525 `txn ?? null`（??；store.ts） | 待实现 |
| `UT-REPO-406` | `recordMatrixEvent`（`store.ts:524`） | `持久化/序列化` × `round-trip` | 状态写 L525 → `db`（store.ts） | 待实现 |
| `UT-REPO-407` | `recordMatrixEvent`（`store.ts:524`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L526 值 `x.changes === 1` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-408` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（store.ts:528） | 待实现 |
| `UT-REPO-409` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（store.ts:528） | 待实现 |
| `UT-REPO-410` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（store.ts:528） | 待实现 |
| `UT-REPO-411` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（store.ts:528） | 待实现 |
| `UT-REPO-412` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（store.ts:528） | 待实现 |
| `UT-REPO-413` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（store.ts:528） | 待实现 |
| `UT-REPO-414` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `空` | 参数 `sender: string` 的 `空` 类（store.ts:528） | 待实现 |
| `UT-REPO-415` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `超长` | 参数 `sender: string` 的 `超长` 类（store.ts:528） | 待实现 |
| `UT-REPO-416` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `sender: string` 的 `注入字符` 类（store.ts:528） | 待实现 |
| `UT-REPO-417` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `空` | 参数 `txn: string \| undefined` 的 `空` 类（store.ts:528） | 待实现 |
| `UT-REPO-418` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `超长` | 参数 `txn: string \| undefined` 的 `超长` 类（store.ts:528） | 待实现 |
| `UT-REPO-419` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `txn: string \| undefined` 的 `注入字符` 类（store.ts:528） | 待实现 |
| `UT-REPO-420` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `空` | 参数 `turns: { task: string; visible: string }[]` 的 `空` 类（store.ts:528） | 待实现 |
| `UT-REPO-421` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `超长` | 参数 `turns: { task: string; visible: string }[]` 的 `超长` 类（store.ts:528） | 待实现 |
| `UT-REPO-422` | `ingestMatrixEvent`（`store.ts:528`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `turns: { task: string; visible: string }[]` 的 `注入字符` 类（store.ts:528） | 待实现 |
| `UT-REPO-423` | `ingestMatrixEvent`（`store.ts:528`） | `状态分支` × `合法迁移` | 分支 L530 `txn ?? null`（??；store.ts） | 待实现 |
| `UT-REPO-424` | `ingestMatrixEvent`（`store.ts:528`） | `状态分支` × `合法迁移` | 分支 L531 `if (!inserted.changes)`（if；store.ts） | 待实现 |
| `UT-REPO-425` | `ingestMatrixEvent`（`store.ts:528`） | `状态分支` × `合法迁移` | 分支 L531 `!inserted.changes`（!；store.ts） | 待实现 |
| `UT-REPO-426` | `ingestMatrixEvent`（`store.ts:528`） | `状态分支` × `合法迁移` | 分支 L532 `loop (turns)`（loop；store.ts） | 待实现 |
| `UT-REPO-427` | `ingestMatrixEvent`（`store.ts:528`） | `状态分支` × `合法迁移` | 分支 L534 `if (r?.discussion_intake_state !== "Open")`（if；store.ts） | 待实现 |
| `UT-REPO-428` | `ingestMatrixEvent`（`store.ts:528`） | `状态分支` × `合法迁移` | 分支 L534 `r?.discussion_intake_state`（?.；store.ts） | 待实现 |
| `UT-REPO-429` | `ingestMatrixEvent`（`store.ts:528`） | `持久化/序列化` × `round-trip` | 状态写 L530 → `db`（store.ts） | 待实现 |
| `UT-REPO-430` | `ingestMatrixEvent`（`store.ts:528`） | `持久化/序列化` × `round-trip` | 状态写 L537 → `db`（store.ts） | 待实现 |
| `UT-REPO-431` | `ingestMatrixEvent`（`store.ts:528`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L529 值 `this.tx(() => { const inserted = this.d…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-432` | `ingestMatrixEvent`（`store.ts:528`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L531 值 `false` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-433` | `ingestMatrixEvent`（`store.ts:528`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L541 值 `true` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-434` | `hasMatrixEvent`（`store.ts:544`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（store.ts:544） | 待实现 |
| `UT-REPO-435` | `hasMatrixEvent`（`store.ts:544`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（store.ts:544） | 待实现 |
| `UT-REPO-436` | `hasMatrixEvent`（`store.ts:544`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（store.ts:544） | 待实现 |
| `UT-REPO-437` | `hasMatrixEvent`（`store.ts:544`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（store.ts:544） | 待实现 |
| `UT-REPO-438` | `hasMatrixEvent`（`store.ts:544`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（store.ts:544） | 待实现 |
| `UT-REPO-439` | `hasMatrixEvent`（`store.ts:544`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（store.ts:544） | 待实现 |
| `UT-REPO-440` | `hasMatrixEvent`（`store.ts:544`） | `状态分支` × `合法迁移` | 分支 L545 `!!this.db.prepare("SELECT 1 FROM matrix_event…`（!；store.ts） | 待实现 |
| `UT-REPO-441` | `hasMatrixEvent`（`store.ts:544`） | `状态分支` × `合法迁移` | 分支 L545 `!this.db.prepare("SELECT 1 FROM matrix_events…`（!；store.ts） | 待实现 |
| `UT-REPO-442` | `hasMatrixEvent`（`store.ts:544`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L545 值 `!!this.db.prepare("SELECT 1 FROM matrix…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-443` | `ingestMatrixBatch`（`store.ts:547`） | `字符串/路径/枚举输入` × `空` | 参数 `events: { room: string; event: string; sender: string; txn?: string;` 的 `空` 类（store.ts:547） | 待实现 |
| `UT-REPO-444` | `ingestMatrixBatch`（`store.ts:547`） | `字符串/路径/枚举输入` × `超长` | 参数 `events: { room: string; event: string; sender: string; txn?: string;` 的 `超长` 类（store.ts:547） | 待实现 |
| `UT-REPO-445` | `ingestMatrixBatch`（`store.ts:547`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `events: { room: string; event: string; sender: string; txn?: string;` 的 `注入字符` 类（store.ts:547） | 待实现 |
| `UT-REPO-446` | `ingestMatrixBatch`（`store.ts:547`） | `字符串/路径/枚举输入` × `未知枚举` | 可选参数 `events` 缺省/显式两态（store.ts:547） | 待实现 |
| `UT-REPO-447` | `ingestMatrixBatch`（`store.ts:547`） | `字符串/路径/枚举输入` × `空` | 参数 `cursor: string` 的 `空` 类（store.ts:547） | 待实现 |
| `UT-REPO-448` | `ingestMatrixBatch`（`store.ts:547`） | `字符串/路径/枚举输入` × `超长` | 参数 `cursor: string` 的 `超长` 类（store.ts:547） | 待实现 |
| `UT-REPO-449` | `ingestMatrixBatch`（`store.ts:547`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `cursor: string` 的 `注入字符` 类（store.ts:547） | 待实现 |
| `UT-REPO-450` | `ingestMatrixBatch`（`store.ts:547`） | `状态分支` × `合法迁移` | 分支 L549 `loop (events)`（loop；store.ts） | 待实现 |
| `UT-REPO-451` | `ingestMatrixBatch`（`store.ts:547`） | `状态分支` × `合法迁移` | 分支 L550 `item.txn ?? null`（??；store.ts） | 待实现 |
| `UT-REPO-452` | `ingestMatrixBatch`（`store.ts:547`） | `状态分支` × `合法迁移` | 分支 L551 `if (!inserted.changes)`（if；store.ts） | 待实现 |
| `UT-REPO-453` | `ingestMatrixBatch`（`store.ts:547`） | `状态分支` × `合法迁移` | 分支 L551 `!inserted.changes`（!；store.ts） | 待实现 |
| `UT-REPO-454` | `ingestMatrixBatch`（`store.ts:547`） | `状态分支` × `合法迁移` | 分支 L552 `loop (item.turns)`（loop；store.ts） | 待实现 |
| `UT-REPO-455` | `ingestMatrixBatch`（`store.ts:547`） | `状态分支` × `合法迁移` | 分支 L554 `if (r?.discussion_intake_state !== "Open")`（if；store.ts） | 待实现 |
| `UT-REPO-456` | `ingestMatrixBatch`（`store.ts:547`） | `状态分支` × `合法迁移` | 分支 L554 `r?.discussion_intake_state`（?.；store.ts） | 待实现 |
| `UT-REPO-457` | `ingestMatrixBatch`（`store.ts:547`） | `持久化/序列化` × `round-trip` | 状态写 L550 → `db`（store.ts） | 待实现 |
| `UT-REPO-458` | `ingestMatrixBatch`（`store.ts:547`） | `持久化/序列化` × `round-trip` | 状态写 L557 → `db`（store.ts） | 待实现 |
| `UT-REPO-459` | `ingestMatrixBatch`（`store.ts:547`） | `持久化/序列化` × `round-trip` | 状态写 L562 → `db`（store.ts） | 待实现 |
| `UT-REPO-460` | `ingestMatrixBatch`（`store.ts:547`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L548 值 `this.tx(() => { for (const item of even…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-461` | `ingestMatrixBatch`（`store.ts:547`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L563 值 `events.length` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-462` | `migrate`（`store.ts:56`） | `持久化/序列化` × `round-trip` | 状态写 L57 → `db`（store.ts） | 待实现 |
| `UT-REPO-463` | `migrate`（`store.ts:56`） | `持久化/序列化` × `round-trip` | 状态写 L167 → `db`（store.ts） | 待实现 |
| `UT-REPO-464` | `discussionRoomsInUse`（`store.ts:567`） | `状态分支` × `合法迁移` | 分支 L575 `JSON.parse(x.task_json)?.discussion?.room_id`（?.；store.ts） | 待实现 |
| `UT-REPO-465` | `discussionRoomsInUse`（`store.ts:567`） | `状态分支` × `合法迁移` | 分支 L575 `JSON.parse(x.task_json)?.discussion`（?.；store.ts） | 待实现 |
| `UT-REPO-466` | `discussionRoomsInUse`（`store.ts:567`） | `错误路径` × `每个 typed 错误码` | 分支 L576 `catch ()`（catch；store.ts） | 待实现 |
| `UT-REPO-467` | `discussionRoomsInUse`（`store.ts:567`） | `状态分支` × `合法迁移` | 分支 L580 `typeof room === "string" && room.length > 0`（&&；store.ts） | 待实现 |
| `UT-REPO-468` | `discussionRoomsInUse`（`store.ts:567`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L568 值 `(this.db .prepare( "SELECT t.task_json …` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-469` | `discussionRoomsInUse`（`store.ts:567`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L575 值 `JSON.parse(x.task_json)?.discussion?.ro…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-470` | `discussionRoomsInUse`（`store.ts:567`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L577 值 `undefined` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-471` | `openDiscussionRuns`（`store.ts:583`） | `字符串/路径/枚举输入` × `空` | 参数 `room: string` 的 `空` 类（store.ts:583） | 待实现 |
| `UT-REPO-472` | `openDiscussionRuns`（`store.ts:583`） | `字符串/路径/枚举输入` × `超长` | 参数 `room: string` 的 `超长` 类（store.ts:583） | 待实现 |
| `UT-REPO-473` | `openDiscussionRuns`（`store.ts:583`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `room: string` 的 `注入字符` 类（store.ts:583） | 待实现 |
| `UT-REPO-474` | `openDiscussionRuns`（`store.ts:583`） | `状态分支` × `合法迁移` | 分支 L589 `JSON.parse(x.task_json).discussion?.room_id`（?.；store.ts） | 待实现 |
| `UT-REPO-475` | `openDiscussionRuns`（`store.ts:583`） | `错误路径` × `每个 typed 错误码` | 分支 L590 `catch ()`（catch；store.ts） | 待实现 |
| `UT-REPO-476` | `openDiscussionRuns`（`store.ts:583`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L584 值 `(this.db .prepare("SELECT r.task_id,t.t…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-477` | `openDiscussionRuns`（`store.ts:583`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L589 值 `JSON.parse(x.task_json).discussion?.roo…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-478` | `openDiscussionRuns`（`store.ts:583`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L591 值 `false` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-479` | `matrixCursor`（`store.ts:596`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L597 值 `(this.db.prepare("SELECT sync_cursor FR…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-480` | `setMatrixCursor`（`store.ts:599`） | `字符串/路径/枚举输入` × `空` | 参数 `cursor: string` 的 `空` 类（store.ts:599） | 待实现 |
| `UT-REPO-481` | `setMatrixCursor`（`store.ts:599`） | `字符串/路径/枚举输入` × `超长` | 参数 `cursor: string` 的 `超长` 类（store.ts:599） | 待实现 |
| `UT-REPO-482` | `setMatrixCursor`（`store.ts:599`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `cursor: string` 的 `注入字符` 类（store.ts:599） | 待实现 |
| `UT-REPO-483` | `setMatrixCursor`（`store.ts:599`） | `持久化/序列化` × `round-trip` | 状态写 L600 → `db`（store.ts） | 待实现 |
| `UT-REPO-484` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `空` | 参数 `txn: string` 的 `空` 类（store.ts:602） | 待实现 |
| `UT-REPO-485` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `超长` | 参数 `txn: string` 的 `超长` 类（store.ts:602） | 待实现 |
| `UT-REPO-486` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `txn: string` 的 `注入字符` 类（store.ts:602） | 待实现 |
| `UT-REPO-487` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:602） | 待实现 |
| `UT-REPO-488` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:602） | 待实现 |
| `UT-REPO-489` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:602） | 待实现 |
| `UT-REPO-490` | `prepareMatrixSend`（`store.ts:602`） | `数值/长度上限参数` × `恰好通过` | 参数 `turn: number` 的 `恰好通过` 类（store.ts:602） | 待实现 |
| `UT-REPO-491` | `prepareMatrixSend`（`store.ts:602`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `turn: number` 的 `+1 拒绝` 类（store.ts:602） | 待实现 |
| `UT-REPO-492` | `prepareMatrixSend`（`store.ts:602`） | `数值/长度上限参数` × `−1 通过` | 参数 `turn: number` 的 `−1 通过` 类（store.ts:602） | 待实现 |
| `UT-REPO-493` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `空` | 参数 `payloadSha: string` 的 `空` 类（store.ts:602） | 待实现 |
| `UT-REPO-494` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `超长` | 参数 `payloadSha: string` 的 `超长` 类（store.ts:602） | 待实现 |
| `UT-REPO-495` | `prepareMatrixSend`（`store.ts:602`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `payloadSha: string` 的 `注入字符` 类（store.ts:602） | 待实现 |
| `UT-REPO-496` | `prepareMatrixSend`（`store.ts:602`） | `状态分支` × `合法迁移` | 分支 L605 `if (old)`（if；store.ts） | 待实现 |
| `UT-REPO-497` | `prepareMatrixSend`（`store.ts:602`） | `状态分支` × `合法迁移` | 分支 L606 `if (old.payload_sha256 !== payloadSha)`（if；store.ts） | 待实现 |
| `UT-REPO-498` | `prepareMatrixSend`（`store.ts:602`） | `错误路径` × `每个 typed 错误码` | throw L606 `TaskConflict`（守卫 `if (old.payload_sha256 !== payloadSha)`；store.ts） | 待实现 |
| `UT-REPO-499` | `prepareMatrixSend`（`store.ts:602`） | `持久化/序列化` × `round-trip` | 状态写 L609 → `db`（store.ts） | 待实现 |
| `UT-REPO-500` | `prepareMatrixSend`（`store.ts:602`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L603 值 `this.tx(() => { const old = this.db.pre…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-501` | `prepareMatrixSend`（`store.ts:602`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L607 值 `old` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-502` | `prepareMatrixSend`（`store.ts:602`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L610 值 `{ state: "Pending" }` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-503` | `finishMatrixSend`（`store.ts:613`） | `字符串/路径/枚举输入` × `空` | 参数 `txn: string` 的 `空` 类（store.ts:613） | 待实现 |
| `UT-REPO-504` | `finishMatrixSend`（`store.ts:613`） | `字符串/路径/枚举输入` × `超长` | 参数 `txn: string` 的 `超长` 类（store.ts:613） | 待实现 |
| `UT-REPO-505` | `finishMatrixSend`（`store.ts:613`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `txn: string` 的 `注入字符` 类（store.ts:613） | 待实现 |
| `UT-REPO-506` | `finishMatrixSend`（`store.ts:613`） | `字符串/路径/枚举输入` × `空` | 参数 `event: string` 的 `空` 类（store.ts:613） | 待实现 |
| `UT-REPO-507` | `finishMatrixSend`（`store.ts:613`） | `字符串/路径/枚举输入` × `超长` | 参数 `event: string` 的 `超长` 类（store.ts:613） | 待实现 |
| `UT-REPO-508` | `finishMatrixSend`（`store.ts:613`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `event: string` 的 `注入字符` 类（store.ts:613） | 待实现 |
| `UT-REPO-509` | `finishMatrixSend`（`store.ts:613`） | `持久化/序列化` × `round-trip` | 状态写 L614 → `db`（store.ts） | 待实现 |
| `UT-REPO-510` | `unknownMatrixSend`（`store.ts:616`） | `字符串/路径/枚举输入` × `空` | 参数 `txn: string` 的 `空` 类（store.ts:616） | 待实现 |
| `UT-REPO-511` | `unknownMatrixSend`（`store.ts:616`） | `字符串/路径/枚举输入` × `超长` | 参数 `txn: string` 的 `超长` 类（store.ts:616） | 待实现 |
| `UT-REPO-512` | `unknownMatrixSend`（`store.ts:616`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `txn: string` 的 `注入字符` 类（store.ts:616） | 待实现 |
| `UT-REPO-513` | `unknownMatrixSend`（`store.ts:616`） | `持久化/序列化` × `round-trip` | 状态写 L617 → `db`（store.ts） | 待实现 |
| `UT-REPO-514` | `tryCloseIntake`（`store.ts:619`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:619） | 待实现 |
| `UT-REPO-515` | `tryCloseIntake`（`store.ts:619`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:619） | 待实现 |
| `UT-REPO-516` | `tryCloseIntake`（`store.ts:619`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:619） | 待实现 |
| `UT-REPO-517` | `tryCloseIntake`（`store.ts:619`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（store.ts:619） | 待实现 |
| `UT-REPO-518` | `tryCloseIntake`（`store.ts:619`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:619） | 待实现 |
| `UT-REPO-519` | `tryCloseIntake`（`store.ts:619`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（store.ts:619） | 待实现 |
| `UT-REPO-520` | `tryCloseIntake`（`store.ts:619`） | `状态分支` × `合法迁移` | 分支 L622 `if (pending)`（if；store.ts） | 待实现 |
| `UT-REPO-521` | `tryCloseIntake`（`store.ts:619`） | `状态分支` × `合法迁移` | 分支 L626 `if (!r)`（if；store.ts） | 待实现 |
| `UT-REPO-522` | `tryCloseIntake`（`store.ts:619`） | `状态分支` × `合法迁移` | 分支 L626 `!r`（!；store.ts） | 待实现 |
| `UT-REPO-523` | `tryCloseIntake`（`store.ts:619`） | `状态分支` × `合法迁移` | 分支 L627 `if (r.discussion_intake_state === "Closing")`（if；store.ts） | 待实现 |
| `UT-REPO-524` | `tryCloseIntake`（`store.ts:619`） | `状态分支` × `合法迁移` | 分支 L628 `if (r.discussion_intake_state !== "Open")`（if；store.ts） | 待实现 |
| `UT-REPO-525` | `tryCloseIntake`（`store.ts:619`） | `持久化/序列化` × `round-trip` | 状态写 L629 → `db`（store.ts） | 待实现 |
| `UT-REPO-526` | `tryCloseIntake`（`store.ts:619`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L620 值 `this.tx(() => { const pending = (this.d…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-527` | `tryCloseIntake`（`store.ts:619`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L622 值 `false` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-528` | `tryCloseIntake`（`store.ts:619`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L626 值 `false` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-529` | `tryCloseIntake`（`store.ts:619`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L627 值 `true` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-530` | `tryCloseIntake`（`store.ts:619`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L628 值 `false` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-531` | `tryCloseIntake`（`store.ts:619`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L629 值 `this.db.prepare("UPDATE runs SET discus…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-532` | `cancel`（`store.ts:634`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:634） | 待实现 |
| `UT-REPO-533` | `cancel`（`store.ts:634`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:634） | 待实现 |
| `UT-REPO-534` | `cancel`（`store.ts:634`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:634） | 待实现 |
| `UT-REPO-535` | `cancel`（`store.ts:634`） | `状态分支` × `合法迁移` | 分支 L638 `if (isTerminal(r.state))`（if；store.ts） | 待实现 |
| `UT-REPO-536` | `cancel`（`store.ts:634`） | `状态分支` × `合法迁移` | 分支 L639 `if (r.state === "Queued")`（if；store.ts） | 待实现 |
| `UT-REPO-537` | `cancel`（`store.ts:634`） | `持久化/序列化` × `round-trip` | 状态写 L655 → `db`（store.ts） | 待实现 |
| `UT-REPO-538` | `cancel`（`store.ts:634`） | `持久化/序列化` × `round-trip` | 状态写 L656 → `db`（store.ts） | 待实现 |
| `UT-REPO-539` | `cancel`（`store.ts:634`） | `持久化/序列化` × `round-trip` | 状态写 L661 → `db`（store.ts） | 待实现 |
| `UT-REPO-540` | `cancel`（`store.ts:634`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L635 值 `this.tx(() => { const r = this.getRun(t…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-541` | `cancel`（`store.ts:634`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L638 值 `{ outcome: "AlreadyTerminal", requested…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-542` | `cancel`（`store.ts:634`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L659 值 `{ outcome: "CancelledBeforeStart", requ…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-543` | `cancel`（`store.ts:634`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L664 值 `{ outcome: "StopRequested", requested_a…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-544` | `cancelRequested`（`store.ts:667`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:667） | 待实现 |
| `UT-REPO-545` | `cancelRequested`（`store.ts:667`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:667） | 待实现 |
| `UT-REPO-546` | `cancelRequested`（`store.ts:667`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:667） | 待实现 |
| `UT-REPO-547` | `cancelRequested`（`store.ts:667`） | `状态分支` × `合法迁移` | 分支 L668 `!!(this.db.prepare("SELECT cancel_requested F…`（!；store.ts） | 待实现 |
| `UT-REPO-548` | `cancelRequested`（`store.ts:667`） | `状态分支` × `合法迁移` | 分支 L668 `!(this.db.prepare("SELECT cancel_requested FR…`（!；store.ts） | 待实现 |
| `UT-REPO-549` | `cancelRequested`（`store.ts:667`） | `状态分支` × `合法迁移` | 分支 L668 `(this.db.prepare("SELECT cancel_requested FRO…`（?.；store.ts） | 待实现 |
| `UT-REPO-550` | `cancelRequested`（`store.ts:667`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L668 值 `!!(this.db.prepare("SELECT cancel_reque…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-551` | `generation`（`store.ts:670`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:670） | 待实现 |
| `UT-REPO-552` | `generation`（`store.ts:670`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:670） | 待实现 |
| `UT-REPO-553` | `generation`（`store.ts:670`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:670） | 待实现 |
| `UT-REPO-554` | `generation`（`store.ts:670`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L671 值 `(this.db.prepare("SELECT generation FRO…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-555` | `usageSoFar`（`store.ts:674`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:674） | 待实现 |
| `UT-REPO-556` | `usageSoFar`（`store.ts:674`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:674） | 待实现 |
| `UT-REPO-557` | `usageSoFar`（`store.ts:674`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:674） | 待实现 |
| `UT-REPO-558` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L676 `if (!rows.length)`（if；store.ts） | 待实现 |
| `UT-REPO-559` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L676 `!rows.length`（!；store.ts） | 待实现 |
| `UT-REPO-560` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L682 `loop (rows)`（loop；store.ts） | 待实现 |
| `UT-REPO-561` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L684 `v.input ?? 0`（??；store.ts） | 待实现 |
| `UT-REPO-562` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L685 `v.output ?? 0`（??；store.ts） | 待实现 |
| `UT-REPO-563` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L686 `v.totalTokens ?? 0`（??；store.ts） | 待实现 |
| `UT-REPO-564` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L687 `v.cacheRead ?? 0`（??；store.ts） | 待实现 |
| `UT-REPO-565` | `usageSoFar`（`store.ts:674`） | `状态分支` × `合法迁移` | 分支 L688 `v.cacheWrite ?? 0`（??；store.ts） | 待实现 |
| `UT-REPO-566` | `usageSoFar`（`store.ts:674`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L676 值 `{ input_tokens: null, output_tokens: nu…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-567` | `usageSoFar`（`store.ts:674`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L690 值 `{ input_tokens: i + ci + co, output_tok…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-568` | `rawUsage`（`store.ts:692`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:692） | 待实现 |
| `UT-REPO-569` | `rawUsage`（`store.ts:692`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:692） | 待实现 |
| `UT-REPO-570` | `rawUsage`（`store.ts:692`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:692） | 待实现 |
| `UT-REPO-571` | `rawUsage`（`store.ts:692`） | `状态分支` × `合法迁移` | 分支 L698 `if (value.cost && typeof value.input === "num…`（if；store.ts） | 待实现 |
| `UT-REPO-572` | `rawUsage`（`store.ts:692`） | `状态分支` × `合法迁移` | 分支 L699 `value.cost && typeof value.input === "number"…`（&&；store.ts） | 待实现 |
| `UT-REPO-573` | `rawUsage`（`store.ts:692`） | `状态分支` × `合法迁移` | 分支 L699 `value.cost && typeof value.input === "number"`（&&；store.ts） | 待实现 |
| `UT-REPO-574` | `rawUsage`（`store.ts:692`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L693 值 `this.db .prepare("SELECT raw_usage_json…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-575` | `rawUsage`（`store.ts:692`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L706 值 `{ ...value, input: value.input + value.…` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-576` | `rawUsage`（`store.ts:692`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L708 值 `value` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-577` | `knownActions`（`store.ts:711`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:711） | 待实现 |
| `UT-REPO-578` | `knownActions`（`store.ts:711`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:711） | 待实现 |
| `UT-REPO-579` | `knownActions`（`store.ts:711`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:711） | 待实现 |
| `UT-REPO-580` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L713 `loop (this.db .prepare("SELECT operation_id,s…`（loop；store.ts） | 待实现 |
| `UT-REPO-581` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L718 `? x.state === "Terminal" :`（ternary；store.ts） | 待实现 |
| `UT-REPO-582` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L718 `? x.state === "Unknown" :`（ternary；store.ts） | 待实现 |
| `UT-REPO-583` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L722 `loop (this.db .prepare("SELECT operation_id,t…`（loop；store.ts） | 待实现 |
| `UT-REPO-584` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L727 `? x.state === "Terminal" :`（ternary；store.ts） | 待实现 |
| `UT-REPO-585` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L727 `? x.state === "Unknown" :`（ternary；store.ts） | 待实现 |
| `UT-REPO-586` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L731 `loop (this.db.prepare("SELECT txn_id,state FR…`（loop；store.ts） | 待实现 |
| `UT-REPO-587` | `knownActions`（`store.ts:711`） | `状态分支` × `合法迁移` | 分支 L732 `? x.state === "Sent" :`（ternary；store.ts） | 待实现 |
| `UT-REPO-588` | `knownActions`（`store.ts:711`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L734 值 `actions` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-589` | `insertResult`（`store.ts:737`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:737） | 待实现 |
| `UT-REPO-590` | `insertResult`（`store.ts:737`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:737） | 待实现 |
| `UT-REPO-591` | `insertResult`（`store.ts:737`） | `纯函数/无副作用` × `非法值` | 参数 `result: AgentResult` 的 `非法值` 类（store.ts:737） | 待实现 |
| `UT-REPO-592` | `insertResult`（`store.ts:737`） | `持久化/序列化` × `round-trip` | 状态写 L741 → `db`（store.ts） | 待实现 |
| `UT-REPO-593` | `insertResult`（`store.ts:737`） | `资源获取/释放` × `获取失败路径` | 资源操作 L740 `createHash`（store.ts） | 待实现 |
| `UT-REPO-594` | `publishResult`（`store.ts:745`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:745） | 待实现 |
| `UT-REPO-595` | `publishResult`（`store.ts:745`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:745） | 待实现 |
| `UT-REPO-596` | `publishResult`（`store.ts:745`） | `纯函数/无副作用` × `非法值` | 参数 `result: AgentResult` 的 `非法值` 类（store.ts:745） | 待实现 |
| `UT-REPO-597` | `publishResult`（`store.ts:745`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（store.ts:745） | 待实现 |
| `UT-REPO-598` | `publishResult`（`store.ts:745`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:745） | 待实现 |
| `UT-REPO-599` | `publishResult`（`store.ts:745`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（store.ts:745） | 待实现 |
| `UT-REPO-600` | `publishResult`（`store.ts:745`） | `并发/可重入` × `并发对偶/交错` | 分支 L748 `if (slot.task_id !== result.task_id \|\| slot.l…`（if；store.ts） | 待实现 |
| `UT-REPO-601` | `publishResult`（`store.ts:745`） | `并发/可重入` × `并发对偶/交错` | 分支 L748 `slot.task_id !== result.task_id \|\| slot.lease…`（\|\|；store.ts） | 待实现 |
| `UT-REPO-602` | `publishResult`（`store.ts:745`） | `错误路径` × `每个 typed 错误码` | throw L748 `LeaseLost`（守卫 `if (slot.task_id !== result.task_id \|\| …`；store.ts） | 待实现 |
| `UT-REPO-603` | `publishResult`（`store.ts:745`） | `持久化/序列化` × `round-trip` | 状态写 L750 → `db`（store.ts） | 待实现 |
| `UT-REPO-604` | `finish`（`store.ts:755`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:755） | 待实现 |
| `UT-REPO-605` | `finish`（`store.ts:755`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:755） | 待实现 |
| `UT-REPO-606` | `finish`（`store.ts:755`） | `纯函数/无副作用` × `非法值` | 参数 `result: AgentResult` 的 `非法值` 类（store.ts:755） | 待实现 |
| `UT-REPO-607` | `finish`（`store.ts:755`） | `数值/长度上限参数` × `恰好通过` | 参数 `epoch: number` 的 `恰好通过` 类（store.ts:755） | 待实现 |
| `UT-REPO-608` | `finish`（`store.ts:755`） | `数值/长度上限参数` × `+1 拒绝` | 参数 `epoch: number` 的 `+1 拒绝` 类（store.ts:755） | 待实现 |
| `UT-REPO-609` | `finish`（`store.ts:755`） | `数值/长度上限参数` × `−1 通过` | 参数 `epoch: number` 的 `−1 通过` 类（store.ts:755） | 待实现 |
| `UT-REPO-610` | `finish`（`store.ts:755`） | `并发/可重入` × `并发对偶/交错` | 分支 L758 `if (slot.task_id !== result.task_id \|\| slot.l…`（if；store.ts） | 待实现 |
| `UT-REPO-611` | `finish`（`store.ts:755`） | `并发/可重入` × `并发对偶/交错` | 分支 L758 `slot.task_id !== result.task_id \|\| slot.lease…`（\|\|；store.ts） | 待实现 |
| `UT-REPO-612` | `finish`（`store.ts:755`） | `状态分支` × `合法迁移` | 分支 L761 `if (result.state === "Completed" && run.discu…`（if；store.ts） | 待实现 |
| `UT-REPO-613` | `finish`（`store.ts:755`） | `状态分支` × `合法迁移` | 分支 L761 `result.state === "Completed" && run.discussio…`（&&；store.ts） | 待实现 |
| `UT-REPO-614` | `finish`（`store.ts:755`） | `状态分支` × `合法迁移` | 分支 L761 `run.discussion_intake_state !== "Closing" \|\| …`（\|\|；store.ts） | 待实现 |
| `UT-REPO-615` | `finish`（`store.ts:755`） | `状态分支` × `合法迁移` | 分支 L764 `if (result.state !== "Completed")`（if；store.ts） | 待实现 |
| `UT-REPO-616` | `finish`（`store.ts:755`） | `状态分支` × `合法迁移` | 分支 L767 `if (!this.db.prepare("SELECT 1 FROM results W…`（if；store.ts） | 待实现 |
| `UT-REPO-617` | `finish`（`store.ts:755`） | `状态分支` × `合法迁移` | 分支 L767 `!this.db.prepare("SELECT 1 FROM results WHERE…`（!；store.ts） | 待实现 |
| `UT-REPO-618` | `finish`（`store.ts:755`） | `错误路径` × `每个 typed 错误码` | throw L758 `LeaseLost`（守卫 `if (slot.task_id !== result.task_id \|\| …`；store.ts） | 待实现 |
| `UT-REPO-619` | `finish`（`store.ts:755`） | `错误路径` × `每个 typed 错误码` | throw L762 `DiscussionNotClosed`（守卫 `if (result.state === "Completed" && run…`；store.ts） | 待实现 |
| `UT-REPO-620` | `finish`（`store.ts:755`） | `持久化/序列化` × `round-trip` | 状态写 L765 → `db`（store.ts） | 待实现 |
| `UT-REPO-621` | `finish`（`store.ts:755`） | `持久化/序列化` × `round-trip` | 状态写 L770 → `db`（store.ts） | 待实现 |
| `UT-REPO-622` | `finish`（`store.ts:755`） | `持久化/序列化` × `round-trip` | 状态写 L773 → `db`（store.ts） | 待实现 |
| `UT-REPO-623` | `finishQueued`（`store.ts:780`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `result: AgentResult` 的 `每等价类合法值` 类（store.ts:780） | 待实现 |
| `UT-REPO-624` | `finishQueued`（`store.ts:780`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `result: AgentResult` 的 `边界(上/下/零/空/满)` 类（store.ts:780） | 待实现 |
| `UT-REPO-625` | `finishQueued`（`store.ts:780`） | `纯函数/无副作用` × `非法值` | 参数 `result: AgentResult` 的 `非法值` 类（store.ts:780） | 待实现 |
| `UT-REPO-626` | `finishQueued`（`store.ts:780`） | `状态分支` × `合法迁移` | 分支 L783 `if (!r)`（if；store.ts） | 待实现 |
| `UT-REPO-627` | `finishQueued`（`store.ts:780`） | `状态分支` × `合法迁移` | 分支 L783 `!r`（!；store.ts） | 待实现 |
| `UT-REPO-628` | `finishQueued`（`store.ts:780`） | `状态分支` × `合法迁移` | 分支 L784 `if (isTerminal(r.state))`（if；store.ts） | 待实现 |
| `UT-REPO-629` | `finishQueued`（`store.ts:780`） | `状态分支` × `合法迁移` | 分支 L785 `if (!this.db.prepare("SELECT 1 FROM results W…`（if；store.ts） | 待实现 |
| `UT-REPO-630` | `finishQueued`（`store.ts:780`） | `状态分支` × `合法迁移` | 分支 L785 `!this.db.prepare("SELECT 1 FROM results WHERE…`（!；store.ts） | 待实现 |
| `UT-REPO-631` | `finishQueued`（`store.ts:780`） | `错误路径` × `每个 typed 错误码` | throw L783 `NotFound`（守卫 `if (!r)`；store.ts） | 待实现 |
| `UT-REPO-632` | `finishQueued`（`store.ts:780`） | `持久化/序列化` × `round-trip` | 状态写 L788 → `db`（store.ts） | 待实现 |
| `UT-REPO-633` | `finishQueued`（`store.ts:780`） | `持久化/序列化` × `round-trip` | 状态写 L791 → `db`（store.ts） | 待实现 |
| `UT-REPO-634` | `finishQueued`（`store.ts:780`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L784 值 `（无值 return：提前退出）` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-635` | `result`（`store.ts:795`） | `字符串/路径/枚举输入` × `空` | 参数 `taskId: string` 的 `空` 类（store.ts:795） | 待实现 |
| `UT-REPO-636` | `result`（`store.ts:795`） | `字符串/路径/枚举输入` × `超长` | 参数 `taskId: string` 的 `超长` 类（store.ts:795） | 待实现 |
| `UT-REPO-637` | `result`（`store.ts:795`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `taskId: string` 的 `注入字符` 类（store.ts:795） | 待实现 |
| `UT-REPO-638` | `result`（`store.ts:795`） | `状态分支` × `合法迁移` | 分支 L797 `if (r)`（if；store.ts） | 待实现 |
| `UT-REPO-639` | `result`（`store.ts:795`） | `状态分支` × `合法迁移` | 分支 L799 `if (!isTerminal(state))`（if；store.ts） | 待实现 |
| `UT-REPO-640` | `result`（`store.ts:795`） | `状态分支` × `合法迁移` | 分支 L799 `!isTerminal(state)`（!；store.ts） | 待实现 |
| `UT-REPO-641` | `result`（`store.ts:795`） | `错误路径` × `每个 typed 错误码` | throw L799 `TaskNotTerminal`（守卫 `if (!isTerminal(state))`；store.ts） | 待实现 |
| `UT-REPO-642` | `result`（`store.ts:795`） | `错误路径` × `每个 typed 错误码` | throw L800 `ResultUnavailable`（守卫 `unconditional`；store.ts） | 待实现 |
| `UT-REPO-643` | `result`（`store.ts:795`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L797 值 `JSON.parse(r.result_json)` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-644` | `purge`（`store.ts:804`） | `字符串/路径/枚举输入` × `空` | 参数 `scope: { task_id: string } \| "all"` 的 `空` 类（store.ts:804） | 待实现 |
| `UT-REPO-645` | `purge`（`store.ts:804`） | `字符串/路径/枚举输入` × `超长` | 参数 `scope: { task_id: string } \| "all"` 的 `超长` 类（store.ts:804） | 待实现 |
| `UT-REPO-646` | `purge`（`store.ts:804`） | `字符串/路径/枚举输入` × `注入字符` | 参数 `scope: { task_id: string } \| "all"` 的 `注入字符` 类（store.ts:804） | 待实现 |
| `UT-REPO-647` | `purge`（`store.ts:804`） | `状态分支` × `合法迁移` | 分支 L807 `? scope === "all" :`（ternary；store.ts） | 待实现 |
| `UT-REPO-648` | `purge`（`store.ts:804`） | `状态分支` × `合法迁移` | 分支 L814 `loop (rows)`（loop；store.ts） | 待实现 |
| `UT-REPO-649` | `purge`（`store.ts:804`） | `状态分支` × `合法迁移` | 分支 L816 `if (!identity)`（if；store.ts） | 待实现 |
| `UT-REPO-650` | `purge`（`store.ts:804`） | `状态分支` × `合法迁移` | 分支 L816 `!identity`（!；store.ts） | 待实现 |
| `UT-REPO-651` | `purge`（`store.ts:804`） | `状态分支` × `合法迁移` | 分支 L817 `if (identity.identity_state === "Tombstone")`（if；store.ts） | 待实现 |
| `UT-REPO-652` | `purge`（`store.ts:804`） | `状态分支` × `合法迁移` | 分支 L818 `loop (["matrix_sends", "discussion_turns", "d…`（loop；store.ts） | 待实现 |
| `UT-REPO-653` | `purge`（`store.ts:804`） | `持久化/序列化` × `round-trip` | 状态写 L819 → `db`（store.ts） | 待实现 |
| `UT-REPO-654` | `purge`（`store.ts:804`） | `持久化/序列化` × `round-trip` | 状态写 L821 → `db`（store.ts） | 待实现 |
| `UT-REPO-655` | `purge`（`store.ts:804`） | `持久化/序列化` × `round-trip` | 状态写 L822 → `db`（store.ts） | 待实现 |
| `UT-REPO-656` | `purge`（`store.ts:804`） | `持久化/序列化` × `round-trip` | 状态写 L823 → `db`（store.ts） | 待实现 |
| `UT-REPO-657` | `purge`（`store.ts:804`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L805 值 `this.tx(() => { const rows = scope === …` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-658` | `purge`（`store.ts:804`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L827 值 `{ removed, tombstones }` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-659` | `purgeExpired`（`store.ts:832`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L833 值 `this.purge("all").removed` 逐值断言（store.ts） | 待实现 |
| `UT-REPO-660` | `asReader`（`store.ts:855`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `store: TaskStore` 的 `每等价类合法值` 类（store.ts:855） | 待实现 |
| `UT-REPO-661` | `asReader`（`store.ts:855`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `store: TaskStore` 的 `边界(上/下/零/空/满)` 类（store.ts:855） | 待实现 |
| `UT-REPO-662` | `asReader`（`store.ts:855`） | `纯函数/无副作用` × `非法值` | 参数 `store: TaskStore` 的 `非法值` 类（store.ts:855） | 待实现 |
| `UT-REPO-663` | `asReader`（`store.ts:855`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L856 值 `{ getTask: store.getTask.bind(store), g…` 逐值断言（store.ts） | 待实现 |
