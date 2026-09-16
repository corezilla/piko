# Piko V0.3 Finalization Review Packet

| 字段 | 值 |
|---|---|
| Package ID | `piko-v0.3-finalization` |
| Package Version | `0.3.0-finalization.3` |
| Status | Review；runtime activation=false |
| Authority | Piko |
| Request | `S-20260916-191ab7c8184c` |
| Machine authority | `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` + JSON Schema + error catalog |
| Hash manifest | `docs/91_reviews/piko-v0.3-finalization-manifest.json` |

## 1. A 类跨系统设计结论

Piko-owned跨系统字段或行为没有遗留到联调再决定。四项Run API、全部请求/响应/错误、ClientTaskIndex、
7天恢复、404/410、workspace/tool/agent/session binding、identity provisioning、invite核验、revoke/drain、
communication trigger、产品消息send/receipt/event/ingress、release/strict close组合和旧wire删除版本均已定义。

LLMTier语义消费固定为Amendment 8：三位毫秒deadline header、digest、408优先于缓存429、无ID原POST恢复、
单调用到期即停止Run新业务、晚到成功仅作Evidence、non-stream Responses/Models/recovery/tool-loop且无
Chat/SSE/fallback。LLMTier `0.3-finalization-candidate.1`目标OpenAPI SHA-256
`5b3ceb7593b06c3401af25031a08d15a3c230063bae06b45b1ba779c7d25df3f`已由Slinky转交；Piko尚未收到
实际机器正文、未复算或做差异审查。状态明确为“目标hash已知、机器内容待提供”，不冒充字节级签署。

## 2. 一次性退役

从 `0.3.0-finalization.3` 起删除v0.2 heavy request/result、participants/team/collaboration resolution、
`runs:by-attempt`、manual reconcile、Run SSE、Piko Session list/element-view/:close、原子建房
`collaboration_contract`及旧嵌套`bindings`。不提供alias、转换器、双写或runtime fallback。

## 3. B 类内部下游设计

durable DB/HA/DDL、worker排程实现、Pi hook、workspace/tool sandbox和部署拓扑由Piko内部继续设计；
不得修改A类字段、状态、错误、digest、retention或authority。

## 4. C 类联调与激活证据

真实LLMTier SDK capture、Matrix/Element/AS、Pi、Tool/Workspace、crash/failover、安全/retention、性能与
RPO/RTO仍未执行。失败只能保持activation=false，不能恢复旧wire。

## 5. 验证摘要

- `python3 tests/contract/validate_v03_contract.py`：exit 0；16 Schema case、28 semantic case、13 path、31 error。
- Draft 2020-12 Schema check、全部interfaces JSON parse、OpenAPI YAML parse：exit 0。
- Piko-owned跨系统语义无“实现时再确认”；唯一外部输入是LLMTier target OpenAPI机器正文，用于复算
  已知hash与差异审查，明确留在baseline binding gate，未转移到联调。
- 仅用项目内`docs/std.lock.json`与`docs/std-source-manifest.json`核验8个本包metadata：7个template hash
  与锁定draft.21一致；`design.system`文档已采用4.0.0/hash `ec2800...`，与lock内旧hash `96d14...`
  不一致，明确列为STD迁移项。未跨仓读取、未擅自升级项目STD lock，也不宣称全部STD校验通过。
- 系统Git被本机未接受Xcode license阻断（exit 69）；使用Codex runtime fallback Git执行diff/check/status与
  本地review commit，不推送。

## 6. 评审判定

请求Slinky/LLMTier只审A类跨系统契约；B/C不作为设计冻结阻塞，但保持runtime activation=false。
若A类无字段矛盾，下一计划阶段为各方内部下游设计，之后按本包唯一wire联调。
