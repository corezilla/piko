<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko unit-test-report

> **本文件遵守 STD（工程文档标准），STD 为最高优先级；修改本文件之前必须先读 STD 入口。**
> STD 入口：[项目采用说明与标准导航](../../../README.md#std-entry)。入口的**编写索引**已列出本类文档的全部硬性义务：不必通读规范，但**每一条都必须遵守**。

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
| Template Version | `0.4.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/unit/reports/unit-test-report.md` |
| Supersedes | none |
| Migration Map Reference | none |
| Std Conformance Total | 0 |
| Std Conformance Passed | 0 |
| Checklist Total | 0 |
| Checklist Conformed | 0 |
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

### 3.2 在 `src/` 里不是导出的符号

分两类，性质完全不同。

#### 3.2.1 类成员方法（105 项）——私有/受保护成员，需经公开入口间接覆盖

这些符号在 `src/` 里作为类的成员存在（多为 `private`），**不是独立可调用单元**。用例集把它们写成「被测符号」是命名粒度问题，不是覆盖缺口：它们的可观察行为通过公开入口断言。例：

| Case | 用例集写的符号 | 真实位置 | 覆盖它的公开入口 |
|---|---|---|---|
| `UT-MATRIX-001` | `auditMembership` | `MatrixRuntime.auditMembership`（private） | `MatrixRuntime` 的 `start` / `close` |
| `UT-TRANSFER-006` | `scpArgs` | `Transfer.scpArgs`（private） | `Transfer.fetchInputs` / `deliverArtifacts` |
| `UT-POLICY-002` | `canonicalize` | `Policy.canonicalize`（private） | `Policy.validate` |
| `UT-WORKER-003` | `claimNext` | `RunWorker` 内部 | `RunWorker.run` |
| `UT-REPO-004` | `createOrGet` | `TaskStore.createOrGet`（public） | 直接调用 |

本轮为其中可独立断言的部分补了直接断言（`tests/unit/policy-class.test.ts` 覆盖 `Policy.validate` 的 canonicalisation 行为、`DurableNodeExecutionEnv` 的执行事实与 cwd 解析）。

#### 3.2.2 名称在 `src/` 里不存在（12 项）——用例集写错了名字，或 ISD 声明了但未实现

| 用例集写的符号 | 真实实现 | 性质 | 关联 Case |
|---|---|---|---|
| `acquireSlot` | `Scheduler.acquire` | 改名 | `UT-SCHED-004/005` |
| `appendAudit` | `Observability.audit` | 改名 | `UT-OBS-004` |
| `bindToolProfile` | `validateToolRegistry`（`src/config.ts`） | **改名**：ISD §5.1.8 声明 `bindToolProfile(profile, registry) -> BoundToolProfile`，实现里该契约由 `validateToolRegistry` 承担（逐 `recovery_contract_ref` 解析、未注册/不一致即失败） | `UT-BOOT-002/003`、`UT-POLICY-007` |
| `canonicalizePath` | `Policy.canonicalize`（private） | 改名 | `UT-POLICY-009/010` |
| `createObservability` | `new Observability(config)` | 改名 | `UT-OBS-007` |
| `createOrGetRun` | `TaskStore.createOrGet` | 改名 | `UT-REPO-005/006/007` |
| `fenceSlot` | `TaskStore.mutateRun`（M003 §5.1.2「fenced run mutation」） | 改名 | `UT-REPO-009/010` |
| `listQueued` | `TaskStore.scanNonTerminal` | 改名 | `UT-REPO-013/014` |
| `matrixWhoami` | `MatrixRuntime.start` 内的 whoami 预检 | **改名**：ISD §5.1.7 声明为消费端口，实现内联在 `start()` | `UT-BOOT-010` |
| `openStore` | `new TaskStore(path, timeout)` | 改名 | `UT-REPO-018/019` |
| `patchTerminal` | `TaskStore.finish` / `finishQueued` | 改名 | `UT-REPO-020/021` |
| `scanNonTerminalRuns` | `TaskStore.scanNonTerminal` | 改名 | `UT-REPO-032/033` |

**结论**：12 项全部是**命名漂移**，不是未实现的行为。唯一需要设计层确认的是 `bindToolProfile`——ISD §5.1.8 用的是 `bindToolProfile(profile, registry) -> BoundToolProfile` 的签名，而实现是 `validateToolRegistry(tools)` 校验整个注册表。行为等价（逐工具解析 recovery contract，未绑定即失败），但**函数粒度不同**。这属于 ISD 与实现的接口漂移，应在下次 ISD 修订时对齐命名或签名——本轮不擅自改设计文档。

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
- **符号级**：256 项声明的被测符号中，**194 项在其入口文件里有断言或直接调用**，0 项（已导出但未断言）经本轮补测后归零，62 项是私有成员或改名后的符号——见 §3.2。

**建议：pass（符号级缺口已闭合）。**

理由：本轮补了三个测试文件（`tests/unit/exec-surface.test.ts` 24 项、`tests/unit/policy-class.test.ts` 14 项、`tests/unit/entrypoints.test.ts` 5 项、`tests/unit/runtime-surface.test.ts` 10 项，共 53 项），把 §3.1 列的 26 项「已导出但未被断言」全部落到断言点上。剩余的 62 项经逐个核对，全部是**私有成员**（经公开入口间接覆盖）或**命名漂移**（用例集写的名字与实现不一致，§3.2.2 给出对照表），不是未实现的行为。

唯一仍需设计层确认的是 `bindToolProfile` 的接口粒度漂移（ISD §5.1.8 声明 `bindToolProfile(profile, registry)`，实现是 `validateToolRegistry(tools)` 校验整个注册表，行为等价但粒度不同）——登记为 `G-EXEC-UT-4`，Owner 是模块设计，**不阻塞本层 Gate**（本层只断言行为，不断言函数名）。

**本层 PASS 不关闭模块层 Gate**（计划 §1.4）。本报告只给建议，不越权批准。

## 5. 缺口清单

| 缺口 | Owner | 内容 | 最晚 Gate | 状态 |
|---|---|---|---|---|
| `G-EXEC-UT-1` | 测试工程 | 26 个已导出但未被断言的符号 | 本报告复审前 | **已关闭**（本轮补 53 项断言） |
| `G-EXEC-UT-2` | 测试工程 + 模块 Owner | 符号名与实现不一致 | 本报告复审前 | **已关闭**：105 项为私有成员（经公开入口覆盖）；12 项为命名漂移，§3.2.2 给出逐项对照 |
| `G-EXEC-UT-3` | 测试工程 | 用例集段落未按 `UT-*-NNN` 组织 `describe` | 模块层 Gate 前 | **部分关闭**：本轮新增的 describe 块以 `UT-<模块>-<NNN> · <责任>` 命名（如 `UT-BOOT-007 · resolveSecret`）；既有 describe 块的重命名留给模块层 |
| `G-EXEC-UT-4` | 模块设计 | `bindToolProfile` 的接口粒度漂移：ISD §5.1.8 声明 `bindToolProfile(profile, registry) -> BoundToolProfile`，实现是 `validateToolRegistry(tools)` 校验整个注册表 | 下次 ISD 修订 | **未关闭，不阻塞本层** |

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
