<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 系统设计模板与轻量任务提案评审包

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-system-design-std26-review-packet` |
| Document Version | `0.1.0-draft.1` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Architecture Owner |
| Authors | corezilla |
| Created Date | `2026-09-15` |
| Last Modified Date | `2026-09-25` |
| Template ID | `review.packet` |
| Template Version | `0.2.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-system-design-std26-review-packet.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 评审范围

本次只修改 Piko 的 `docs/20_system_design/piko-agent-runtime-design-v0.3.md` 及其候选证据。
目标模板是 `design.system` 4.0.0；设计候选版本为 `0.4.0-draft.3`。用户指定的 Slinky
`slinky-piko-task-interface-proposal / 0.1.0-draft.1` 作为新需求输入：一次任务一个 Agent，
Slinky 组织团队、STD、Prompt 与接受；Piko 提供四项轻量 Run API 和可靠单任务执行。

这与 Piko 已批准的重型 AgentTaskRequest/Result、participant IR、AgentSlot、
`collaboration_contract` 原子 Session、Run state/Result version、reconcile/Event endpoint 有实质冲突。
系统设计按单一替换方向写候选，但旧 OpenAPI/Schema/error/fixture 在一次性修订获批前仍是现行
字段 authority；不保留两条运行接口。本文未修改任何机器契约，也不申请 runtime activation。
按用户最新指示，本轮不在线联系 Slinky；评审请由用户/Piko Owner 在本项目内推进。

项目正式 `docs/std.lock.json` 仍为 `0.1.0-draft.21`。本次单文档候选不是全项目 adoption；
其他 `design.system-mechanism`、`design.definition` 文档未被批量提升。正式项目锁、文档批准、
canonical/RAG publication 与生产激活是不同 Gate。

## 2. 输入与来源

| 输入 | 精确引用与状态 |
|---|---|
| Piko base | `c6c333669a6ddd8b5a48adfeb7b735841e93c4be`；本评审包与候选正文由同一 immutable review commit 固定，commit ID 由评审消息给出 |
| STD 模板 | annotated tag `std-v0.1.0-draft.26` → commit `f892b167b9fc7b8beb9dbdebb9209009d4334ce1`；`design.system` 4.0.0 |
| 模板 SHA-256 | `ec2800e2423d2dc2a480fd6544aedddef92044e449e489cada948b0c38d6c665` |
| 来源清单 | `docs/91_reviews/piko-system-design-std26-source-manifest.json`；75 artifact；不是 RAG manifest |
| Slinky 输入 | 用户指定只读文件 `/Users/ben/slinky/docs/60_interfaces/contracts/piko-task-interface-proposal.md`，Document ID `slinky-piko-task-interface-proposal`，版本 `0.1.0-draft.1`，2026-09-15；提案，不是 Piko 机器契约 |
| 旧 Piko 设计 | 同路径 `0.3.1 / In Review`，可从 base commit 审阅；旧机器契约 authority 尚未切换 |
| 候选正文 SHA-256 | `44fdeab69eb2ce03974fb9c92de9a1618fd0a6dd29bf66adf30ecffca19da2cb` |

## 3. 旧→新语义追溯

| Slinky 提案/保留约束 | 新设计位置 | 机器与测试状态 |
|---|---|---|
| 一任务一 Agent；Slinky 负责团队、IR、STD、Prompt、接受 | §1–5、§10 | 旧 AR-001..007/Result 多 participant 待一次性 disposition |
| 四项 `/runs` API，同路径替换而无 alias/fallback | §2、§4、§11 | `PIKO-LITE-B01`；新 OpenAPI/Schema/error/fixture 未写 |
| Client/key/JCS digest 与 client_task_id 双重去重、无 ID 恢复 | §4、§6、§10–12 | 新事务/crash case 待定义；旧 V03-E2E-086/087 不冒充通过 |
| workspace/tool/agent binding、真实路径权限和执行限制 | §4、§8、§11、§15 | `PIKO-LITE-B02/B03`；sandbox/limit L3 NOT_RUN |
| RunView 的 Stopping/RecoveryRequired/释放、取消同 key 原回执 | §6、§10–12 | 新状态/停止/唤醒测试待定义 |
| 不可变 AgentResult、Piko 计算文件摘要、业务接受归 Slinky | §2、§4、§10–11 | 新 Result Schema/fixture 未写 |
| 提案 7 天任务保留与 LLMTier 24h/168h 独立 | §6.3、§10、§13、§18 | `PIKO-LITE-B04`；数值待 Piko 确认 |
| 可选 agent_binding_ref 与独立 Matrix Bridge | §1、§5、§8、§11、§18 | `PIKO-LITE-B05`、`PIKO-CON-B01`；旧 V03-E2E-093..099 待重分配 |
| LLMTier exact-case、Scope B、未知不盲重派 | §1、§6、§11–14 | LT-R-001 旧 mock partial；真实依赖 NOT_RUN |

本轮 `0.4.0-draft.3` 根据内部设计评审修正四项可执行语义：§4.2/§10/§14 固定幂等 ledger
命中先于当前 admission；§4.2/§8/§10/§14 增加 OutputGeneration 写 fencing 与原子 Result 发布；
§4.2/§8/§10/§14 增加 durable CounterReservation/LogicalOperation；§6.4/§14 补齐 Run 状态转换、
到限 reason 和版本递增 oracle。它们仍是目标设计，未改旧机器契约，也不声称已有运行证据。

§7、§9、§16 只写软件产品不适用依据；不以 N/A 免除主机资源、部署、安全和故障恢复责任。
既有 `TAIL-P-001` 针对旧章节；新版裁剪需要 Piko Owner 审核，本次不自动批准。

## 4. 三层验证与限制

| 层 | 检查 | 结果与限制 |
|---|---|---|
| 来源 | 从公开 tag 的干净 detached checkout 运行 `scripts/verify-source-manifest ... --std-root <checkout>` | exit 0；75 artifacts OK |
| 候选结构 | 同 checkout 运行 `scripts/validate-design <system.md> <system.metadata.json> <packet.md> <packet.metadata.json> --json` | exit 0；2 metadata、2 Markdown，0 issue |
| 项目级结构 | 从项目正式锁定的 draft.21 checkout 运行 `scripts/validate-design --project-root /Users/ben/work/piko --require-immutable-std --json` | exit 1；16 metadata/16 Markdown/5 decision，只有本设计 sidecar 的 `template.hash`、`metadata.template-version-mismatch` 两项新错误；正式锁尚未升级，不能写作全项目通过 |
| 现行契约 | `python3 tests/contract/validate_v03_contract.py` | 旧机器契约静态检查通过；不验证轻量提案 |
| 格式 | 三份本轮 JSON `python3 -m json.tool`、`git diff --check` | exit 0；无格式错误 |
| 真实运行 | Pi、LLMTier、Workspace/Tool、可选 Matrix、DB crash/failover | `NOT_RUN` |

候选提交只证明文档快照不可变；仍须由 reviewer 检查正文与差异，不能把 commit 本身写成已验收证据。

## 5. 需由用户/Piko Owner 决定的事项

1. 是否正式采用 Slinky 的单 Agent、四 API 提案并一次性替换现有重型任务机器契约；若是，
   旧 Run/Result/Event/reconcile、AR/V03-E2E ID 的 disposition 必须成套记录。
2. `workspace_ref`、`tool_profile_ref`、`agent_binding_ref` 对现有 Piko 配置的唯一映射，以及
   无绑定任务是否完全不建立 Session。
3. 三项硬限制、停止宽限、`execution_released` 的可证明边界和任务保留 7 天建议值。
4. 已有 CollaborationBridge 是否继续作为独立服务，以及团队 Evidence/Resolution 由 Slinky
   如何承接；不能在任务请求中暗留旧 `collaboration_contract`。
5. 在上述决策和 STD pre-commit Gate 完成前，候选保持 In Review，项目锁/RAG/Runtime Activation 不变。

## 6. Piko 初步可实现性判断（设计阶段）

| 提案问题 | 判断 | 需修改或验证 |
|---|---|---|
| 一任务一 Agent、四项 API | 方向可实现；不是现行 v0.2/v0.3 机器契约 | 同路径一次性替换旧请求/结果/状态；不能并行保留重型入口 |
| workspace/tool/agent binding | 建议调整字段映射，不能直接把任意目录当现有绑定 | 现行 `ExecutionPackage` 有 `workspace_lease_ref`、`workspace_access_profile_ref`、`workspace_host_binding_ref`、allowed roots；`ToolBinding` 是能力+policy ref，须决定 `workspace_ref/tool_profile_ref` 如何解析为受控版本快照 |
| exact tier 与三类硬限制、停止宽限 | exact-case 模型方向可满足；限制执行尚未证明 | 用单 Agent budget counter 和外部 obligation 实测，不支持任何限制时拒绝受理 |
| Run 状态、不可变结果、取消、释放 | 目标语义已补齐；安全释放与稳定输出代际是独立事实 | 旧 `UnknownOutcome/TimedOut`、Result version/reconcile 与新 `RecoveryRequired/Completed` 不得混为一套 enum；状态矩阵、write fencing、停止/重启/旧唤醒仍须实现验证 |
| 原 POST 无 ID、client_task_id 去重、结果保留 | ledger 命中顺序和调用计数目标语义已补齐；7 天数值待定 | 在同一 durable ledger 增加 ClientTaskIndex、CounterReservation/LogicalOperation；验证 crash window、与 LLMTier W/M/D 的独立窗口、隐私和超期行为 |
| 持续会话/Matrix 绑定 | 不能直接声称已对齐 | `agent_binding_ref` 与现行 IRCommunicationBinding/CollaborationSession 的 exact 关联、授权、停止唤醒及 Team Evidence 去向需单一决定 |

上述“可实现”只指设计上存在单一路径，不代表当前代码或依赖已经实现/验证。
