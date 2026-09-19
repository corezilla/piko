# Memory System Subsystem Design

> 2026-09-17目标更新：当前所有权和更新流程见[Knowledge draft.4](knowledge/design.md)。Memory归Slinky；Piko以普通任务返回建议，经Slinky验收及版本检查后落库。下文Implemented仅描述旧基线，不批准Tier judge直连生成、自动promotion或第二套记忆更新路径继续作为目标。embedding仅为内部索引依赖，权限与派生索引可重建原则保留。

Version: v1.11
Last Updated: 2026-07-27 05:53:12
Status: Draft

## 1. 定位与边界

Memory System统一管理Stage Process可消费的知识与上下文。当前Implemented部分包括Artifact-aware RAG和Role Agent Memory Storage；lesson admission decision 已由 `src/role_agent/lesson/` 实现，Memory负责消费准入结果并完成project memory、role-project memory、generalized role memory的持久化、检索、promotion与conflict记录。Run Index、Graph Memory、Trust Map、Context Broker和Code Memory/GitNexus Adapter仍保持 Planned。

Memory System只索引/投影Stage Process authority和源码，不拥有Stage业务状态，不建立第二套Artifact registry/recovery。RAG active index是canonical Artifact派生数据；GitNexus index也是派生cache。

目标production package统一为`src/memory/`。当前`src/rag/`中的Implemented能力必须原子迁入并删除旧package，不保留`rag`/`memory`双import路径；Planned能力不得借目录迁移提前实现。

## 2. Persistent State

当前持久化状态是`meta/rag/rag.sqlite`、index/clear manifests、RetrievalRecord和Prompt context Artifact。这些都是由canonical Artifact和运行scope派生的Memory state，不替代Stage Process authority。v0.2 目标态下，project memory、role-project memory、generalized role memory 和 lesson candidate store 也必须满足“可追溯、可回放、可重建”的约束，不能反向覆盖源记录或跳过 admission。

## 3. Formal Module Catalog

| Module | 状态 | 当前/目标实现 | 职责 |
|---|---|---|---|
| RAG Schema/Registry | Implemented | 目标`src/memory/schema_registry/` | Contract、SQLite、records/stats |
| Index/Embedding | Implemented | 目标`src/memory/indexing/` | canonical section/vector index |
| Retrieval/Judge/Context | Implemented | 目标`src/memory/retrieval_context/` | scoped retrieval、Tier judge、Prompt context及Task接入 |
| Lifecycle/Operations | Implemented/Partial | 目标`src/memory/lifecycle_operations/` | promote/reset/maintenance；compact Partial |
| Role Agent Memory Storage | Implemented | `src/memory/role_agent_memory_storage/` | 三层MemoryEntry持久化、query、promotion、conflict |
| Lesson Admission Decision | Implemented / 外部协作 | `src/role_agent/lesson/` | lesson candidate准入与effective mode；Memory消费decision，不复制规则 |
| Run Index | Planned | no source | current position、Artifact/failure/decision timeline |
| Graph/Trust | Planned | no source | entity/edge/provenance/trust state |
| Context Broker | Planned | no source | task/scope/mode Context Brief |
| Code Memory Adapter | Planned | external GitNexus only | stable code query、freshness、normalization |

已进入 `40_module_design/memory/` 的正式 Module Design 是：Schema/Registry、Indexing、Retrieval/Context、Lifecycle/Operations 和 Role Agent Memory Storage。Lesson Admission Decision 属于现有 Role Agent Integration 实现，Memory 不为它建立第二个 Module；Run Index、Graph/Trust、Context Broker 与 Code Memory Adapter仍保持Planned。

## 4. Provided Interfaces

| Interface ID | 名称 | 类型 | 状态 | 调用方 | 入口 |
|---|---|---|---|---|---|
| `MEM-PY-001` | Index canonical Artifact | Python | Implemented | Stage Process Artifact lifecycle | `on_primary_artifact_promoted()` → `RagIndexer.index_canonical_artifact()` |
| `MEM-PY-002` | Build Retrieval Context | Python | Implemented | Stage Process Prompt/Review | `append_rag_context_to_prompt_input()`、`build_context()`、`build_review_context()` |
| `MEM-PY-003` | Clear/query RAG | Python/CLI/HTTP | Partial | Stage Process/WebUI/operator | `clear_indexed_outputs()`、Memory CLI、Dashboard rag-stats route |
| `MEM-PY-004` | Query/promote role memory | Python | Implemented | MLEXP Memory Runtime / Lesson Flow | `RoleAgentMemoryStore`、retrieval/promotion/conflict APIs |
| `MEM-PY-005` | Build Context Brief | Python/CLI | Planned | Stage Process/Agent | future Context Broker |
| `MEM-PY-006` | Stable code query | Python/Tool | Planned | Context Broker/Review/debug | future `code.*` adapter |

### MEM-PY-001：Index canonical Artifact

`promote_primary_artifact()`通过`src/utils/workspace.py::_run_primary_rag_index_hook()`调用`on_primary_artifact_promoted()`。只有status为accepted/fixed且有canonical path的Artifact进入该路径；hook构造`RagRuntimeContext`和`RagArtifactRef`，默认policy为`best_effort_indexing`，再调用`RagIndexer.index_canonical_artifact()`。返回`IndexResult`并写manifest；required policy失败才blocking。

### MEM-PY-002：Build Retrieval Context

Task接入当前由`src/rag/prompt_integration.py`构造`RagContextRequest/RetrievalContract`，目标迁入`src/memory/`后public Contract保持不变。普通Prompt调用`RagContextProvider.build_context()`，Review调用`build_review_context()`并排除当前待Review Artifact。

### MEM-PY-003：Clear/query RAG

`clear_indexed_outputs(context, scope)`支持run/stage/phase/task并soft-delete active records；当前`src/core/stage.py`和`task_state.py`、目标`src/framework/`在reset路径调用它。CLI当前支持status、index/reindex、index-existing、retrieve、clear、debug、compact和self-test；compact只返回status/dry-run且`compacted=false`。`GET /rag-stats`后续经统一Dashboard HTTP Service提供，Memory System不建立独立HTTP Server。

### MEM-PY-004：Query/promote role memory

输入 `MemoryQuery`、`MemoryPolicy`、candidate `MemoryEntryRecord` 和 lesson admission decision，执行三层 scope 检索、filter/rank/deduplicate、conflict detection、promotion decision 和原子写入。返回稳定 entry/result/promotion/conflict authority。MLEXP `memory_runtime` 读取这些 entry 并组装 role session memory pack；Memory 不在另一处复制 pack builder。

Testing Stage 请求必须额外携带当前层的 `test_method_profile`，其值只允许 `unit_test/module_test/subsystem_test/system_test`。返回 pack 按任务需要投影测试设计方法、覆盖维度、Case 拆分、数据构造、脚本/readiness 方法，并在存在匹配记录时附带已准入 escape lessons；没有历史 lesson 不构成 required evidence 缺失。Memory System 不返回整篇方法文档。Stage Process 使用返回的 snapshot ref 生成三字段 `test_method_binding.json`；Memory System 不写 Stage Artifact，也不决定 template。

同一个 Stage run 或测试批次中的 snapshot 必须稳定可重放。当前批次产生的新 lesson 即使完成 admission，也不得改变已冻结 snapshot；只能在下一 run/batch 或显式 rebaseline 后进入 effective pack。

memory missing、scope 越界、effective mode 冲突、trust/source conflict 必须显式失败或按Contract排除，并留下audit。project-private candidate不得进入generalized role memory；conflict不得静默覆盖existing entry。

### MEM-PY-005：Build Context Brief

目标输入task identity、scope、mode、positive token budget、required evidence types必填，include suspect=true。返回trusted/suspect evidence、blocker、design/code/test refs和inspection order。required evidence缺失、trust/source conflict失败。当前无实现，调用unsupported。

### MEM-PY-006：Stable code query

目标输入repository root、current commit、operation、query必填，limit可选。返回normalized results/source/evidence/indexed commit/backend/version，无命中`[]`。stale/missing/unsupported/tool error失败，禁止silent analyze/fallback。当前仅开发者GitNexus工具，runtime调用unsupported。

## 5. Operational Contract

| Interface ID | 幂等/并发 | timeout/retry | 安全/可观测性 | 测试证据 |
|---|---|---|---|---|
| `MEM-PY-001` | content hash可复用；WAL/index transaction | SQLite busy 60秒，embedding timeout按config | canonical path/API key保护；index manifest/event | RAG index/lifecycle tests |
| `MEM-PY-002` | retrieval read幂等，judge call非幂等 | judge/embedding timeout/attempt按config | scope/target/path保护；RetrievalRecord/LLM IO | RAG context/judge/validator tests |
| `MEM-PY-003` | clear幂等、stats read幂等；CLI写操作非幂等 | DB/HTTP/provider timeout | workspace/scope/credential保护；clear/stats/debug evidence | RAG clear/CLI/stats tests；compact Partial |
| `MEM-PY-004` | query幂等；promotion使用expected-absent与原子replace；scope隔离 | store/query有界；无隐式retry | admission/effective mode/source/trust/conflict审计 | Unit/Module已覆盖；Subsystem验证三层组合与lesson conflict |
| `MEM-PY-005` | Planned projection可重建，writer/concurrency待设计 | 无当前timeout/retry | source/trust/raw store隔离；目标brief audit | 未实现，需schema/rebuild/security/system tests |
| `MEM-PY-006` | Planned query幂等，禁止silent analyze | adapter/tool timeout待设计 | repo/path/commit freshness保护；目标query audit | 未实现，需adapter/freshness/error tests |

## 6. Failure/Recovery And Module Design

best-effort index失败不进入active index；required retrieval/index失败阻断对应gate。Stage/Phase/Task reset必须清理对应scope的RAG active index，并按Stage Process reset contract删除scope内Artifact records与canonical outputs；RAG clear本身只负责soft-delete派生索引，不负责保留或删除业务Artifact。lesson candidate 与 generalized role memory 的恢复遵守“准入前可撤销、准入后可审计重建”，不能在当前批次中静默改写既有标准。Role Agent Memory Storage和Lesson Admission Decision已实现；Run Index、Graph/Trust、Context Broker和Slinky GitNexus Adapter仍保持Planned。

已实现能力的4份Module Design位于`../40_module_design/memory/`：`schema_registry_module.md`、`indexing_module.md`、`retrieval_context_module.md`和`lifecycle_operations_module.md`。Planned能力在获得实现批准前不创建Module Design或production目录。

## 7. 可测试性设计

Memory System 必须显式支持以下可测试性入口，避免 memory 问题继续拖到最下游 system test 才暴露：

- fixture / synthetic memory entry 注入
  - 允许使用受控 fixture 构造 project memory、role-project memory、generalized role memory 与 lesson candidate，不能依赖真实上游长链先跑完。
- deterministic rebuild / clear
  - 必须支持按 run、stage、phase、task 和 memory scope 重建或清理派生索引，并保留 clear manifest、rebuild evidence 和失败分类。
- query audit
  - retrieval、memory pack、lesson admission 的输入、筛选过程、命中条目、trust/source/freshness 判断必须可审计，不能只保留最终拼接结果。
- testing method snapshot
  - 四种 `test_method_profile` 必须能分别生成稳定 snapshot；相同 binding 重放得到相同 effective entry 集，同批次 lesson 不得热更新。
- negative / boundary validation
  - 缺失 evidence、stale entry、trust 冲突、scope 越界、duplicate entry、effective mode 冲突都必须有明确失败语义和独立测试。
- debug / inspect entry
  - CLI 或等价调试接口必须支持查看 memory entry、index state、clear result、admission decision 和 pack selection，不允许只靠直接查 SQLite 临时排障。

下游 Module Design 和 ISD 必须把以上五类能力展开成具体参数、错误码、audit 字段和测试义务。

### 7.1 Runtime Topology 与关键业务 Flow

| Flow ID | Module 顺序 | Branch 条件 | 最终 authority |
|---|---|---|---|
| `MEM-FLOW-001` | Schema Registry -> SQLite transaction -> revision | fresh/current/old/future/corrupt/partial | registry revision |
| `MEM-FLOW-002` | Indexing -> embedding boundary -> Registry commit -> manifest | supported/empty/duplicate/update/delete/partial | index DB + manifest |
| `MEM-FLOW-003` | query -> Retrieval -> judge boundary -> context | scope/filter/top-k/threshold/tie/error | RetrievalRecord |
| `MEM-FLOW-004` | Lifecycle -> clear/reset/reindex -> retrieval proof | task/phase/stage/race/failure | clear/rebuild manifest |
| `MEM-FLOW-005` | accepted Artifact hook -> Indexing -> retrieval | accepted/candidate/malformed | Artifact refs + index |
| `MEM-FLOW-006` | admission decision -> conflict -> promotion -> store | accept/reject/need_more_evidence/duplicate/conflict | MemoryEntry + promotion audit |

### 7.2 Failure Propagation 与 Recovery

- transaction失败必须rollback或留下typed incomplete evidence，不得生成第二DB。
- embedding/judge错误按required/best-effort policy传播，不得转为空成功。
- scope/trust冲突必须拒绝或显式排除并记录audit。
- role memory conflict必须保留candidate、existing和decision identity。
- cleanup/reopen必须证明DB、WAL和scope恢复；unrelated Project/role entry必须保留。
