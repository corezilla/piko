<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko v0.3 单元测试计划

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-unit-test-plan-v0.3` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-21` |
| Last Modified Date | `2026-09-21` |
| Template ID | `assurance.test-plan` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/plans/piko-unit-test-plan-v0.3.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与测试层级

- **层级**：unit（含契约级静态/语义检查的单元化执行）。
- **目标**：验证 Piko 自有逻辑在不依赖真实 Matrix、LLMTier 或 oMLX 的情况下可重复执行。
- **手段**：Vitest、内存 SQLite、临时目录、假 Matrix client/fetch、假 Pi runtime。
- **不证明**：真实进程崩溃、模型协议兼容、外部服务联调——由集成/故障注入/验收测试承担（见 `piko-agent-runtime-vv-plan-v0.3`）。

## 2. 被测基线、排除项与依赖

| 项 | 值 |
|---|---|
| 被测 | Piko v0.3（`0.3.0-simplified.6`）自有逻辑（store/worker/matrix/tool-recovery/config/usage） |
| 运行时 | Node ≥22.19；Vitest；Node 内置 SQLite（`:memory:`） |
| 排除 | 真实 Matrix homeserver、真实 oMLX/LLMTier、操作系统级 SIGKILL/fsync |
| 依赖 | 无外部网络；不依赖本机已有数据库；不读取本机密钥 |

## 3. Test Strategy 与 Coverage Model

- 以**组件 × 失败模式**为覆盖模型，而非样例数量：Auth/API、Matrix intake/membership/media、Worker usage/failure/deadline/cancellation/error-mapping、Discussion writer 顺序与收尾、Tool policy/recovery/ledger、Usage validator/persistence、Config 注册与部署边界。
- 纯函数与 Store 语义优先；异常与竞态次之；Matrix 用假 client/fetch；HTTP 负例用随机 loopback 端口。
- 完成标准：§4 全部用例自动化并通过；`npm run check`（TypeScript + Vitest + 机器契约）通过；测试不访问公网、不依赖既有数据库、不留临时文件；发现的实现缺陷先修复再保留回归用例。

## 4. Test Item、Feature 与 Requirement Matrix

| ID | 组件 | 验证目标 | 主要断言 |
|---|---|---|---|
| UT-HTTP-01 | Auth/API | 缺失、格式错误及错误 bearer | 401；保留/生成 request ID；不访问 Store |
| UT-HTTP-02 | API Schema | 非法 JSON、未知字段和外部 model selector | 400 `InvalidRequest` |
| UT-HTTP-03 | API identity | 重复任务、冲突定义及不可用 Result | 原 Run；409 `TaskConflict`；409 `RunNotTerminal` |
| UT-HTTP-04 | API admission | 队列满与依赖异常 | 429/503 且返回 `retry-after` |
| UT-MX-01 | Matrix intake | 房间路由、自身 echo、event dedup、cursor 原子提交 | 只为 Open 且同 room 的 Run 插入一次 turn；cursor 最后提交 |
| UT-MX-02 | Matrix membership | sync 前成员资格撤销 | batch 失败且 cursor 不推进 |
| UT-MX-03 | Matrix media | URL、声明大小、MIME ACL | 非法输入 fail closed，且不写 staging |
| UT-MX-04 | Matrix media | 响应 MIME/实际大小不符 | 下载失败且不发布附件路径 |
| UT-MX-05 | Matrix media | 合法附件与文件名净化 | 字节一致、路径位于 run staging、文件名无越界片段 |
| UT-WRK-01 | Usage aggregate | 无 usage attempt 与逐字段缺失 | Unknown/Partial 语义及 null 字段正确 |
| UT-WRK-02 | Failure result | 异常前已有输出 | Failed、partial=true、输出 hash/size 保留 |
| UT-WRK-03 | Deadline | 执行开始前 deadline 已过 | Failed/DeadlineExceeded，Pi 不被调用 |
| UT-WRK-04 | Cancellation | cancel 与执行失败竞态 | CancelledByRequest 优先，终态只有一个 Result |
| UT-WRK-05 | Error mapping | 非字符串 `Error.cause` | 合法 `Internal` cause_class，不泄露对象 |
| UT-DISC-01 | Discussion | turn 插入与 Open→Closing 两种 writer 顺序 | turn-before-close 被消费；close-before-turn 被拒绝 |
| UT-DISC-02 | Discussion | Closing 重启恢复 | 同 lease 重试幂等成功，不重开 intake |
| UT-DISC-03 | Discussion | Failed/Cancelled 收尾 | Pending/QueuedInPi 全部变为 Abandoned |
| UT-DISC-04 | Discussion | Completed 守卫 | 非 Closing 或仍有 pending 时拒绝完成 |
| UT-TOOL-01 | Tool policy | read-only safe 与 registry binding | 只接受已注册、适用的实现 |
| UT-TOOL-02 | Tool recovery | write/edit 未执行、已执行及漂移 | 分别重放、确认、不确定失败 |
| UT-TOOL-03 | Tool ledger | logical call 重入与 never replay | 预算只计一次；never 重入 UnsafeRetryBlocked |
| UT-TOOL-04 | Tool recovery | 损坏或不匹配 memo | fail closed，不执行副作用 |
| UT-USG-01 | Usage validator | attempt、总量、cache、reasoning 算术反例 | 各反例均拒绝 |
| UT-USG-02 | Usage validator | Complete/Partial/Unknown 与 missing_fields | quality、null 和 missing 集合严格一致 |
| UT-USG-03 | Usage persistence | 同 attempt 覆盖及迟到 usage | 不相加；已发布 Result 字节不变 |
| UT-CFG-01 | Config | tool/recovery 注册与适用性 | 缺失、未知或不适用 binding 启动失败 |
| UT-CFG-02 | Config | SecretRef、Matrix 必填项、loopback HTTP 限制 | Schema 正负例符合部署边界 |

## 5. 环境、设备、拓扑、数据和工具

- 单进程内存环境：`TaskStore(":memory:")`、`mkdtemp` 临时工作区（用后删除）、随机 loopback 端口。
- 假件：假 Matrix client / `fetch`、假 Pi runtime、契约 fixture。
- 工具：Vitest、`tsc --noEmit`、`tests/contract/validate_v03_contract.py`。
- 无网络、无本机密钥、无持久数据库依赖。

## 6. Test Types 与 Case Families

- **normal**：路由、去重、聚合、持久化正常路径。
- **boundary/negative**：非法 JSON/未知字段、非法媒体、算术反例、配置缺失。
- **concurrency/recovery**：cancel 与失败竞态、writer 顺序、Closing 恢复、never-replay 重入。
- 执行顺序：① 纯函数与 Store 语义（Usage/Discussion/Tool/Config）→ ② Worker 异常与竞态 → ③ 假 client/fetch 的 Matrix intake/media → ④ 随机 loopback 的 HTTP 负例 → ⑤ 定向测试 + 全量 `npm run check` 并回填执行结果。

## 7. Entry、Exit、Pass、Fail、Blocked 和 Invalid Criteria

- **Entry**：依赖安装完成；`tsc` 可编译。
- **Pass**：§4 全部用例通过且 `npm run check` 通过。
- **Fail**：任一用例失败（先修实现缺陷，再保留回归用例）。
- **Blocked**：环境缺失（如依赖无法安装）。
- **Invalid**：夹具/断言构造错误导致的失败——修正夹具后重跑，不计为产品缺陷（本轮出现过两例，见 §9）。

## 8. 组织、职责、排期和资源

执行：opencode（Vitest 驱动）；Owner/Approver：Piko Verification Owner / Piko Project Owner。单机单轮。

## 9. Defect、Deviation、Rerun 与 Regression

- 本轮定向执行首次出现**两项测试夹具错误**：① 重复提交夹具每次生成不同 deadline；② Matrix intake 断言未排除初始 trigger turn。均为测试构造问题，修正后定向测试 41/41、全量 59/59 通过。
- **未发现新的运行时代码缺陷**。
- 后续发现的实现缺陷按"先修 + 保留回归用例"处理。

## 10. Evidence、Traceability、Reporting 与 Gate

- 执行记录（`Complete`，2026-09-18）：计划用例 27 / 已自动化 27 / 通过 27 / 失败 0；全量 16 个测试文件、59 项测试全部通过；`npm run check` 通过（TypeScript、Vitest、`simplified.6` 机器契约）。
- 新增测试文件：`tests/unit/server.test.ts`、`tests/unit/config-schema.test.ts`、`tests/unit/worker-runtime.test.ts`；扩展：`tests/unit/matrix.test.ts`、`core.test.ts`、`store.test.ts`、`tool-recovery.test.ts`。
- 用例与 `PK-T*` oracle 的对应关系见 `piko-agent-runtime-test-specification-v0.3`；本计划不维护重复运行状态。

## 11. 风险、安全与清理恢复

- 未覆盖边界：真实 Matrix homeserver 连接、membership 传播、媒体下载、进程崩溃恢复；真实 oMLX/LLMTier 协议与故障行为；操作系统级 SIGKILL/fsync——由集成、故障注入与验收测试承担，不计入本单元测试计划完成度。
- 清理：临时目录用后删除；无持久状态；不触碰本机密钥与数据库。
