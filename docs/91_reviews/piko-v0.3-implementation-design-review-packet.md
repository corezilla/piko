<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko V0.3 实现级设计 Review Packet

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-v0.3-implementation-design-review-packet` |
| Document Version | `0.1.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Created Date | `2026-09-17` |
| Last Modified Date | `2026-09-25` |
| Template ID | `review.packet` |
| Template Version | `0.2.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-v0.3-implementation-design-review-packet.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. Review 目标

确认首个 Piko 实现已经具备单一路径、可编码的内部设计，同时严格保持
`0.3.0-simplified.5` 的系统和机器契约。请求决定：`ACCEPTED`、`AMENDMENT` 或 `REJECTED`。

## 2. 固定输入

| 项目 | 值 |
|---|---|
| parent approved commit | `d40c98b56bb04a976da2ec9e0307e0f57fdd1fc6` |
| parent contract | `0.3.0-simplified.5` |
| implementation package | `0.1.0-draft.1` |
| manifest | `docs/91_reviews/piko-v0.3-implementation-design-manifest.json`；候选 SHA-256 `81dea06382b2f030d69e298a91dc297da25018e4d646bd0a4ce082758e170ee7` |
| runtime activation | `false` |

Manifest 固定三项输入：实现级设计 Markdown、metadata sidecar、运行配置 JSON Schema。

## 3. 关键决定

- 与 Pi 相同技术栈的 TypeScript/Node 单进程、单 execution slot；
- 本地 SQLite WAL 是唯一 Task Store，不预留共享/远程第二 backend；
- Pi session store 与 Task Store 通过确定性 identity、generation 和 recovery probe 协调；
- Result 使用“先 immutable Result、后 Run terminal”的两提交恢复协议；
- `matrix-js-sdk` Client-Server 和 Pi Responses SSE 分别是唯一 Matrix/模型路径；
- config 只含 Secret reference，不含 credential 明文或外部 model selector；
- 实现发现契约不可行时先改设计，不建立隐藏 fallback。

## 4. 必查不变量

1. 四项外部 operation 与现有 Schema/error mapping 不变。
2. 一个实例一个 Agent、一个 execution slot、每 Run 独立 Pi session。
3. Queue、lease、checkpoint、Result、Usage、DiscussionTurn 的写入顺序能在崩溃后确定恢复。
4. 首 SSE event 后不透明重放，未知工具副作用不盲重试。
5. idle Matrix 消息不创建或重开 Run；cursor、event、turn 和 txn 可去重。
6. path/symlink/media/Secret/tool permission 均 fail closed。
7. runtime activation 保持 false，NOT_RUN 不得写成 PASS。

## 5. Review 边界

本包不改变 Slinky 或 LLMTier consumption contract，因此默认不要求跨项目重新评审。若审查修改导致
API、状态机、Matrix message boundary、LLMTier Responses surface、Usage 或 Memory authority 变化，必须停止
本包的内部批准，并重新发起相关跨项目评审。

具体 Node/driver package patch version由实现 lockfile固定；构建制品、安装命令、SLO、性能、真实 crash、
Matrix 和 LLMTier 证据属于实现/发布 Gate，不是本 packet 的批准事实。

## 6. 验证要求

- JSON/metadata/schema 解析通过；
- 锁定 STD draft.21 下 document validation 无新增错误；
- 现有 `validate_v03_contract.py` 保持 PASS；
- package manifest 3/3 hash 一致；
- retired-field/path scan 无新外部机制；
- Git diff check 通过。

## 7. Requested decision

若上述边界与内部决定可接受，请由 User / Piko Project Owner 批准把实现级设计从
`0.1.0-draft.1 / In Review` 晋升为 `0.1.0 / Approved`。该决定不得同时授权 Runtime Activation。

## 8. 最终决定

User / Piko Project Owner 于 2026-09-17 对 manifest 固定的候选给出 `ACCEPTED`，批准实现级设计
晋升为 `0.1.0 / Approved`。决定只覆盖内部实现设计与配置约束，不修改 `0.3.0-simplified.5`
外部契约，不批准生产实现、发布或 Runtime Activation。机器决定记录见
`docs/91_reviews/piko-v0.3-implementation-design-review-packet.review-decision.json`。

状态晋升后的 manifest SHA-256 为 `9b5a5f5dbc213c18ee8d8c5a568f513d1a2a68194d132c7f551cb5bda9410e59`，成员校验为 3/3。
