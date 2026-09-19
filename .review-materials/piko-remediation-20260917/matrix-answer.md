覆盖原消息 ID：S-20260917-23ec27fc9e7a。

Piko 已完成第二轮三方 finding 的集中整改并形成稳定只读复审快照。结论：READY FOR CROSS-REVIEW；尚未 commit/push，runtime_activation=false。这不是生产实现或运行验收。

## 基线与快照

- Repository：`/Users/ben/work/piko`
- Branch：`docs/piko-system-design-std26`
- Base/HEAD：`4c63380f944e41d0047e9f47340689a182b62fba`
- Working tree：dirty，保留原 simplified 未提交改动；没有 reset、丢弃或覆盖用户改动
- Package：`piko-v0.3-simplification / 0.3.0-simplified.3`
- Manifest：`/Users/ben/work/piko/docs/91_reviews/piko-v0.3-finalization-manifest.json`
- Manifest SHA-256：`e7fb413365c0738c1f6b810499616fb50837134c6cdc979ab30b1c52e075c344`
- Disposition/review packet：`/Users/ben/work/piko/docs/91_reviews/piko-v0.3-finalization-review-packet.md`
- Review packet SHA-256：`1d68345363166824224500ccf08fa593dcd6faeab8829891329dd2e8fa4b0729`

## 逐项处置

1. `PK-R2-PK-01 / PK-R2-SL-06`：`AgentTaskRequest.model` 已删除。一个 endpoint 对应一个稳定 Piko/Agent 实例，model/profile 为实例内部配置，不形成 optional selector。
2. `PK-R2-PK-02 / PK-R2-SL-01 / PK-R2-LT-03`：TokenUsage 改为 `Complete|Partial|Unknown`；token 字段 nullable，新增 `model_attempts`、`usage_observed_attempts`、`missing_fields`。缺失不填零，成功业务结果不因 usage 缺失被强制失败；同 attempt 迟到事实只替换、不重复相加。
3. `PK-R2-PK-03 / PK-R2-LT-01`：明确一个逻辑实例只有一个 Agent execution slot；可排队但最多一个 Running/Cancelling。每 Run 独立 Pi session，新增内部 RunSessionRecord、lease epoch、checkpoint/result generation 与崩溃恢复顺序；历史按稳定 run_id 查询，不增加 list/session API。
4. `PK-R2-PK-04 / PK-R2-SL-05 / PK-R2-LT-05..06`：Schema 强制 Run/Result 终态组合；`GET result` 增加 500 `ResultUnavailable`；OpenAPI `x-error-codes`、catalog operation/status 和 Schema enum 可执行双向校验。删除 `retryable_by_same_run`，只保留事实型 `cause_class`。
5. `PK-R2-PK-05 / PK-R2-SL-02..03 / PK-R2-LT-02`：Matrix 只用标准 identity/membership/sync cursor/event/reply/txn/media。讨论任务可带 `discussion={room_id,trigger_event_id}`；仅在该普通 Run 活跃且权限仍有效时，后续标准事件进入同一 Pi session。idle room event 不创建 Run、模型调用、回复或业务批准；无 Topic/SID/RID/outbox/ingress 产品协议。
6. `PK-R2-SL-04 / PK-R2-LT-04`：cancel receipt 明确不是停止事实。固定 Pi provider retry 只包围建流请求；首个 SSE event 后的断流不得透明重放。未知工具副作用先查询，无法证明则发布 `UnsafeRetryBlocked/ExecutionStateUnknown` 与 known_actions。
7. `PK-R2-PK-06 / PK-R2-SL-07`：CollaborationBridge mechanism/internal 文档与 Matrix 产品 OpenAPI/Schema/fixture 已退出 current authority；tailoring、migration map、inventory 更新为标准 Matrix + runtime core 单一路径。
8. `PK-R2-PK-07 / PK-R2-LT-07..08`：validator 现覆盖负例 mutation、错误矩阵、usage 语义、固定 Pi SSE/retry 源码顺序和 retired-field scan；RelativePath 拒绝 absolute/backslash/empty/dot/dotdot，运行时仍须做 symlink realpath 边界。新增运维设计，区分只读诊断、受权状态改变与恢复确认。

## 当前文档/机器版本

- System design：`piko-agent-runtime-design-v0.3 / 0.4.0-draft.19`
- Requirements traceability：`0.4.0-draft.2`
- Runtime core internal design：`0.1.0-draft.5`
- Runtime contract：`0.4.0-draft.12`，machine `0.3.0-simplified.3`
- LLMTier consumption / field usage：`0.3.0-simplified.3`
- V&V plan / test specification：`0.4.0-draft.11 / 0.4.0-draft.14`
- Operations design：`piko-runtime-release-and-operations-v0.3 / 0.1.0-draft.1`（NOT_BUILT）
- OpenAPI SHA-256：`bd62aa6247a5c0ff1b91bcf520da08434b85ab6337ae30061a195583266a3c84`
- Schema SHA-256：`a8136da98b4ec1eb38c4b68df99d4966e1f6a8e7072aee462d2ea76acaab5d7a`
- Error catalog SHA-256：`5047a3c39fe7f5aacaa6ae80d52ea7cac8a6249cc274291782c64a55a06db22b`
- Fixture SHA-256：`0d0ffda17a4287e8c4734c34dea7a80080f7ba7a5e0fa1f7f2aac6d639eb47d3`

## 验证

- `PYTHONDONTWRITEBYTECODE=1 python3 tests/contract/validate_v03_contract.py`：PASS，输出 `PASS simplified.3: 4 operations, schema negatives, error matrix, usage semantics, Pi SSE evidence`。
- manifest 28项成员逐项 SHA-256 复算：PASS。
- JSON parse（Schema/error/fixture/全部metadata）：PASS；OpenAPI YAML由validator解析并核对全部外部Schema引用。
- 项目锁定 STD `0.1.0-draft.21` / revision `274ef0a...`：用该commit的validator，对排除非authority `.review-materials` 的项目副本执行 `--project-root --require-immutable-std`，结果 `STD validation OK: metadata=18 markdown=18 decisions=5`。未升级STD lock。
- fallback Git `diff --check`：PASS。系统 `/usr/bin/git` 仍受本机Xcode license阻断。

## 尚未完成/边界

本轮Piko设计finding没有已知未处置阻塞；仍需Slinky与LLMTier按上述普通路径和hash完成只读交叉复审。Pi/Matrix/LLMTier真实集成、crash、权限、安全、保留和性能均为后续实现/联调门禁，未宣称通过。按请求顺序，交叉复审通过后才提交、push并核对远端SHA；当前不抢先提交。
