<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko ↔ LLMTier 联调方案（环境部署与首次联合调试）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-joint-installation-deployment-guide-v0.1` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-21` |
| Last Modified Date | `2026-09-21` |
| Template ID | `operations.installation-deployment` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/80_operations/deployment/piko-llmtier-joint-installation-deployment-guide-v0.1.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> 模板选择说明：STD 模板选择表中「首次联调」指向 `operations.bring-up`，但其节结构面向硬件
> （电源轨/Bitstream/JTAG）。本次对象是**纯软件双服务首次联合调试**，故采用
> `operations.installation-deployment`，并把 bring-up（首次拉起与首联验证）纳入 §5/§8。

## 1. 范围、版本与目标环境

- **目标**：在 m5mac（`192.168.1.8`）首次以**真实 LLMTier 服务**（非 mock、非 direct-oMLX 映射）
  运行 Piko 的模型数据面，验证 Piko ↔ LLMTier 契约在真实双向链路上的行为，为后续三方联调
  （Slinky–Piko–LLMTier）与 m5air 部署提供依据。
- **基线版本**：
  - Piko：`0.3.0-simplified.6`，branch `docs/piko-system-design-std26`（含本次 `llmtier.base_url`
    schema 放宽，见 §7）；Pi pinned `9767ba27` / v0.85.1。
  - LLMTier：`0.3.0-dev`（V0.3 candidate 包；Piko 侧 wire 基线为 **candidate.7**，
    见 `tests/integration/llmtier-contract.test.ts` PK-T41..T54）。`overall.runtime_activation=false`，
    本联调**不构成** production activation。
  - 模型后端：oMLX `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` @ `127.0.0.1:9000/v1`。
- **目标环境（联调实例，全部由本次联调新建）**：
  - LLMTier 联调实例：`0.0.0.0:8180`（对内 loopback、对内 LAN `192.168.1.8:8180` 均可达）。
  - Piko 联调实例：`127.0.0.1:8788`，独立 SQLite 与 session/staging 目录。
- **明确不在范围内**：m5air（`192.168.1.9:8181`）生产实例的变更；TLS/production auth 激活；
  embeddings/admin UI/Slinky capacity；本机 `18999` 端口上的他人 `llmtier_v03` 实例（**禁止触碰**）。
- **授权决定**：Piko Project Owner 于 2026-09-21 批准模型 endpoint 允许明文 `http://`
  （trusted-LAN；LLMTier production TLS/auth 本就未激活）。据此放宽 Piko runtime config schema。

## 2. Architecture、Topology 与依赖

```text
Slinky/Operator
      │  POST /runs (bearer: piko-api-bearer)
      ▼
Piko joint instance 127.0.0.1:8788   ← config/runtime.llmtier.json (matrix.enabled=false)
      │  POST /v1/responses  (SSE, stream:true store:false, model="Worker",
      │  Bearer: llmtier-joint-data-token)         GET /v1/models（preflight）
      │  GET  /tier/v1/usage（用量对账，联调验证用）
      ▼
LLMTier joint instance 192.168.1.8:8180（0.0.0.0 监听，m5air 生产同型）
      │  OpenAI-compatible（Bearer: OMLX_API_KEY）
      ▼
oMLX 127.0.0.1:9000/v1  →  Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed
```

- **接口 authority**：`LLMTier/docs/60_interfaces/piko-data-plane-control.md`
  （`llmtier-piko-data-plane-control` v0.3.2-draft.3）+ LLMTier V0.3 OpenAPI。Piko 侧既有的
  PK-T41..T54（mock wire conformance）是本联调的**契约基线**，真实实例必须给出等价行为。
- **关键语义**（联调判定依据）：`model` 为 exact service-level ID；`stream:true/store:false` 固定；
  usage 使用标准字段且 `input_tokens` 含 `cached_tokens`、`cache_write_tokens` 为额外细分、
  `reasoning_tokens` 为 output 子集；缺 usage 不把成功改失败（Piko 记 Unknown/Partial）；
  错误面 400/401/404/429/502/503；无 conversation 状态机，每请求独立。
- **依赖**：oMLX 健康；Synapse 不参与（joint 实例 `matrix.enabled=false`，避免与生产 Piko 的
  `@piko-bot` 双同步冲突）。

## 3. Hardware/Software/Firmware Prerequisites

| 项 | 要求 | 实测 |
|---|---|---|
| 主机 | m5mac `192.168.1.8`（本机） | ✓ |
| Python | ≥3.11（LLMTier） | 3.14.3 ✓ |
| Node | ≥22（Piko/tsxl） | 22.22.3 ✓ |
| oMLX | `127.0.0.1:9000` 健康 | ✓（200） |
| 端口 | 8180、8788 空闲 | ✓（8181/18999 已被占用，均不使用） |
| 隔离 | 不触碰 18999（他人实例）、8787（生产 Piko）、m5air | ✓ |
| Secrets | `~/piko-secrets/` 可写（0600） | ✓ |

## 4. Package、Image、Bitstream 与 Integrity Check

- 两侧均为**源码树直跑**，无镜像/烧录产物：
  - LLMTier：`/Users/ben/work/LLMTier`，`PYTHONPATH=src python3 -m llmtier_v03 …`（不安装 editable 包）。
  - Piko：`/Users/ben/work/piko`，`npx tsx src/main.ts`（tsx 运行时）。
- **完整性锚点**：Piko 启动时校验 Pi adapter patch manifest SHA256 与 Pi pin
  （`config/pi-adapter-patch-manifest.json`，`c2dc381b…`）；LLMTier 契约面以
  `interfaces/openapi/llmtier-v0.3.openapi.json` 为准；Piko 侧 wire 断言基于 candidate.7 schema。
- 联调前置自检：`npm run check` 须绿（本方案编写时实测 93 passed / 0 skipped）。

## 5. 安装、部署、烧录或装配步骤

**步骤 A：生成联调凭据**（一次性）

```bash
ADMIN=$(openssl rand -hex 24); DATA=$(openssl rand -hex 24)
printf '%s' "$ADMIN" > ~/piko-secrets/llmtier-joint-admin-token; chmod 600 ~/piko-secrets/llmtier-joint-admin-token
printf '%s' "$DATA"  > ~/piko-secrets/llmtier-joint-data-token;  chmod 600 ~/piko-secrets/llmtier-joint-data-token
```

**步骤 B：首次拉起 LLMTier 联调实例**（空 SQLite 必须一次性 bootstrap；凭据仅经 env 传入）

```bash
cd /Users/ben/work/LLMTier
OMLX_API_KEY=$(cat ~/piko-secrets/piko-llm-key) \
LLMTIER_ADMIN_TOKEN=$(cat ~/piko-secrets/llmtier-joint-admin-token) \
LLMTIER_DATA_TOKEN=$(cat ~/piko-secrets/llmtier-joint-data-token) \
PYTHONPATH=src nohup python3 -m llmtier_v03 \
  --host 0.0.0.0 --port 8180 \
  --database state/llmtier-piko-joint.sqlite3 \
  --settings config/settings.json > state/llmtier-piko-joint.log 2>&1 &
```

要点（均实测踩点）：`config/settings.json` 的 provider `secret_ref` 是 `env:OMLX_API_KEY`，
**必须**注入（否则 `/v1/models` 报 `bootstrap_invalid`）；`--host 0.0.0.0` 与 m5air 生产同型
（LAN+loopback 双可达）；数据库独立命名为 `state/llmtier-piko-joint.sqlite3`。

**步骤 C：确认部署健康**（探测是显式动作，不确认则模型 availability=degraded）

```bash
ADMIN=$(cat ~/piko-secrets/llmtier-joint-admin-token)
DID=deployment_omlx_qwen36
curl -s -X POST -H "Authorization: Bearer $ADMIN" -H "Content-Type: application/json" \
  -d "{\"deployment_id\":\"$DID\",\"confirm_external_call\":true}" \
  http://192.168.1.8:8180/tier/admin/v1/probes    # → {"status":"healthy",...}
```

**步骤 D：拉起 Piko 联调实例**

```bash
cd /Users/ben/work/piko
NODE_EXTRA_CA_CERTS="$HOME/piko-matrix-homeserver/tls/server.crt" \
PIKO_CONFIG=/Users/ben/work/piko/config/runtime.llmtier.json \
nohup npx tsx src/main.ts > var/piko-llmtier-joint.log 2>&1 &
# 启动即执行 provider preflight：GET /v1/models（Bearer）且必须包含 agent.model="Worker"
```

## 6. 配置、Secret、Certificate 与权限

| Secret | 位置 | 用途 | 权限 |
|---|---|---|---|
| `llmtier-joint-admin-token` | `~/piko-secrets/` | LLMTier admin API（probe/CRUD/audit） | 0600，不入库不入日志 |
| `llmtier-joint-data-token` | `~/piko-secrets/` | Data Plane Bearer（Piko → LLMTier） | 0600 |
| `piko-llm-key`（既有） | `~/piko-secrets/` | 内容为 oMLX key `9832`，经 `OMLX_API_KEY` 注入 LLMTier | 0600 |
| `piko-api-bearer`（既有） | `~/piko-secrets/` | 调用方 → Piko | 0600 |

- Piko 联调配置 `config/runtime.llmtier.json`（被 `.gitignore` 的 `config/runtime*.json` 覆盖）：
  `agent.model="Worker"`；`llmtier.base_url="http://192.168.1.8:8180/v1/"`；
  `api_key_secret_ref="file:…/llmtier-joint-data-token"`；`listen 127.0.0.1:8788`；
  独立 `task_store.sqlite_path=var/piko-llmtier-joint.sqlite`、`session_root`、`staging_root`；
  **`matrix.enabled=false`**。
- Schema 决定（Owner 批准，2026-09-21）：`llmtier.base_url` 允许 `^https?://`（原先仅 https 或
  loopback-http）。连带更新 `tests/unit/config-schema.test.ts` 与
  `tests/contract/validate_v03_contract.py` 的负面样例（改用 `ftp://`）。
- 权限边界：data token 只授权 Data Plane；admin token 不下发 Piko；LLMTier 不获得 Piko 的
  workspace/Matrix 凭据。

## 7. 数据初始化、Migration 与 Compatibility

- LLMTier：空 SQLite 首启以 `config/settings.json` 为一次性 bootstrap（provider/deployment/
  service-levels 各 6 个：Senior/Junior/Worker/Associate/Engineer/Executor）；此后 **SQLite 是唯一
  配置 authority，后续启动忽略该文件**。联调库独立（`llmtier-piko-joint`），重置=删库重启再 bootstrap。
- 模型兼容：Piko 发送 `model="Worker"`（exact service-level ID，不做 tier→oMLX 改写；
  `config/model-mapping.json` 仅属 direct-oMLX 测试路径，运行时 Piko 不读取它）。
  Piko preflight 要求 `/v1/models` 的 `data[].id` 精确包含所配 model —— 实测满足。
- usage 兼容：真实链路 oMLX 不回报 `cache_write_tokens` → LLMTier 记 `null` → Piko
  `usage.quality=Partial`（`missing_fields=["cache_write_tokens"]`）。这是**契约允许的预期**，
  不是缺陷（与 direct-oMLX 路径一致）。
- 已知约束记录：`readyz` 全局 status 因内置 `Embedding-v1` 占位（无部署）长期为 `degraded`，
  chat 模型均为 `available`；联调判定以 `/v1/models` 与 probe 结果为准，不以全局 readyz 为门禁。

## 8. Verification、Smoke Test 与 Acceptance

首次联合冒烟（2026-09-21，全部通过，作为本方案 §5 步骤的验收证据）：

| # | 检查 | 命令/路径 | 期望 | 实测 |
|---|---|---|---|---|
| V1 | LLMTier 健康 | `GET /healthz` | 200 `status=ok` | ✓ `0.3.0-dev` |
| V2 | 部署探测 | `POST /tier/admin/v1/probes` | `healthy` | ✓ |
| V3 | 模型清单 | `GET /v1/models`（data token） | `data[].id` 含 `Worker` 等 6 项 | ✓（OpenAI 形状） |
| V4 | 真实推理 SSE | `POST /v1/responses` `model=Worker,stream=true,store=false` | `response.created→…→response.completed`+`[DONE]`，usage 标准字段 | ✓ 10 events；`input 18/output 1/total 19`，`cached_tokens=0`，`reasoning_tokens=1` |
| V5 | 用量账本 | `GET /tier/v1/usage?from&to` | 记录含 `request_id/record_version/measurement_status=measured` | ✓ |
| V6 | Piko 预检 | 启动 joint Piko | preflight 通过（`/v1/models` 含 `Worker`） | ✓ |
| V7 | Piko→LLMTier→oMLX 端到端 | `POST /runs`（8788） | `Completed` 且 `usage.usage_observed_attempts≥1` | ✓ `Partial/1`（缺 cache_write_tokens，符合契约） |
| V8 | LAN 可达性 | `curl http://192.168.1.8:8180/healthz` | 200 | ✓（loopback 同） |
| V9 | Piko 回归不受影响 | `npm run check` | 全绿 | ✓ 93 passed / 0 skipped |

Acceptance（本方案）：V1..V9 全部通过即视为「联调环境部署完成」，联调执行交由
`piko-llmtier-joint-test-plan-v0.1` 组织。

## 9. Upgrade、Rollback 与 Disaster Recovery

- **重启 LLMTier**：kill 进程后按 §5-B 重启（不再需要 settings bootstrap 内容，但 env 三个变量仍须
  提供；SQLite 为准）。
- **重置联调库**：`kill` → 删除 `state/llmtier-piko-joint.sqlite3*` → 重新 §5-B（重新 bootstrap）。
- **回退**：kill joint LLMTier（8180）与 joint Piko（8788）即完全退出联调拓扑；生产 Piko（8787，
  direct-oMLX `config/runtime.json`）全程未改动，不受影响。
- **DR**：无持久化业务数据；LLMTier usage 账本仅作联调证据，可随库重建。

## 10. Uninstall、Cleanup 与交付记录

```bash
kill $(lsof -nP -iTCP:8180 -sTCP:LISTEN -t) 2>/dev/null   # LLMTier joint
kill $(lsof -nP -iTCP:8788 -sTCP:LISTEN -t) 2>/dev/null   # Piko joint
rm -f /Users/ben/work/LLMTier/state/llmtier-piko-joint.sqlite3* \
      /Users/ben/work/LLMTier/state/llmtier-piko-joint.log
rm -f ~/piko-secrets/llmtier-joint-admin-token ~/piko-secrets/llmtier-joint-data-token
```

交付记录：本方案 §8 的 V1..V9 证据；联调库 `state/llmtier-piko-joint.sqlite3`（保留至联调计划
Gate 关闭）；联调执行结果见 `piko-llmtier-joint-test-plan-v0.1` 与其 test-report。
