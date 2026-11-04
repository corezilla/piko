# UT 分卷登记 · USAGE（波次二：逐站点全量登记）

> 本卷是 `unit-test-scheme` §6 的分卷登记（STD 分卷结构）：Case 由 `scripts/derive-ut-cases-full.mjs`
> 从 `docs/70_verification/unit/ut-denominator.md`（AST 枚举表）逐站点派生，**一格一 Case**；
> 全部登记状态 `待实现`（`Planned`）——清单先行，脚本按清单编写。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --json /tmp/ut-denominator.json --md docs/70_verification/unit/ut-denominator.md && node scripts/derive-ut-cases-full.mjs`

**本卷 Case 数：26**（对象类型分布：纯函数/无副作用 4；状态分支 14；错误路径 8）

| Case ID | 被测符号 | 对象类型 × 维度格 | 责任摘要（测什么） | 登记状态 |
|---|---|---|---|---|
| `UT-USAGE-003` | `emptyUsage`（`semantic.ts:14`） | `纯函数/无副作用` × `每等价类合法值` | 返回站点 L14 值 `{source:"PiModelResponses",quality:"Com…` 逐值断言（semantic.ts） | 待实现 |
| `UT-USAGE-004` | `validateUsage`（`semantic.ts:3`） | `纯函数/无副作用` × `每等价类合法值` | 参数 `u: TokenUsage` 的 `每等价类合法值` 类（semantic.ts:3） | 待实现 |
| `UT-USAGE-005` | `validateUsage`（`semantic.ts:3`） | `纯函数/无副作用` × `边界(上/下/零/空/满)` | 参数 `u: TokenUsage` 的 `边界(上/下/零/空/满)` 类（semantic.ts:3） | 待实现 |
| `UT-USAGE-006` | `validateUsage`（`semantic.ts:3`） | `纯函数/无副作用` × `非法值` | 参数 `u: TokenUsage` 的 `非法值` 类（semantic.ts:3） | 待实现 |
| `UT-USAGE-007` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L6 `loop (fields)`（loop；semantic.ts） | 待实现 |
| `UT-USAGE-008` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L7 `u.quality === "Complete" && (known.length !==…`（&&；semantic.ts） | 待实现 |
| `UT-USAGE-009` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L7 `known.length !== 6 \|\| u.usage_observed_attemp…`（\|\|；semantic.ts） | 待实现 |
| `UT-USAGE-010` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L8 `u.quality === "Partial" && (known.length === …`（&&；semantic.ts） | 待实现 |
| `UT-USAGE-011` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L8 `known.length === 0 \|\| known.length === 6 \|\| u…`（\|\|；semantic.ts） | 待实现 |
| `UT-USAGE-012` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L8 `known.length === 0 \|\| known.length === 6`（\|\|；semantic.ts） | 待实现 |
| `UT-USAGE-013` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L9 `u.quality === "Unknown" && known.length !== 0`（&&；semantic.ts） | 待实现 |
| `UT-USAGE-014` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L10 `u.input_tokens !== null && u.output_tokens !=…`（&&；semantic.ts） | 待实现 |
| `UT-USAGE-015` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L11 `u.input_tokens !== null && ((u.cache_read_tok…`（&&；semantic.ts） | 待实现 |
| `UT-USAGE-016` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L11 `(u.cache_read_tokens ?? 0)>u.input_tokens \|\| …`（\|\|；semantic.ts） | 待实现 |
| `UT-USAGE-017` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L11 `u.cache_read_tokens ?? 0`（??；semantic.ts） | 待实现 |
| `UT-USAGE-018` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L11 `u.cache_write_tokens ?? 0`（??；semantic.ts） | 待实现 |
| `UT-USAGE-019` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L12 `u.output_tokens !== null && (u.reasoning_toke…`（&&；semantic.ts） | 待实现 |
| `UT-USAGE-020` | `validateUsage`（`semantic.ts:3`） | `状态分支` × `合法迁移` | 分支 L12 `u.reasoning_tokens ?? 0`（??；semantic.ts） | 待实现 |
| `UT-USAGE-021` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L4 `usage observed attempts exceed model attempts`（守卫 `if (u.usage_observed_attempts > u.model…`；semantic.ts） | 待实现 |
| `UT-USAGE-022` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L6 `reject`（守卫 `if ((u[f] === null) !== missing.has(f))`；semantic.ts） | 待实现 |
| `UT-USAGE-023` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L7 `invalid Complete usage`（守卫 `if (u.quality === "Complete" && (known.…`；semantic.ts） | 待实现 |
| `UT-USAGE-024` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L8 `invalid Partial usage`（守卫 `if (u.quality === "Partial" && (known.l…`；semantic.ts） | 待实现 |
| `UT-USAGE-025` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L9 `invalid Unknown usage`（守卫 `if (u.quality === "Unknown" && known.le…`；semantic.ts） | 待实现 |
| `UT-USAGE-026` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L10 `usage total mismatch`（守卫 `if (u.input_tokens !== null && u.output…`；semantic.ts） | 待实现 |
| `UT-USAGE-027` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L11 `cache usage exceeds input`（守卫 `if (u.input_tokens !== null && ((u.cach…`；semantic.ts） | 待实现 |
| `UT-USAGE-028` | `validateUsage`（`semantic.ts:3`） | `错误路径` × `每个 typed 错误码` | throw L12 `reasoning usage exceeds output`（守卫 `if (u.output_tokens !== null && (u.reas…`；semantic.ts） | 待实现 |
