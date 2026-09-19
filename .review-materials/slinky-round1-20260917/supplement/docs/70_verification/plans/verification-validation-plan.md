<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 Verification and Validation Plan

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-verification-validation-plan` |
| Document Version | `0.3.0-draft.2` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `原方案作者（原始 attribution 见固定来源 commit）, Codex（主干设计归并）` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-14` |
| Template ID | `assurance.vv-plan` |
| Template Version | `0.1.0` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | `none` |
| Migration Map Reference | `docs/98_migration/v03-mainline-rollin/migration-map.md` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/70_verification/plans/verification-validation-plan.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

> 2026-09-09 主干归并：本文件是 V0.3 活跃设计候选。正式启动设计开发不等于文档 Approved 或 Runtime Activation。最新范围与外部接口修订统一见 [启动基线](../../00_management/version-development-plan.md)；原文中的旧测试隔离、STD 未锁定或 ExternalLink-only 描述不得作为新的实现指令。

## 1. 目标、范围与 V&V authority

目标是证明 V0.3 的固定 Stage、Plan、IR、PR、Knowledge、Research、多语言、Testing、Piko/LLMTier 和 View 在真实边界下工作，并阻止 V0.2 中“低层测试通过但 System Test 仍大量失败”的 escape。

Testing Core 拥有 Test Case lifecycle、Execution outcome、Evidence 和 Acceptance evaluation；Artifact/Requirement/Design/Contract owner 分别拥有被验证基线。Report 不重算 truth。

Piko/LLMTier 是独立外部软件系统。Slinky 验证自己的 adapter、消费契约、超时/恢复/隔离和系统集成，不将其内部单元测试列为 Slinky 所属模块测试，也不能用对方自报通过代替消费者验收。外部内部缺陷交 owner 修复后重新固定版本复验；本轮 STD 结构检查不提升任何运行证据等级。

## 2. 被验证基线与环境

每个 execution 必须固定：

- requirement/design/interface/contract exact version 与 project commit；
- implementation commit、configuration/schema/migration version；
- Piko/LLMTier compatibility manifest、OpenAPI/Schema/error catalog hash；
- Tool/Adapter version、Contract Test record；
- IR backing、PR lease、environment fingerprint、source/data/fixture/oracle version；
- runner/OS/container/browser/dependency/clock policy。

当前候选基线是 V0.3 design source commit `c5ee1aee0f06a3ab6e7c43b7ec6dc14d0b7dd480`；它不是 implementation baseline。

环境验证按 [系统设计 §13.4–13.5](../../20_system_design/system-design.md#134-并发测试与环境隔离) 和 [测试生命周期 §11](../specifications/test-lifecycle-specification.md#11-v02-环境问题回归矩阵) 执行 V03-ENV-001–014。先验证环境闭包、launcher 与租约契约，再在实际 target 执行准入、单 lane、双 lane 和六环境容量/隔离/恢复测试。六个环境不意味着六个任务同时准入；实际并发受全部资源约束。

T5 在固定软硬件和外部服务基线下冻结容量、p95/p99、排队及冷启动/停止/清理预算，保存采样与阈值依据。阈值未冻结、环境未准入或真实故障恢复证据缺失时，相应 gate 保持 Blocked；不能以静态 Schema、mock 或旧版本 PASS 替代。每次验证同时提交功能结果、进程退出、环境清理及完整 Attempt 选择证据；失败归属和重测范围按 §11 的 Case/Owner/Oracle 追踪。

## 3. Verification 方法

| Requirement | Analysis | Inspection | Demonstration | Test | Owner | Evidence |
|---|---:|---:|---:|---:|---|---|
| fixed Stage DAG / authority | 是 | 是 | 是 | 是 | Runtime owner | transition/negative records |
| Plan correctness/capacity | 是 | 是 | 是 | 是 | Plan owner | graph/resource fixtures |
| IR/PR atomic allocation | 是 | 是 | 是 | 是 | IR/PR owner | fault/recovery evidence |
| external Contract | 否 | 是 | 是 | 是 | Integration owner | provider/consumer capture |
| Knowledge selection/RAG | 是 | 是 | 是 | 是 | Knowledge owner | profile/context/retrieval records |
| Web multi-component | 否 | 是 | 是 | 是 | Component owners | frontend/backend E2E |
| Testing truth/promotion | 是 | 是 | 是 | 是 | Test owner | lifecycle/mutation evidence |
| View no masking | 否 | 是 | 是 | 是 | WebUI owner | browser/fast-path tests |

## 4. Validation 场景与用户目标

1. 用户只给一句 Goal，系统能透明形成 Research、Requirement、计划和明确 Assumption。
2. 用户提供草案/约束时，系统遵守约束，冲突时请求决定而非静默覆盖。
3. Web frontend + Python backend 在同一固定 Stage DAG 下并行开发并经 Contract/Browser/E2E 验证。
4. 多个 Agent Team/room 并行；无法共识时保留分歧，Project Manager/专家处理，必要时用户看到 Dossier 和 exact Element discussion。
5. 六套测试环境并行时不冲突；Tier capacity pressure 可提前反映到 Plan。
6. crash/lost response/restart 后不重复外部 side effect，且能回归主路径。

## 5. 测试层级和责任边界

| 层级 | 目标 | Promotion Gate |
|---|---|---|
| Unit | pure logic/schema/state transition | all mandatory cases PASS |
| Contract | Port/Adapter/API/provider-consumer semantics | positive/negative/recovery PASS |
| Module | owner module lifecycle and persistence | no unresolved module blocker |
| Subsystem | cross-module flow, real store/adapter | qualified environment/evidence |
| System | fixed DAG/project lifecycle | lower promotion records valid |
| E2E | user Goal to accepted Artifact/project outcome | acceptance chain complete |
| Recovery/Security | abnormal path, isolation, Secret | no unsafe fallback/leak |
| Performance/Capacity | concurrency, queue, forecast | SLO and uncertainty explicit |
| Acceptance | independent evidence adjudication | policy-valid PASS only |

## 6. 环境、fixture、oracle 与数据治理

- T3 构建 Case/data/fixture/oracle/runner/evidence package；T4 必须通过 controlled invalid input 证明资产能拒绝错误。
- T5 通过 PR Reservation/Lease、readiness、fingerprint、equivalence 和 cleanup admission 环境。
- Provider schema 以真实脱敏 response fixture 为 Evidence；缺失字段保持 absent/null，不合成。
- Intentionally invalid/raw/binary/byte-sensitive data 使用 Artifact-specific Contract，不能交给通用完整文件重写。
- 每个 Case 明确 canonical input、mutation input、expected outcome、oracle source 和 cleanup。

## 7. 覆盖、采样、统计和判定规则

- Traceability：Requirement→Design/Contract→Suite→Scenario→Family→Case→Execution→Evidence。
- `failed/not_pass/blocked/invalid/stale` 不计 Acceptance Coverage；只有当前基线、当前环境且 policy-valid 的 PASS execution 可计入。
- Coverage report 必须区分 planned/executed/pass/failed/blocked/invalid/stale/waived。
- 大 batch 先 pilot，再按 circuit-breaker threshold 扩展；不得用总体数量掩盖同类系统性失败。
- Mutation 分 code、spec/contract、test/evidence/oracle；三者不能互相替代。

## 8. 故障注入、恢复和非正常路径

- process kill before/after intent commit、lost HTTP response、duplicate request、stale cursor/snapshot、lease expiry/fencing failover。
- Piko Run/Session/Matrix transaction restart；LLMTier UnknownOutcome/idempotency retention；PR partial provision/cleanup。
- malformed Result、provider schema drift、quota unknown、service alias/fallback、unauthorized room participant、secret descriptor。
- View mandatory source missing/duplicate/malformed；automatic refresh attempted rerender。
- Artifact successor/invalidation、Plan revalidation、user delayed decision 和 return-to-main-path。

## 9. 偏差、waiver、问题与重测

任何偏差记录 owner、scope、reason、risk、expiry、approver、affected requirements/cases 和 required retest。修复后按 impact graph 选择 affected rerun；不得覆盖失败 attempt。Flaky 只描述重复性，不自动转 PASS。Blocker 未关闭不得用 waiver 伪装 coverage。

## 10. Evidence package、traceability 与签署

Evidence package 至少包含：baseline manifest、environment/IR/PR/Tool identities、Case definition、input/mutation、raw/sanitized logs、oracle result、execution lifecycle、defect/recovery、coverage/mutation report、review/acceptance decision 和 hashes。

签署顺序：Test owner 完整性检查→independent Reviewer→Requirement/Design owner 对基线确认→Release/User authority 决定。详细生命周期见 [Test Lifecycle Specification](../specifications/test-lifecycle-specification.md)。

迁移来源：`docs/70_verification/plans/v0.3/v0_3_test_design_draft_20260806.md`、`v0_3_test_method_catalog_draft_20260806.md`、`v0_3_testing_subsystem_upgrade_draft_20260801.md`。
