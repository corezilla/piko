# Piko → OpenCode 开发交接

更新时间：2026-09-19（Asia/Hong_Kong）

## 交接目标

由于 Codex 额度限制，后续 **Piko** 开发转到 OpenCode。迁移的是开发代理/工作流，不是 Piko 运行时架构；Piko 仍基于固定版本 Pi AgentHarness。此前“LLMTier 移到 OpenCode”的说法已由用户更正，**不要据此修改 LLMTier 项目**。

工作目录：`/Users/ben/work/piko`  
Git remote：`https://github.com/corezilla/piko`  
当前分支：`docs/piko-system-design-std26`  
已推送 HEAD：`caa6e0ef9e6eed00c9d8d442beb59efd987223f2`（`feat: implement Piko durable agent runtime`）；本地与远端一致。

## 第一件事：保留当前工作树

已推送的提交含 Piko v0.3 运行时、机器契约、设计修订、Pi 补丁和首批验证。**上一次单元测试扩充还未提交或推送**：

- 已修改：`tests/unit/core.test.ts`、`matrix.test.ts`、`store.test.ts`、`tool-recovery.test.ts`
- 新文件：`tests/unit/config-schema.test.ts`、`server.test.ts`、`worker-runtime.test.ts`
- 新计划与执行记录：`docs/70_verification/plans/piko-unit-test-plan-v0.3.md`

上述测试计划列出 27 个用例，均已自动化。2026-09-19 重新执行 `npm run check`：TypeScript、16 个测试文件/59 项测试、机器契约校验全部通过。接手后先 `git status --short`，不要清理、覆盖或重新生成这些未提交改动；review 后再按用户要求决定是否 commit/push。

另有未跟踪的旧 `HANDOFF.md` 与 `.review-materials/`。前者是 2026-09-17 的设计阶段快照，HEAD 和验证状态已过时；**以本文件和当前工作树为准**。后者是跨项目评审材料，不要未经判断整目录提交或删除。

## 项目边界与权威文件

Piko 是一个实例一个 Agent 的 durable task runtime。Slinky 负责任务组织、业务验收和正式 Memory；一个全局唯一 `task_id` 永久绑定一个不可变逻辑任务及其 Run。外部任务 API 仅有：

1. `POST /runs`
2. `GET /runs/{run_id}`
3. `POST /runs/{run_id}:cancel`
4. `GET /runs/{run_id}/result`

当前机器契约是 `0.3.0-simplified.6`。不要恢复已退出的 capacity/Seat/claim、跨系统 Session release、产品消息/content 服务、自定义模型 Invocation 或平行 Agent loop。Pi 负责 session、context、tool loop、abort 与有界重试；Piko 负责 task/Run 事务、SQLite ledger、执行预算、恢复围栏、Result 封装与 Matrix discussion intake。Memory 更新只输出建议，不直接改 Slinky authority。生产 Runtime Activation 未获本交接授权。

阅读顺序：

1. `README.md`、`docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md`
2. `docs/20_system_design/piko-agent-runtime-design-v0.3.md`
3. `docs/30_subsystem_design/piko-agent-runtime-core-internal-design-v0.3.md`
4. `docs/50_implementation_design/piko-runtime-implementation-design-v0.3.md`
5. `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md`
6. `docs/70_verification/reports/piko-direct-omlx-debug-20260918.md` 与新的单元测试计划

机器接口见 `interfaces/openapi/`、`interfaces/schemas/`、`interfaces/error-codes/`；项目 STD 锁定在 `docs/std.lock.json`，不要顺手升级。

## 代码与运行入口

- `src/main.ts`：加载配置/密钥、provider preflight、Store、Matrix、Pi、Worker、HTTP
- `src/server.ts`：四个 HTTP 操作、鉴权、Schema 与错误映射
- `src/store.ts`：SQLite task/run/result、effect ledger、lease、discussion/cursor
- `src/pi-runtime.ts`：固定 Pi AgentHarness 集成、确定性 operation 与 usage hook
- `src/worker.ts`：单执行槽、取消/deadline、终态 Result
- `src/matrix.ts`：原生 Matrix sync、reply/media、cursor/txn
- `src/tool-recovery.ts`：安全 workspace write/edit 恢复与 fail-closed

本机需要 Node >=22.19；当前已验证 Node 22.22.3、pnpm 11.19.0。常规入口：

```sh
cd /Users/ben/work/piko
npm run check
```

`config/runtime.example.json` 是模板；`config/runtime.json`、`var/` 与密钥都是本机数据，已 gitignore，**不要提交或在日志/交接中粘贴密钥**。服务启动需 `PIKO_API_BEARER`、`PIKO_LLM_API_KEY` 和 `PIKO_CONFIG` 指向本机配置。先按 README 与配置模板确认 endpoint、workspace、模型和密钥，再运行 `npm start`；不应假设当前本机进程仍存活。

### Pi checkout 是不可遗漏的本地依赖

`upstream/pi/` 在本机由 `.git/info/exclude` 忽略，**不在 Piko 提交内**。来源 `https://github.com/earendil-works/pi.git`，固定 commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282`。Piko 的 TS 源码直接引用此目录；新机器需按固定 commit checkout，安装该 checkout 的锁定依赖，并在其根目录应用 `../../patches/pi-v0.85.1-piko.patch`。不要升级 Pi 或替换 adapter 路径。启动时 `src/config.ts` 会检查 commit、补丁 marker 与 manifest SHA；补丁文件可用 `git -C upstream/pi apply --check -R ../../patches/pi-v0.85.1-piko.patch` 检查当前已应用状态。

## 已验证与未关闭的 Gate

正式规格共有 40 项 PK-T01–PK-T40。直连本地 oMLX 的报告状态：**34 PASS、6 PARTIAL、0 NOT_RUN**。本地已做 HTTP、Pi Responses、工具读写、预算、取消、session 隔离、usage、若干 SIGKILL/重启恢复。新单元测试扩充后，当前全套为 59/59 通过；这不等于 40 项全部完成真实外部验收。

仍为 PARTIAL 的六项均需真实 Matrix 测试身份/房间及端到端故障注入：`PK-T11`、`T17`、`T18`、`T25`、`T28`、`T38`。此前用户要求先直连 oMLX 调试、暂不调 LLMTier；因此真实 LLMTier 兼容性是另一个**明确未完成**的部署 Gate。不要把静态/模拟验证写成生产验收。

值得保留的语义：provider-native usage 在 Pi 规范化前采集；缺字段为 `null` 而非 0。不可重放副作用 Unknown 时必须 `UnsafeRetryBlocked`。Discussion intake 状态为 `Open → Closing → Closed`；失败/取消将未消费 turn 标成 `Abandoned`，不能把它们遗留到终态。已发布 Result 不被迟到 usage 改写。

## 建议接续顺序

1. 核对分支、远端、工作树和本文件；review 未提交的 27 项单元测试扩充，不要丢弃。
2. 运行 `npm run check`；若失败，先区分环境缺少 Pi checkout/补丁与真正代码回归。
3. 在用户确认后提交、推送单元测试批次；不要连带提交旧 `HANDOFF.md`、`.review-materials/` 或本机配置。
4. 准备真实 Matrix test identity/room，逐项关闭六个 PARTIAL，并把证据写回验证报告。
5. 在用户重新授权 LLMTier 联调后验证其 Responses SSE/usage/错误行为；最后再讨论部署和 Runtime Activation。

OpenCode 可直接从这句任务开始：**“先读 OPENCODE_HANDOFF.md，核对未提交改动并运行 npm run check；review 单元测试批次，保持 Piko v0.3 simplified.6 边界，不要触碰 LLMTier 项目或生产激活。”**
