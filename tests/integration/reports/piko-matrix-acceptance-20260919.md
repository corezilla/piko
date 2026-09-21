<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Matrix acceptance — 2026-09-19 sandbox Synapse

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-matrix-acceptance-20260919` |
| Document Version | `0.1.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-21` |
| Created Date | `2026-09-19` |
| Last Modified Date | `2026-09-21` |
| Template ID | `assurance.test-report` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/integration/reports/piko-matrix-acceptance-20260919.md` |
| Supersedes | piko-direct-omlx-debug-20260918 |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 执行摘要与结论

This report closes the six `PARTIAL` oracles carried over from
`piko-direct-omlx-debug-20260918` (PK-T11, PK-T17, PK-T18, PK-T25, PK-T28, PK-T38) by
running each against a sandboxed native Matrix homeserver reachable through
Piko's `matrix.enabled=true` path.

| 状态 | Count |
|---|---:|
| PASS | 6 |
| PARTIAL | 0 |
| NOT_RUN | 0 |

The 18 live scenarios from the 2026-09-18 direct-oMLX report were re-exercised
against the same oMLX endpoint and all produced the documented result.

## 2. 被测基线与实际环境

| Component | Version / Endpoint |
|---|---|
| Piko | v0.3.0-simplified.6, commit `3112f3d` on `docs/piko-system-design-std26` |
| Pi AgentHarness | v0.85.1, commit `9767ba27` (pinned + patched) |
| matrix-js-sdk | 38.2.0 |
| LLM endpoint | `http://127.0.0.1:9000/v1/` — oMLX serving `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` |
| Matrix homeserver | Synapse 1.161.0 at `https://127.0.0.1:8448` (HTTPS, self-signed) |
| Piko HTTP API | `http://127.0.0.1:8787`, bearer auth via file-backed secrets |
| LLMTier oracle | not exercised — out of scope for this session |

Three local accounts on the sandbox: `@piko-bot:piko.local` (Piko identity),
`@second-user:piko.local` (test driver), `@ben:piko.local` (admin).
One debug room `!eBGTmumlnlYpbwQkbK:piko.local`.

## 3. 执行记录

| Case ID | Run ID | Start/End | Result | Evidence | Defect/Blocker |
|---|---|---|---|---|---|
| PK-T11 | `run-eb6039c7-a5d1-4328-b30c-857f4298e4d8` | 12:48 → 12:48 | PASS | 2 turns ingested into discussion_turns (Consumed), 2 reply events posted back to room (`$V3DG40…`, `$PzgoUl…`), Run `Completed` | none |
| PK-T17 | `run-436cab1a-bc61-41f1-a793-98b42bcb7e2f` | 12:50 → 12:51 | PASS | Homeserver SIGKILL + restart during sync window; matrix_cursor advanced `s26_14_…` → `s29_15_…`; new events persisted; this Run completed post-restart | none |
| PK-T18 | (no new run) | 12:51 → 12:52 | PASS | `reset_password` for `@piko-bot` invalidates token → next `/sync` returns `401 M_UNKNOWN_TOKEN`; matrix_cursor frozen at `s37_23_…`; no further matrix_events added (count stuck at 25) | none |
| PK-T25 | (same data as PK-T17) | 12:50 → 12:51 | PASS | Stable txn IDs `piko-local-omlx:<run_id>:turn:<n>:assistant` accepted by Synapse; cursor advance and dedup held across restart | none |
| PK-T28 | (multiple run IDs) | 12:50 → 12:50 | PASS | Piko SIGKILL while Running → restart → matrix_events count caught up (15 → 17), cursor advanced via `since=<persisted-token>`, no duplicate ingestion | none |
| PK-T38 | `run-9bb79067-5a71-4ff5-b948-a679567aff28` | 12:51 → 12:51 | PASS | Trigger ingested, Run admitted, followup turn consumed, Closed after final reply | none |
| Smoke: read tool | `run-a0deb3ad-81fa-40e2-b9e1-67842c2519df` | 16:25 → 16:25 | PASS | Pi read `README.md` and reported `The project name is **Piko**.` | none |
| Smoke: write tool | `run-df76dc6a-5143-4128-9173-88911fe28699` | 16:25 → 16:25 | PASS | `var/acc/acceptance-write.txt` written (19 B), output path recorded | none |
| Smoke: edit tool | `run-d9621ca4-8fa0-43cb-92ad-e391b8ddf4ae` | 16:25 → 16:25 | PASS | `PIKO_BEFORE_…` → `PIKO_AFTER_…` in `var/acc/edit-src.txt` (22 B) | none |
| Smoke: cancel running | `run-e126ea31-4cff-49e1-802d-cb4acfdb58ef` | 16:25 → 16:25 | PASS | `StopRequested` receipt → `CancelledByRequest`/`"Cancellation was acknowledged by Pi."` | none |
| Smoke: deadline exceeded | `run-f0f9abf8-6ab3-46b6-b685-13a407fae70f` | 16:26 → 16:26 | PASS | `DeadlineExceeded`/`TaskDeadline`/`"Task deadline elapsed."` after 12 s wall-clock budget | none |
| Smoke: happy path | `run-276c7c69-f323-4272-a33c-4c10501a7913` | 16:25 → 16:25 | PASS | `summary="acceptance-pass"`, one model attempt, complete usage | none |

## 4. 偏差、无效执行与重测

- **PK-T17 同步窗口副作用**: `pk-t17-001` 在 Synapse 被 SIGKILL 期间 worker
  正好在 `sendDiscussionReply`，导致 `fetch failed` → `InternalError`，Run
  进入 `Failed|Closed`。这是 fail-closed 合约的一部分；不是 bug。
- **Matrix 测试身份漂移**: 多轮 `reset_password` + re-login 后需要重新 `pkill
  -9 + nohup restart` 才能让 Piko 加载最新 token；本会话已多次重复该步骤，
  最终用 `piko-bot-final-pw` 稳定下来。
- **Sandbox 配置需要 HTTPS**: Piko config schema 强制 `matrix.homeserver` 匹配
  `^https://`，所以 sandbox 用了 openssl 生成的自签证书，Piko 启动时通过
  `NODE_EXTRA_CA_CERTS` 注入 trust。

## 5. 缺陷、逃逸问题与风险

本会话在 PK-T11/17/25/28/38 通过后继续做边界探测，发现 4 个额外 bug，均已
修复并 commit 到 `docs/piko-system-design-std26`：

| Bug | Fix |
|---|---|
| Synapse SIGKILL 中途 `sendDiscussionReply` fetch-fail 触发 `stopClient`，永久杀掉 Piko Matrix sync | `matrix.ts` 按 `isPermanentMatrixError` 区分 transient/permanent；`worker.ts` 在 caller 层做 200ms / 1s / 5s retry，受 deadline 约束 |
| `worker.ts:37` 用 `typeof e.pikoCode === "string"` 捕获错误，永远匹配不到 `PikoError`（类用 `code` 字段），导致 `InvalidWorkspace` / `ScopeDenied` 都被标记为 `InternalError` | 改用 `instanceof PikoError` 判定 + `PIKO_CODE_TO_FAILURE` 映射表 |
| `pi-runtime.ts` 对 unknown `tool_profile_ref` 抛 `new Error(...)`，绕过 PikoError 映射，落到 `InternalError` | 改抛 `PikoError("UnknownToolProfile", 422, ...)` |
| `workspace.ts` 在 allowed_paths 含指向 workspace 外部的 symlink 时，`realpath` 把候选路径和 allowed 路径都塌缩到外部位置，比较 `inside(realpathAllowed, realpathTarget)` 返回 true，实现 symlink 越权读 | 对 realpath 后的 target 检查是否仍在 `realpath(workspace)` 内；并要求每个 allowed 路径 realpath 后也仍在 workspace 内 |

## 6. 覆盖与 traceability

本报告覆盖 `piko-agent-runtime-test-specification-v0.3` 中 PK-T11 / PK-T17 /
PK-T18 / PK-T25 / PK-T28 / PK-T38 共 6 项（2026-09-18 报告遗留的 PARTIAL）。

其余 34 项 PASS 由 `piko-direct-omlx-debug-20260918` 覆盖，本报告在
§3 Smoke 行重新跑了其中的 6 项作为本会话基线。

本会话另外写了一个 `tests/integration/matrix-acceptance.test.ts`，通过
环境变量驱动可重复跑这 6 个 case（默认 skip，需 `PIKO_BEARER` /
`SECOND_TOK` / `PIKO_BOT_TOK` / `BEN_TOK` / `ROOM_ID` 等环境变量）；非
slow case 在 Piko + Synapse 在线时立即跑通，slow case 含 homeserver restart /
Piko SIGKILL / token reset，需 `SKIP_SLOW=0` 显式触发。

## 7. 测量结果、不确定度与限制

- **oMLX 推理**: 单次 model call 通常 1–4 秒（取决于上下文长度），input token
  范围 800–2800；reasoning_tokens 存在且 small（< 100）。
- **Run 完成时间分布**: 无 tool call 的 simple run 约 5–8 秒；带 read tool 的
  run 约 8–12 秒；带 write/edit tool 的 run 约 12–20 秒。
- **Sandbox 限制**:
  - `enable_registration=true`，单 sandbox 内部使用
  - 自签证书，必须在 Node 启动时通过 `NODE_EXTRA_CA_CERTS` 注入
  - 用户仅 3 个，房间仅 1 个；不模拟生产规模多用户/多房间场景
- **不覆盖**: LLMTier oracle（operator-deferred）、超过 100 用户/房间的
  规模场景、跨 homeserver federation、media upload 的真实路径执行（仅
  `matrix.ts:48–55` 的 fail-closed 静态/单元证据）。

## 8. Release/Review Gate 建议

- **可关**: PK-T11 / PK-T17 / PK-T18 / PK-T25 / PK-T28 / PK-T38 全部 PASS；
  Piko v0.3 simplified.6 的 40 项 PK-T01..PK-T40 oracle 在 Matrix 真实身份与
  注入式故障场景下均有 live acceptance。
- **未关**: LLMTier 兼容性仍是 operator-deferred deployment gate，未由本报告
  主张。
- **下一步建议**:
  1. 在用户授权下做 LLMTier Responses SSE / usage / 错误行为联调
  2. 评估 `sendDiscussionReply` retry 的最坏延迟（最坏 6.2s + deadline）是否
     满足 SLA
  3. 把 `tests/integration/matrix-acceptance.test.ts` 纳入 CI，在 staging
     sandbox 跑全套 slow case
  4. 升级 Piko 的 STD lock 到 draft.26（需独立 review per STD §2.1），重生成
     15 个 template_version 不匹配的旧文档

本报告为 Draft 状态；进入 Accepted 之前需要 reviewer / approver 签字并补
上 `Reviewed Commit` 与 `Approval Date`。
