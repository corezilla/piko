<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko unit-test-report

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `unit-test-report` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | Claude |
| Created Date | `2026-11-03` |
| Last Modified Date | `2026-11-03` |
| Template ID | `tests.unit-test-report` |
| Template Version | `0.10.9` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/unit/reports/unit-test-report.md` |
| Supersedes | none |

<!-- STD_DOCUMENT_COVER_END -->

## 1. 本轮 Run

- **Run ID**：`unit-local-2026-11-03`
- **环境**：`ENV-1`（纯内存、无网络、无 live 套件）
- **命令**：`npx vitest run`
- **时间**：2026-11-03T23:04:05.305500
- **基线**：分支 `main`，契约 `0.3.0-simplified.6`，Pi `0.85.1` @ `9767ba27`

**执行结果**：297 个测试，**296 passed / 0 failed / 1 skipped**，退出码 0。

**前置检查**（计划 §3）：

| 前检项 | 判定 | 依据 |
|---|---|---|
| §3.1 方案就绪度 | **Go** | 方案 §6 登记 148 个 Case ID，其中 2 个是文档自带的虚构示例 `UT-FD-*`（FrameDecoder），实际 Case 136 条，全部有同名用例文档 |
| §3.2 Case 实现状态盘点 | **Go** | 136 份用例文档全部存在；136 条 Case 全部指向**存在且通过**的 `tests/unit/*.test.ts` 入口 |
| §3.3 环境与工具 | **Go** | `asset-design` §6 登记全部资产 `Verified`；`FAKE-CLOCK` 已落地为 `src/clock.ts` + `tests/unit/clock.test.ts`，`G-ASSET-001` 已关闭；`npm run check` 退出码 0 |
| §3.4 构建接线 | **Go** | `tsc --noEmit` 零错误；`validate_v03_contract.py` PASS；alias 指向 `upstream/pi/` 真实 vendored 源码 |

## 2. 逐 Case Verdict

计划 §8.1 风险条目要求 Run 记录写明「入口文件 ＋ 覆盖的 `UT-*-001` ＋ VRC 区间」三元组。本报告的 VRC 区间以「来源 ISD」列表达（每个 Case 登记的 `设计验证项` 落在该 ISD 的 VRC 集合内）。

| 组 | Case 数 | PASS | 入口文件 |
|---|---|---|---|
| `BOOT` | 10 | 10 | `clock.test.ts`, `config-schema.test.ts`, `config.test.ts`, `core.test.ts` |
| `TAPI` | 3 | 3 | `auth.test.ts`, `server.test.ts` |
| `POLICY` | 11 | 11 | `policy-paths.test.ts`, `workspace.test.ts` |
| `REPO` | 51 | 51 | `store-matrix.test.ts`, `store-state.test.ts`, `store.test.ts` |
| `SCHED` | 5 | 5 | `p-input.test.ts`, `scheduler.test.ts` |
| `WORKER` | 11 | 11 | `tool-recovery.test.ts`, `worker-runtime.test.ts`, `worker.test.ts` |
| `PI` | 7 | 7 | `pi-runtime.test.ts`, `provider-preflight.test.ts`, `responses-replay.test.ts` |
| `USAGE` | 2 | 2 | `usage.test.ts` |
| `MATRIX` | 11 | 11 | `matrix-membership.test.ts`, `matrix.test.ts` |
| `TRANSFER` | 8 | 8 | `p-input.test.ts`, `transfer-guards.test.ts`, `transfer-paths.test.ts` |
| `OBS` | 7 | 7 | `observability.test.ts`, `server.test.ts` |
| `IPC` | 10 | 10 | `ipc.test.ts` |
| **合计** | **136** | **136** | 19 个入口文件 |

完整逐条 Run 记录（含每个 Case 的入口文件、来源 ISD、对象类型、优先级、被测符号、Verdict）见 `var/verification/unit/ut-run-20261103-01/run-records.json`。

## 3. 符号级覆盖（Gate 判定的关键）

**Case 全部 PASS 不等于被测符号全部被断言。** 计划 §8.1 已登记该风险：「一条 Case 的 VRC 区间无法逐条追到断言点」。本轮按「被测符号是否真的出现在其入口文件的断言里」复核了一遍：

- STD 用例文档声明的被测符号断言：**256** 项
- 在其入口文件中被断言：**158** 项
- 该符号**是 `src/` 的导出**但入口文件从未断言：**26** 项
- 该符号**在 `src/` 里根本不是任何导出**（多为私有方法或方法名与实际实现不符）：**72** 项

按 Case 的符号覆盖完整度分级：

| 分级 | Case 数 | 含义 |
|---|---|---|
| `PASS` | 56 | 入口文件全部被测符号都有断言 |
| `PASS(partial)` | 58 | 部分符号有断言 |
| `PASS(gap)` | 22 | 被测符号在入口文件中一个都没出现 |

### 3.1 导出但未被断言的符号（真实缺口）

这些符号在 `src/` 里确实存在且导出，但其 Case 指定的入口文件从未引用它们——即该 Case 声明的 VRC 区间**没有落到断言点上**：

| Case | 符号 |
|---|---|
| `UT-BOOT-003` | `loadConfig` |
| `UT-BOOT-004` | `main` |
| `UT-BOOT-006` | `loadConfig` |
| `UT-BOOT-007` | `loadConfig` |
| `UT-BOOT-007` | `resolveSecret` |
| `UT-BOOT-008` | `loadConfig` |
| `UT-BOOT-008` | `runControlProcess` |
| `UT-BOOT-009` | `main` |
| `UT-IPC-001` | `ExecutionProcessSupervisor` |
| `UT-IPC-002` | `ExecutionProcessSupervisor` |
| `UT-IPC-003` | `ExecutionProcessSupervisor` |
| `UT-IPC-004` | `ExecutionProcessSupervisor` |
| `UT-IPC-005` | `runExecutionProcess` |
| `UT-IPC-008` | `PikoError` |
| `UT-IPC-009` | `PikoError` |
| `UT-PI-001` | `PiRuntime` |
| `UT-PI-002` | `PiRuntime` |
| `UT-PI-003` | `PiRuntime` |
| `UT-PI-004` | `isProviderUnavailableMessage` |
| `UT-POLICY-001` | `Policy` |
| `UT-POLICY-002` | `Policy` |
| `UT-POLICY-003` | `Policy` |
| `UT-POLICY-004` | `emptyUsage` |
| `UT-POLICY-011` | `validateUsage` |
| `UT-TRANSFER-001` | `DurableNodeExecutionEnv` |
| `UT-TRANSFER-002` | `DurableNodeExecutionEnv` |

### 3.2 在 `src/` 里不是导出的符号（Case 文档与实现不符）

这些符号名在 `src/` 里只以私有方法或不同名字存在。Case 文档写的是「被测符号 `X`（`src/` 中真实存在）」，但 `X` 不是可独立调用的导出单元——要么需要通过公开入口间接覆盖，要么 Case 文档写错了名字。

| 符号 | 出现次数 |
|---|---|
| `bindToolProfile` | 4 |
| `createOrGetRun` | 4 |
| `mutateRun` | 4 |
| `readSlot` | 3 |
| `load` | 2 |
| `ingestMatrixBatch` | 2 |
| `canonicalizePath` | 2 |
| `fenceSlot` | 2 |
| `listQueued` | 2 |
| `openStore` | 2 |
| `patchTerminal` | 2 |
| `scanNonTerminalRuns` | 2 |
| `acquireSlot` | 2 |
| `build` | 2 |
| `matrixWhoami` | 1 |
| `kill` | 1 |
| `spawn` | 1 |
| `startWatchdog` | 1 |
| `stop` | 1 |
| `unhealthy` | 1 |
| `auditMembership` | 1 |
| `prepareEvent` | 1 |
| `verifyDiscussion` | 1 |
| `appendAudit` | 1 |
| `createObservability` | 1 |
| `execute` | 1 |
| `drive` | 1 |
| `canonicalize` | 1 |
| `validateResult` | 1 |
| `discussionAccessLost` | 1 |
| `failAccessLostTasks` | 1 |
| `inputStaging` | 1 |
| `insertResult` | 1 |
| `markDiscussionAccessLost` | 1 |
| `migrate` | 1 |
| `recordProviderCall` | 1 |
| `recoverOrphaned` | 1 |
| `setArtifactDelivery` | 1 |
| `setInputStaging` | 1 |
| `route` | 1 |
| `assertAllowed` | 1 |
| `scpArgs` | 1 |
| `scpKeyPath` | 1 |
| `check` | 1 |
| `claimNext` | 1 |
| `isAborted` | 1 |
| `loop` | 1 |
| `report` | 1 |
| `reportPreconditionFailure` | 1 |
| `requestAbort` | 1 |
| `stageInputs` | 1 |

### 3.3 `Tailored-N/A` 裁决（不计入分母）

方案 §7.1 登记的裁剪项，按 §7「须在报告列出裁决依据」列出：

| 裁决 | 依据 | 是否计入分母 |
|---|---|---|
| 控件面 | Tailored-N/A —— 无 UI | 否 |
| 成本护栏 | Tailored-N/A —— 无 Cost | 否 |
| 性能预算 | Tailored-N/A —— 无预算分母 | 否 |
| 长稳 | Tailored-N/A —— 无 endurance | 否 |
| 逐 Case 文档 | Gap —— `UT-*-001` case 文档未逐条撰写 | **已关闭**：136 份 `tests.unit-case` 文档齐备并全部指向可执行入口 |

方案 §6 中 136 条 Case 的**设计状态全部为 `Designed`**，无 `Gap`、无 `N/A` 条目。

## 4. Gate 建议

计划 §7 的 Gate 规则：**全部处于 `Implemented` 的 Case 均 `PASS` 且无未关闭 Gap → 建议 pass**；任一 Case `FAIL` → 建议 not pass；`BLOCKED` 单独列出。

- **Case 级**：136/136 `PASS`，无 `FAIL`、无 `BLOCKED`、无 `INVALID`。
- **符号级**：158/256 个声明的被测符号在其入口文件中有断言；**98 个没有**。

**建议：not pass（Case 级通过，符号级未闭合）。**

理由：计划 §8.1 把「一条 Case 的 VRC 区间无法逐条追到断言点」列为**已知风险**，而本轮实测把该风险量化了——136 条 Case 全绿，但它们声明的 256 项符号断言里有 98 项落不到断言点。按 §7「Gate ＝ 全部 Case 均 PASS **且无未关闭 Gap**」，这些未闭合的符号断言构成 Gap，因此不能给 pass。

**本层 PASS 不关闭模块层 Gate**（计划 §1.4）。本报告只给建议，不越权批准。

## 5. 缺口清单

| 缺口 | Owner | 内容 | 最晚 Gate |
|---|---|---|---|
| `G-EXEC-UT-1` | 测试工程 | 26 个导出但未被断言的符号：为每个补入口文件中的直接断言（`loadConfig` / `PiRuntime` / `ExecutionProcessSupervisor` / `Policy` / `DurableNodeExecutionEnv` 等），或改派给已有覆盖它的入口文件 | 本报告复审前 |
| `G-EXEC-UT-2` | 测试工程 + 模块 Owner | 72 个在 `src/` 里不是导出的符号名：逐个确认是「私有方法需经公开入口间接覆盖」还是「Case 文档写错符号名」；后者回溯修订用例集段落 | 本报告复审前 |
| `G-EXEC-UT-3` | 测试工程 | 用例集段落未按 `UT-*-NNN` 组织 `describe`，导致「断言失败 → 反推哪个 Case 的 VRC 被违反」不可行。按计划 §8.1 的缓解出口，把现有 describe 块映射进用例集段落 | 模块层 Gate 前 |

## 6. 本轮新增但不在 STD 分母内的覆盖

V0.1.3 期间新增的实现与测试不在本轮 STD 分母（136 条）内，但已被 `npm run check` 覆盖：

| 能力 | 入口 |
|---|---|
| SSH 远程执行（`remote_bash`）、执行事实、失败语义 | `tests/unit/remote-exec.test.ts`、`tests/unit/remote-exec-facts.test.ts`、`tests/unit/transfer-ssh-args.test.ts` |
| 命令行客户端 | `tests/unit/piko-cli.test.ts` |
| 可执行文件白名单强制执行、认证、矩阵成员、存储状态 | `tests/unit/tool-recovery.test.ts`、`tests/unit/auth.test.ts`、`tests/unit/matrix-membership.test.ts`、`tests/unit/store-state.test.ts`、`tests/unit/store-matrix.test.ts`、`tests/unit/policy-paths.test.ts`、`tests/unit/scheduler.test.ts`、`tests/unit/usage.test.ts`、`tests/unit/transfer-guards.test.ts`、`tests/unit/transfer-paths.test.ts` |
| Skill 自动预取 | `src/skill-prefetch.test.ts`、`tests/integration/skill-prefetch-e2e.test.ts`、`tests/unit/pi-runtime.test.ts` |

这些应作为下一轮 STD 方案升版的输入（新增 ISD 符号 → 方案 §6 扩分母 → 用例集补段落）。

## 7. 复现方式

```bash
npx vitest run --reporter=json --outputFile=/tmp/vitest-full.json   # 执行
python3 scripts/validate-cross-refs.py                              # 文档交叉引用
```

Run 证据目录：`var/verification/unit/ut-run-20261103-01/`——含 `vitest-report.json`（逐测试断言结果）、`stdout.txt`、`stderr.txt`、`exit-code.txt`、`environment.md`（Node/npm/vitest/TS 版本、分支、commit）、`run-records.json`（逐 Case 三元组）、`execution-queue.json`（执行队列）。

资产就绪清单：`var/verification/unit/assets-ready-20261103.md`（计划 §9.1 Step 0 产出）。
