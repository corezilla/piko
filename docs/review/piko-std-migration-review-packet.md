# Piko STD 首轮迁移 Review Packet

状态：等待项目与跨项目 Review  
日期：2026-09-07  
STD：`0.1.0-draft.1`，`source_revision=null`

## 1. Review 请求与期望决定

请评审 Piko v0.3 设计是否在不改变既有契约语义的前提下，完整迁移到 STD 模板，并确认
新候选设计可否作为后续实现的 canonical design candidate。

决定只允许：`ACCEPTED / AMENDMENT / REJECTED / BLOCKED`。由于 STD 尚无 immutable
source revision，即使内容通过，本轮也只能接受迁移结构和项目候选状态，不能标记 released。

## 2. Scope、authority 与 reviewers

- 修改范围：仅 `/Users/ben/work/piko`；未读取或修改 Slinky/LLMTier 项目文件。
- Piko authority：Agent Runtime、Pi/LLMTier adapter、CollaborationBridge、内部状态与恢复。
- Slinky authority：Project/Plan/IR/Work/Decision/Acceptance 及外部需求冻结。
- LLMTier authority：模型服务 Registry/admission/provider routing/Invocation ledger。
- 期望 reviewers：用户、Slinky；涉及 consumed LLMTier contract 的章节抄送 llmtier。

## 3. 冻结基线

| 项目 | 值 |
|---|---|
| Piko repository | `/Users/ben/work/piko` |
| 迁移 base commit | `fbdf51a5749a0a7d9483780a76d40982851f540f` |
| STD version | `0.1.0-draft.1` |
| STD source revision | `null`（STD 尚未创建首个 immutable commit） |
| Pi baseline | `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` |
| Pi/OpenAI packages | pi-coding-agent/pi-ai 0.85.1；openai 6.40.0 |
| Piko API candidate | base v0.2 + Matrix increment v0.3 |

候选文件的最终 SHA-256 与 review commit 在提交后通过 Matrix review message 提供，避免在
文件自身写入自引用 hash。机器契约沿用 base commit 中的 immutable 内容。

## 4. 变更摘要与设计理由

### 4.1 新增治理文件

- `docs/management/current-document-inventory.md`：盘点旧文档、authority、版本、冲突和模板映射。
- `docs/management/piko-std-tailoring-v0.1.md` + metadata：记录 keep/simplify/omit。
- `docs/std.lock.json`：锁定 STD draft version，按要求保持 source revision null。

### 4.2 新增候选设计

- `docs/design/piko-agent-runtime-design-v0.3.md`：整体服务的完整 STD definition。
- `docs/design/piko-collaboration-bridge-design-v0.3.md`：Matrix/Element 子系统白盒设计。

两份设计均补齐 Current Baseline/Approved Delta、authority、上下文、一级构建块、内部责任、
数据 owner、状态机、主路径时序、并发、失败恢复、可观测性、资源限制、安全、实现映射、
traceability 和 activation gate。旧设计未删除或覆盖。

### 4.3 新增契约与 Assurance 说明

- `docs/contracts/piko-agent-runtime-contract-v0.3.md`：聚合机器契约 authority，不复制 Schema。
- `docs/assurance/piko-agent-runtime-vv-plan-v0.3.md`：区分分析、检查、演示、测试和 Acceptance。
- `docs/assurance/piko-agent-runtime-test-specification-v0.3.md`：保留原 ID，明确 input/oracle/evidence。

fixture、OpenAPI、JSON Schema、error catalog 和 validator 保持机器可读，不转写进 Markdown。

## 5. Requirement、Design、Contract、Test 对齐

| Requirement | Design | Contract | Test |
|---|---|---|---|
| 单一 Runtime/Inference path | Runtime §2/5/12 | base OpenAPI/Schema | AR-001、LT-C-001 |
| atomic Run/Slot/Session intent | Runtime §4/7/8；Bridge §4 | AgentTaskRequest/Run | V03-E2E-085..087/095 |
| strict Result/UnknownOutcome | Runtime §7/9 | AgentTaskResult/Error | V03-E2E-088..092 |
| LLMTier exact model/recovery | Runtime §6/8/10 | consumed Scope B contract | LT-C-001、LT-R-001 |
| stable Matrix identity/exclusive room | Bridge §3/7/11 | Matrix OpenAPI/Schema/errors | V03-E2E-093..095 |
| durable delivery/failover | Bridge §8/9 | txn/event/outbox rules | V03-E2E-096 |
| multi-room cursor | Bridge §8.3 | Session list/filter/cursor | MX-U/C/R-013、V03-E2E-097 |
| structured resolution/authority | Bridge §5/11 | AgentTaskResultV03/Resolution | MX-U-014、MX-S-013/014、V03-E2E-098 |
| exact Element discussion | Bridge §6/11 | Descriptor + typed 503 | MX-C-015、V03-E2E-099 |

## 6. 风险、未决项和不阻塞项

### Blocking activation, not migration review

- persistence engine、database migration、single-writer/HA topology；
- Pi AgentSession collaboration hook 实测；
- Workspace/Tool materialized descriptor 和 controlled execution profile；
- retention catalog、homeserver/AS version、CollaborationEvent fixture；
- Element route encoding、cursor signing/snapshot/expiry；
- transport capacity、backpressure、SLO 和完整 Recovery/Security/E2E evidence。

### STD migration limitation

STD 当前是 draft 且 `source_revision=null`。项目 metadata 只能保持 draft/review；STD 首次
immutable commit/tag 后必须统一升级 lock，并审阅模板差异。

## 7. 验证命令与结果

已执行：

```bash
python3 scripts/validate_v03_contract.py
/Users/ben/work/STD/scripts/validate-design docs
python3 -m json.tool docs/std.lock.json
python3 -m json.tool <all metadata files>
git diff --check
```

- `scripts/validate_v03_contract.py`：4 个 Schema fixture、2 个语义 fixture及
  OpenAPI `$ref`/filter/typed error/authority boundary 全部通过；
- STD `validate-design docs`：通过；
- `docs/std.lock.json` 与全部 `.metadata.json` JSON parse：通过；
- STD metadata Draft 2020-12 Schema 与 template SHA-256 复核：通过；
- 未解析 `TODO`/模板变量扫描：通过；
- `git diff --check`：通过。

提交后通过 Matrix review message 附 immutable commit 和全部候选文件 SHA-256。

## 8. Review Checklist

- [x] scope 与 authority 清楚；
- [x] Current Baseline、Approved Delta 和未来设想未混写；
- [x] 两个设计均完整覆盖 STD `design.definition` 十四章；
- [x] 接口、错误、状态、数据 owner 和恢复已闭合到现有证据边界；
- [x] 安全、Secret、多项目隔离和 authority overflow 已描述；
- [x] Requirement -> Design -> Contract -> Test traceability 可追踪；
- [x] 原文档、原 ID 和机器契约均保留；
- [x] 未发生静默 fallback、兼容性扩张或第二实现路径；
- [x] STD validator 和项目 validator 最终通过；
- [ ] Slinky/用户 Review 完成。

## 9. 决定、条件与签署

当前决定：`PENDING_REVIEW`。

若接受：新候选设计成为 Piko v0.3 后续实现的 canonical design candidate；旧文档保留至归档
决定。若 Amendment：Piko在同一迁移分支继续修订，不生成并行模板版本。若 STD source
revision 仍为空，不执行 RAG ingestion，也不把文档标记 accepted/released。
