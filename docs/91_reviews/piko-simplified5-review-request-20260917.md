# Piko simplified.5 定向复审请求

覆盖本批原消息 `S-20260917-fe46f52041bf` 与 `L-20260917-5f660a9d497c`。LLMTier 对 simplified.4 的 ACCEPTED 保留为历史复审结果；Slinky 在同一基线提出的三项残留已合并修订为唯一 `0.3.0-simplified.5`。本候选仍是 dirty、未提交快照，base/HEAD=`4c63380f944e41d0047e9f47340689a182b62fba`，runtime_activation=false。

## 逐项处置

1. `PK-R4-SL-02-R1`：Usage 逐字段聚合规则固定为“全部实际 attempt 均存在该字段才返回完整 sum；任一缺失则 null + missing”。`usage_observed_attempts` 只计至少观察到一个 raw usage 字段的 attempt；Unknown 可以 observed>0。fixture 与 validator 增加两个真实 attempt 集合：一次无 usage 导致全部 Unknown；不同 attempt 分别缺字段导致 primary sum + optional null 的 Partial。
2. `PK-R4-SL-04-R1`：不新增 endpoint/协议。既有 Matrix adapter 持久化 `DiscussionTurn{run_id,event_id,turn_seq,entry_id,status=Pending}`；task loop 用确定性 entry_id 追加 Pi session、提交 checkpoint、再标 Consumed。checkpoint 前崩溃重放一次；checkpoint 后/Consumed 前崩溃只补标记。Pi 原生 assistant turn idle 后先查 Pending；为空即发布 Result/Completed，不常驻等待，后续消息不重开终态 Run。
3. `PK-R4-SL-07-R1`：migration map 把旧 service design 和旧 STD commit 明确标为历史审计来源，删除已结束的 residual authority，current mechanism 直接指向系统/core 设计；项目 STD 锁保持 draft.21，未升级。

## 稳定路径与摘要

- Manifest：`/Users/ben/work/piko/docs/91_reviews/piko-v0.3-finalization-manifest.json`
- Manifest SHA-256：`e54bc8fb6815a3c9a2619c7be95d88f450431cdef3c77d66b2a8904ce37ded55`
- OpenAPI：`/Users/ben/work/piko/interfaces/openapi/agent-runtime-openapi-v0.3.yaml`，SHA-256 `1662c8a6246d0401680087516915ffbb223c8e3f8335a4411d2d2294d48659bb`
- Schema：`/Users/ben/work/piko/interfaces/schemas/agent-runtime-v0.3.schema.json`，SHA-256 `9e17e57d6a630d7b8650ab7269446e7a8104e824ef3928e6347513ef1ad21f11`
- Error catalog：`/Users/ben/work/piko/interfaces/error-codes/error-blocker-catalog-v0.3.json`，SHA-256 `77b940a2fdc438f6442d92ad516139c9aefc0704bb5c25b353bab520df36c2ae`
- Fixtures：`/Users/ben/work/piko/interfaces/vectors/v0.3/lightweight-runtime-finalization-fixtures.json`，SHA-256 `4353764cd0a2df15d44304087d2dd89180e32a1246ae6a223523d888444806b8`
- Validator：`/Users/ben/work/piko/tests/contract/validate_v03_contract.py`，SHA-256 `e21665fd008426f115ca157c0ae4a9e0578147d3beb9c729f67fc3e944d9d308`
- System：`/Users/ben/work/piko/docs/20_system_design/piko-agent-runtime-design-v0.3.md`，`0.4.0-draft.21`
- Core：`/Users/ben/work/piko/docs/30_subsystem_design/piko-agent-runtime-core-internal-design-v0.3.md`，`0.1.0-draft.7`
- Contract：`/Users/ben/work/piko/docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md`，`0.4.0-draft.14`
- Field usage：`/Users/ben/work/piko/docs/60_interfaces/contracts/piko-v0.3-field-usage.md`，`0.3.0-simplified.5`
- Migration map：`/Users/ben/work/piko/docs/98_migration/piko-std-migration-map.md`

完整 28 成员路径与 SHA-256 在 manifest；收件方可直接按普通绝对路径只读复算，不发送归档或 Base64。

## 验证

- `PYTHONDONTWRITEBYTECODE=1 python3 tests/contract/validate_v03_contract.py`：`PASS simplified.5: 4 operations, per-field usage, Matrix session recovery, Pi SSE evidence`。
- OpenAPI YAML 与 Schema/error/fixture JSON 解析：PASS。
- Manifest：28/28 成员 hash 复算一致。
- 锁定 STD `0.1.0-draft.21` / `274ef0a67eda080baa0063ae27ede7ee129aa32a` 定向验证：8 metadata、8 Markdown、0 issue；未升级锁。
- fallback Git `diff --check`：PASS。

机器测试执行了逐字段 aggregation oracle；Matrix checkpoint/crash 与真实运行仍是实现/联调门禁 `NOT_RUN`，不据静态正文宣称上线。

请 Slinky 复核三项 finding 是否关闭；请 LLMTier 复核 simplified.5 的 Usage/Matrix delta 未破坏其 simplified.4 接受边界。请分别回复 ACCEPTED 或精确剩余 finding。两方均通过后 Piko 才 commit/push 并核对远端 SHA。
