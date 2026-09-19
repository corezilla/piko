<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 Component 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-multilanguage-web-support` |
| Document Version | `0.3.0-draft.2` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-13` |
| Template ID | `design.definition` |
| Template Version | `1.3.0` |
<!-- STD_DOCUMENT_COVER_END -->

对象 ID：`M007`；模块名：`Component`；直属父对象：`Slinky`；目标 code_directory：`src/component/`。当前实现位置及迁移边界见本文基线章节；编号与目录以系统对象登记表为准。

## 1. 单元摘要：为什么存在

最低目标是在同一固定 Stage DAG 内支持 Web frontend + Python backend + interface contract + integrated testing，而不是一次支持所有语言。

### 当前实现与本版增量

- Current Baseline：v0.2 以 Python 项目为主要实现/测试假设。
- Approved Delta：支持 `web_frontend` 和 `python_backend` 两种 Component；显式 interface/data/event/security contract；按 Component 排 Plan/IR/PR/Tool/Test。
- Future Input：动态 fan-out/instance_key Process Definition 属于 v0.4。

## 2. 需求、功能与验收条件

承接系统设计与 SRS 中原有 Requirement ID；第 14 章保留逐项验收映射。未知接口或阈值属于设计缺口，不是已实现但未运行。

## 3. UI、CLI 或设备操作面

组件及接口状态由 Stage Process 和 Project Plan 的现有组件维度展示；环境兼容信息由 Resources 提供。本模块不另建前端/后端两套导航或 Runtime。

## 4. 外部边界与依赖

- 负责：Component classification、Project Engineering Graph、cross-component Artifact/Contract/resource references、toolchain capability mapping。
- 不负责：按语言创建第二 Stage Process、把 Contract/Environment 伪装成 Component、在 Runtime 写 language-specific route。
- authority：Artifact Governance 持有 effective ProjectEngineeringGraph；各 Component/Contract/Resource owner 仍独立。
- 上级设计与需求：Research/Requirement/System Design、source profile、tool/environment capability。

## 5. 内部结构与实现位置

```text
ProjectEngineeringGraph
|- Component Graph: web_frontend, python_backend
|- Contract Artifact Graph: API, data/schema, event, security/privacy
`- Resource Topology: build/deploy/test/browser/service resources
```

Contract 是 Artifact，Environment 是 PR reference；只有具备 source ownership、build/runtime boundary 和 Team responsibility 的工程单元才是 Component。

具体文件变更仍以第 13 章和逐文件 ISD 为准；不得按概念框图虚构已存在源码。

## 6. 数据模型、状态与 ownership

ProjectEngineeringGraph 版本变更表达 `Added/Removed/Changed/Renamed/Split/Merged/Unchanged`。Rename 不改变 stable ID；Split/Merge 必须给出 ownership/contract equivalence mapping。受影响 Artifact/PlannedWork 走统一 invalidation/revalidation。

## 7. 主流程与数据流

```text
Research classifies project
-> System Design activates ProjectEngineeringGraph
-> Component and Interface Design
-> frontend/backend PlannedWork in parallel after Contract Gate
-> build/lint/type/contract validation
-> component tests + integration/browser/E2E/system tests
```

## 8. 关键算法与业务规则

- frontend/backend provisional design 可并行，但不能把推断接口当 canonical Contract。
- Contract Gate 后 Coding 可并行；Integration 等待相关 Component Artifact 和 environment ready。
- 同一 Stage 内按 stable Component identity 创建 Task/WorkExecution，仍共享一套 Stage authority。
- Toolchain 差异通过 profile/Skill/Adapter/PR 表达，不在 Stage 内硬编码语言分支。

## 9. 接口与机器契约

Component Profile 至少含 stable ID/type、language/framework、source roots、build/test tool contract、runtime profile、resource demand、code intelligence scope、contract refs、dependencies、owner、risk/NFR。

Frontend/Backend interface 必须是 canonical Contract Artifact，包含 API/schema/auth/error/version，不得只存在于代码或聊天。

## 10. 并发、失败与恢复

分类 source gap、unsupported language/tool、contract mismatch、build failure、browser incompatibility、integration failure、environment mismatch。记录 Component/Contract version、Tool/Environment fingerprint、affected graph scope 和 rerun evidence。

## 11. 安全、权限与可观测性

跨 Component auth/data/privacy boundary 写入 Contract；frontend secret 不进入 client bundle；backend/service credential 留在 runtime secret boundary；测试环境数据和 browser session 隔离。

## 12. 容量、性能与运行限制

最低环境矩阵需覆盖 frontend build/runtime、Python backend、API/service dependency、supported browser 和 integrated environment。矩阵必须按风险裁剪并记录，不可默认为单浏览器/单平台等价。

## 13. 实现步骤与文件清单

扩展 Artifact taxonomy、ProjectEngineeringGraph、Plan component dimension、Tool/Code Intelligence Adapter 与 Testing profiles。不得创建 frontend/backend 两套 Runtime 或平行 RAG。

## 14. 测试与验收

| Requirement | Design element | Verification method | Evidence | Status |
|---|---|---|---|---|
| V03-ML-001 | frontend + Python backend | E2E | build/run/integrated result | Planned |
| V03-ML-002 | canonical interface Contract | Contract test | positive/negative fixtures | Planned |
| V03-ML-003 | graph change impact | mutation test | affected scope only | Planned |
| V03-ML-004 | toolchain adapter | backend contract test | no language hardcode branch | Planned |
| V03-ML-005 | browser/environment matrix | qualification | fingerprinted evidence | Planned |

## 15. 风险、未决问题与引用

- [ ] Component/Profile/Graph Schema。
- [ ] frontend framework/browser minimum matrix。
- [ ] Python/backend build/test Contract。
- [ ] integration and security acceptance criteria。
- Gate：Interface Contract、Component ownership、toolchain 与 environment 未冻结时不得宣称多语言支持 Verified。

迁移来源：`docs/20_system_design/v0.3/v0_3_multilanguage_multicomponent_support_draft_20260801.md`。

### 文档控制字段

<!-- STD_DOCUMENT_CONTROL_BEGIN -->
| 字段 | 值 |
|---|---|
| Authority | `slinky` |
| Authors | `原方案作者（原始 attribution 见固定来源 commit）, Codex（主干设计归并）` |
| Created Date | `2026-09-07` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | `none` |
| Migration Map Reference | `docs/98_migration/std-software-upgrade/migration-map.md` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/40_module_design/component/design.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_CONTROL_END -->
