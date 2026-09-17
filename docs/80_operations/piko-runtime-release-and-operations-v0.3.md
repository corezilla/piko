<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Runtime v0.3 发布与运维设计

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-runtime-release-and-operations-v0.3` |
| Document Version | `0.1.0-draft.3` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Operator |
| Authors | corezilla |
| Created Date | `2026-09-17` |
| Last Modified Date | `2026-09-17` |
| Template ID | `operations.release` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/80_operations/piko-runtime-release-and-operations-v0.3.md` |
| Supersedes | none |

> 本文是下游实现的运维设计，不是已发布版本、部署说明或 runtime activation 授权。
<!-- STD_DOCUMENT_COVER_END -->

## 1. Release scope、版本与兼容性

目标 release 只实现 `0.3.0-simplified.5` 四项任务面、固定 Pi 版本、标准 Matrix 与标准 LLMTier Responses SSE 消费。旧 capacity/claim、产品消息、内容服务和模型 Invocation 协议不是兼容面，也不建立 fallback。

## 2. 构建、制品、SBOM/BOM 与来源证明

构建必须锁定 Piko commit、Pi commit、依赖 lockfile、Schema/OpenAPI hash 与构建器版本；输出 SBOM 和签名制品。当前阶段这些制品均 `NOT_BUILT`。

## 3. 部署/安装/烧录/装配步骤

部署由既有 supervisor 管理一个逻辑 Piko/Agent 实例及一个 execution slot。数据库迁移必须在 worker 启动前完成；API、scheduler、worker 不得指向不同 schema generation。真实安装命令在实现完成后补入 release artifact，不在设计阶段虚构。

## 4. 配置、Secret、校准数据与环境

实例配置包含内部 model/profile、workspace roots、tool profiles、Task Store、Matrix homeserver/identity 和 LLMTier base URL。外部任务不得覆盖 model。credential 只从部署 Secret provider 注入，禁止出现在 API、Result、日志、Matrix 消息或诊断导出。

## 5. Preflight、Bring-up 与健康检查

只读 preflight 依次检查：配置/schema版本、Task Store可读写、scheduler lease、Pi session store、sandbox/workspace、Matrix SDK身份与sync，以及 LLMTier 网络/TLS/auth 与 `GET /v1/models`。它不得调用 `POST /v1/responses`。真实 Responses 探针是单独的 operator-authorized、计预算、可产生 token/费用且有审计记录的状态改变操作；不得自动运行，也不作为任务成功证据。检查失败不得接收新Run；它不证明旧Run已停止，也不自动触发重启。

## 6. 升级、迁移、回滚和恢复

升级前停止新受理并等待或明确fence当前worker；保存RunSessionRecord/Result generation边界，再迁移schema。回滚只允许到能读取现有记录的版本。重启恢复按Result→Run→lease→session/checkpoint顺序对账；unknown side effect不重放。任何状态改变、credential修改、强制lease回收或数据修复需operator授权。

## 7. 操作、监控、告警与 SLO

监控队列长度、单execution slot状态、lease epoch、Run状态时长、checkpoint/result generation、模型/工具attempt、usage质量、Matrix sync lag与dependency errors。当前无已批准SLO，不宣称可用性数字。

## 8. 故障诊断、维护与更换

诊断先固定build/config/schema/时钟及run_id，再查Task Store提交点、lease、session/checkpoint、工具intent/result、Responses stream边界、Matrix cursor/txn和Result generation。只读证据不足为Unknown；不得用换key、手工改ledger或盲目重放绕过。

## 9. 数据保留、备份、审计与安全

Run、任务去重与Result至少保存到`max(deadline_at,accepted_at)+7d`，活动或unknown事实继续保留。Pi session、Matrix token与Secret不进入普通诊断包。备份恢复不得复活旧lease、取消意图或已撤销权限。

## 10. Acceptance、交接与退役

激活前需要机器契约、crash/retry/权限/Matrix/usage联调、安全与恢复证据，以及独立runtime授权。退役先禁止新Run、收口或隔离现有Run、保留可查询结果，再撤销credential；进程退出本身不是业务停止证据。
