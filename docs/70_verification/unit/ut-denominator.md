# UT 分母枚举表（机器权威源）

> 由 `scripts/enumerate-ut-denominator.mjs` 从 `src/`（不含 `*.test.ts`）AST 枚举生成，**不是手写**。
> 重新生成：`node scripts/enumerate-ut-denominator.mjs --md docs/70_verification/unit/ut-denominator.md --json /tmp/ut-denominator.json`
> 口径＝STD `docs/test-standard.md` §4「ISD 受辖函数」＝实现侧函数＋方法全集（含私有成员与访问器）。
> 本表是 UT 分母的**枚举源**：方案 §1.1/§5.2 的符号集与本表对账，差集必须为零；
> 每条 Case 的「维度坐标」必须能指到本表某行的一个分支路径。

**合计**：244 个行为单元 · 参数 432 · 分支点 1217 · throw/reject 136 · 状态写 100 · 资源操作 51 · 返回站点 318

**逐站点义务格（本层分母）**：Σ(参数×必测类 3 ＋ 分支 ＋ throw 站点 ＋ 状态写站点 ＋ 资源操作站点 ＋ 返回站点)

| 模块 | 文件:行 | 符号 | 种类/可见性 | 参数 | 分支 | throw | 状态写 | 资源 | 返回 | 义务旗标 | 格数 |
|---|---|---|---|--:|--:|--:|--:|--:|--:|---|--:|
| BOOT | `config.ts:26` | `validateToolRegistry` | fn/exported | 1 | 25 | 6 | 0 | 0 | 0 | — | 34 |
| BOOT | `config.ts:56` | `gitHead` | fn/exported | 1 | 5 | 1 | 0 | 0 | 3 | async | 12 |
| BOOT | `config.ts:70` | `validated` | fn/exported | 2 | 4 | 1 | 0 | 0 | 1 | async,serial | 12 |
| BOOT | `config.ts:86` | `loadConfig` | fn/exported | 2 | 16 | 3 | 0 | 0 | 1 | async,serial | 26 |
| BOOT | `config.ts:132` | `resolveSecret` | fn/exported | 1 | 4 | 2 | 0 | 0 | 2 | async | 11 |
| BOOT | `durable-fs.ts:20` | `absolute` | method/private | 1 | 1 | 0 | 0 | 0 | 1 | — | 5 |
| BOOT | `durable-fs.ts:21` | `sync` | method/private | 2 | 1 | 0 | 0 | 0 | 0 | async | 7 |
| BOOT | `durable-fs.ts:25` | `exec` | method/public | 3 | 10 | 0 | 1 | 0 | 1 | async,clock | 21 |
| BOOT | `durable-fs.ts:88` | `writeFile` | method/public | 3 | 1 | 0 | 0 | 0 | 1 | async | 11 |
| BOOT | `durable-fs.ts:93` | `appendFile` | method/public | 3 | 1 | 0 | 0 | 0 | 1 | async | 11 |
| BOOT | `durable-fs.ts:98` | `renameFile` | method/public | 3 | 1 | 0 | 0 | 0 | 1 | async | 11 |
| BOOT | `main.ts:16` | `runControlProcess` | fn/exported | 2 | 2 | 0 | 0 | 0 | 1 | async | 9 |
| BOOT | `main.ts:55` | `main` | fn/exported | 2 | 3 | 0 | 0 | 0 | 0 | async | 9 |
| IPC | `ipc.ts:49` | `FactHandler.constructor` | ctor/public | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| IPC | `ipc.ts:50` | `apply` | method/public | 1 | 20 | 0 | 0 | 0 | 18 | concur | 41 |
| IPC | `ipc.ts:117` | `LocalChannel.constructor` | ctor/public | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| IPC | `ipc.ts:118` | `report` | method/public | 1 | 0 | 0 | 0 | 0 | 1 | async | 4 |
| IPC | `ipc.ts:131` | `ProcessChannel.constructor` | ctor/public | 2 | 7 | 0 | 0 | 0 | 1 | db | 14 |
| IPC | `ipc.ts:144` | `report` | method/public | 1 | 0 | 0 | 0 | 0 | 1 | async | 4 |
| IPC | `ipc.ts:154` | `attachChildToHandler` | fn/exported | 3 | 2 | 0 | 0 | 0 | 2 | — | 13 |
| IPC | `supervisor.ts:20` | `ExecutionProcessSupervisor.constructor` | ctor/public | 4 | 0 | 0 | 0 | 0 | 0 | — | 12 |
| IPC | `supervisor.ts:27` | `spawn` | method/public | 0 | 14 | 0 | 7 | 2 | 2 | clock | 25 |
| IPC | `supervisor.ts:55` | `startWatchdog` | method/private | 0 | 5 | 0 | 1 | 1 | 2 | clock | 9 |
| IPC | `supervisor.ts:67` | `send` | method/public | 1 | 1 | 0 | 0 | 0 | 0 | — | 4 |
| IPC | `supervisor.ts:72` | `kill` | method/public | 0 | 1 | 0 | 1 | 0 | 0 | — | 2 |
| IPC | `supervisor.ts:80` | `unhealthy` | method/public | 1 | 1 | 0 | 0 | 0 | 1 | clock | 5 |
| IPC | `supervisor.ts:84` | `alive` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| IPC | `supervisor.ts:88` | `stop` | method/public | 0 | 3 | 0 | 2 | 3 | 1 | async,clock | 9 |
| IPC | `types.ts:233` | `PikoError.constructor` | ctor/public | 3 | 0 | 0 | 0 | 0 | 0 | — | 9 |
| MATRIX | `matrix.ts:14` | `MatrixRuntime.constructor` | ctor/public | 3 | 0 | 0 | 0 | 0 | 0 | — | 9 |
| MATRIX | `matrix.ts:15` | `start` | method/public | 0 | 21 | 1 | 4 | 3 | 3 | async,clock | 32 |
| MATRIX | `matrix.ts:29` | `prepareEvent` | method/private | 1 | 15 | 0 | 0 | 0 | 6 | async | 24 |
| MATRIX | `matrix.ts:48` | `auditMembership` | method/private | 0 | 4 | 0 | 0 | 0 | 0 | async | 4 |
| MATRIX | `matrix.ts:63` | `isJoined` | method/public | 1 | 1 | 0 | 0 | 0 | 2 | async | 6 |
| MATRIX | `matrix.ts:73` | `recordDiscussionAccessLost` | method/public | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| MATRIX | `matrix.ts:79` | `processBatch` | method/private | 2 | 13 | 0 | 0 | 0 | 0 | async | 19 |
| MATRIX | `matrix.ts:91` | `downloadMedia` | method/private | 3 | 29 | 8 | 0 | 0 | 1 | async | 47 |
| MATRIX | `matrix.ts:101` | `verifyDiscussion` | method/public | 2 | 9 | 3 | 0 | 0 | 1 | async | 19 |
| MATRIX | `matrix.ts:107` | `send` | method/public | 4 | 3 | 1 | 0 | 0 | 1 | async | 17 |
| MATRIX | `matrix.ts:113` | `sendDiscussionReply` | method/public | 5 | 2 | 1 | 0 | 3 | 2 | async,serial | 23 |
| MATRIX | `matrix.ts:117` | `close` | method/public | 0 | 1 | 0 | 1 | 0 | 0 | async | 2 |
| MATRIX | `matrix.ts:120` | `isPermanentMatrixError` | fn/exported | 1 | 16 | 0 | 0 | 0 | 5 | — | 24 |
| OBS | `clock.ts:26` | `systemClock.now` | fn/module-private | 0 | 0 | 0 | 0 | 0 | 0 | clock | 0 |
| OBS | `clock.ts:27` | `systemClock.monotonic` | fn/module-private | 0 | 1 | 0 | 0 | 0 | 0 | clock | 1 |
| OBS | `clock.ts:29` | `systemClock.iso` | fn/module-private | 0 | 0 | 0 | 0 | 0 | 0 | — | 0 |
| OBS | `clock.ts:34` | `ManualClock.constructor` | ctor/public | 2 | 0 | 0 | 0 | 0 | 0 | — | 6 |
| OBS | `clock.ts:35` | `now` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| OBS | `clock.ts:38` | `monotonic` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| OBS | `clock.ts:41` | `iso` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| OBS | `clock.ts:44` | `advance` | method/public | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| OBS | `clock.ts:48` | `set` | method/public | 2 | 1 | 0 | 2 | 0 | 0 | — | 9 |
| OBS | `observability.ts:44` | `redact` | fn/exported | 1 | 7 | 0 | 0 | 0 | 1 | — | 11 |
| OBS | `observability.ts:62` | `Observability.constructor` | ctor/public | 2 | 0 | 0 | 0 | 0 | 0 | — | 6 |
| OBS | `observability.ts:67` | `keep` | method/private | 1 | 0 | 0 | 0 | 0 | 1 | — | 4 |
| OBS | `observability.ts:72` | `emit` | method/public | 2 | 10 | 0 | 0 | 0 | 0 | clock,concur | 16 |
| OBS | `observability.ts:90` | `metric` | method/public | 5 | 16 | 0 | 0 | 0 | 1 | db | 32 |
| OBS | `observability.ts:104` | `audit` | method/public | 1 | 3 | 0 | 0 | 0 | 0 | — | 6 |
| OBS | `observability.ts:114` | `snapshot` | method/public | 1 | 1 | 0 | 0 | 0 | 1 | clock | 5 |
| OBS | `observability.ts:127` | `bump` | method/public | 2 | 2 | 0 | 0 | 0 | 0 | db | 8 |
| PI | `graphrag-client.ts:57` | `GraphRAGApiError.constructor` | ctor/public | 4 | 0 | 0 | 1 | 0 | 0 | — | 13 |
| PI | `graphrag-client.ts:93` | `mapStatusToCode` | fn/exported | 1 | 6 | 0 | 0 | 0 | 6 | — | 15 |
| PI | `graphrag-client.ts:109` | `GraphRAGAdapter.constructor` | ctor/public | 3 | 0 | 0 | 0 | 0 | 0 | — | 9 |
| PI | `graphrag-client.ts:130` | `search` | method/public | 2 | 26 | 3 | 0 | 0 | 2 | async,serial | 37 |
| PI | `graphrag-tools.ts:85` | `validateDocSearchContext` | fn/exported | 1 | 8 | 3 | 0 | 0 | 0 | — | 14 |
| PI | `graphrag-tools.ts:109` | `createGraphragSearchTool` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | async,serial | 4 |
| PI | `graphrag-tools.ts:122` | `execute` | method/public | 6 | 3 | 1 | 0 | 0 | 2 | async,serial | 24 |
| PI | `mem0-client.ts:24` | `Mem0ApiError.constructor` | ctor/public | 4 | 0 | 0 | 1 | 0 | 0 | — | 13 |
| PI | `mem0-client.ts:58` | `mapStatusToCode` | fn/exported | 1 | 6 | 0 | 0 | 0 | 6 | — | 15 |
| PI | `mem0-client.ts:73` | `Mem0Adapter.constructor` | ctor/public | 2 | 0 | 0 | 0 | 0 | 0 | — | 6 |
| PI | `mem0-client.ts:88` | `search` | method/public | 3 | 24 | 3 | 0 | 0 | 2 | async,serial | 38 |
| PI | `mem0-client.ts:203` | `add` | method/public | 3 | 18 | 4 | 0 | 0 | 2 | async,serial | 33 |
| PI | `mem0-client.ts:299` | `pollForExtractedMemory` | method/private | 2 | 8 | 0 | 0 | 1 | 2 | async,clock | 17 |
| PI | `pi-runtime.ts:37` | `isProviderUnavailableMessage` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | — | 4 |
| PI | `pi-runtime.ts:42` | `discussionMessage` | fn/exported | 2 | 0 | 0 | 0 | 0 | 1 | — | 7 |
| PI | `pi-runtime.ts:43` | `initialPrompt` | fn/exported | 3 | 1 | 0 | 0 | 0 | 1 | — | 11 |
| PI | `pi-runtime.ts:44` | `normalizeRawUsage` | fn/exported | 1 | 14 | 0 | 0 | 0 | 1 | — | 18 |
| PI | `pi-runtime.ts:55` | `buildSystemPrompt` | fn/exported | 3 | 5 | 0 | 0 | 0 | 2 | — | 16 |
| PI | `pi-runtime.ts:114` | `PiRuntime.constructor` | ctor/public | 8 | 20 | 2 | 5 | 0 | 0 | — | 51 |
| PI | `pi-runtime.ts:150` | `model` | method/private | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| PI | `pi-runtime.ts:155` | `execute` | method/public | 6 | 118 | 5 | 0 | 3 | 15 | async,clock,serial,concur | 159 |
| PI | `pi-runtime.ts:326` | `close` | method/public | 0 | 0 | 0 | 0 | 0 | 0 | async | 0 |
| PI | `provider-preflight.ts:1` | `preflightModelProvider` | fn/exported | 4 | 9 | 2 | 0 | 2 | 0 | async,clock | 25 |
| PI | `skill-prefetch.ts:114` | `cacheKey` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | — | 4 |
| PI | `skill-prefetch.ts:119` | `clearPrefetchCache` | fn/exported | 0 | 0 | 0 | 0 | 0 | 0 | — | 0 |
| PI | `skill-prefetch.ts:124` | `prefetchCacheSize` | fn/exported | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| PI | `skill-prefetch.ts:137` | `prefetchSkillContext` | fn/exported | 5 | 37 | 0 | 0 | 0 | 7 | async,clock,db | 59 |
| PI | `skill-prefetch.ts:229` | `withTimeout` | fn/exported | 2 | 0 | 0 | 0 | 3 | 1 | clock | 10 |
| PI | `skill-prefetch.ts:240` | `renderMemoryEntry` | fn/exported | 1 | 5 | 0 | 0 | 0 | 1 | — | 9 |
| PI | `skill-prefetch.ts:249` | `renderDocEntry` | fn/exported | 1 | 6 | 0 | 0 | 0 | 1 | — | 10 |
| PI | `skill-prefetch.ts:262` | `renderSkillContext` | fn/exported | 1 | 5 | 0 | 0 | 0 | 2 | — | 10 |
| PI | `skill-tools.ts:101` | `validateContext` | fn/exported | 1 | 8 | 3 | 0 | 0 | 0 | — | 14 |
| PI | `skill-tools.ts:123` | `createMem0LookupTool` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | async,serial | 4 |
| PI | `skill-tools.ts:136` | `execute` | method/public | 6 | 3 | 1 | 0 | 0 | 2 | async,serial | 24 |
| PI | `skill-tools.ts:171` | `createMem0RecordTool` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | async,serial | 4 |
| PI | `skill-tools.ts:184` | `execute` | method/public | 6 | 3 | 1 | 0 | 0 | 2 | async,serial | 24 |
| PI | `tool-exec-policy.ts:21` | `ExecPolicyViolationError.constructor` | ctor/public | 3 | 0 | 0 | 1 | 0 | 0 | — | 10 |
| PI | `tool-exec-policy.ts:43` | `splitCommands` | fn/exported | 1 | 12 | 0 | 0 | 0 | 1 | — | 16 |
| PI | `tool-exec-policy.ts:99` | `tokenize` | fn/exported | 1 | 12 | 0 | 0 | 0 | 1 | — | 16 |
| PI | `tool-exec-policy.ts:143` | `parseExecutable` | fn/exported | 1 | 10 | 0 | 0 | 0 | 2 | — | 15 |
| PI | `tool-exec-policy.ts:176` | `parseExecutables` | fn/exported | 1 | 4 | 0 | 0 | 0 | 1 | — | 8 |
| PI | `tool-exec-policy.ts:193` | `assertExecutablesAllowed` | fn/exported | 2 | 5 | 1 | 0 | 0 | 1 | — | 13 |
| PI | `tool-exec-policy.ts:213` | `assertRemoteExecutableAllowed` | fn/exported | 2 | 7 | 1 | 0 | 0 | 2 | — | 16 |
| PI | `tool-exec-policy.ts:229` | `stripQuotes` | fn/exported | 1 | 5 | 0 | 0 | 0 | 2 | — | 10 |
| PI | `tool-host-policy.ts:29` | `PolicyViolationError.constructor` | ctor/public | 3 | 0 | 0 | 1 | 0 | 0 | — | 10 |
| PI | `tool-host-policy.ts:48` | `currentAllowlist` | fn/exported | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| PI | `tool-host-policy.ts:52` | `enterNetworkScope` | fn/exported | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| PI | `tool-host-policy.ts:56` | `exitNetworkScope` | fn/exported | 0 | 0 | 0 | 0 | 0 | 0 | — | 0 |
| PI | `tool-host-policy.ts:74` | `makePolicyFetch` | fn/exported | 1 | 6 | 2 | 0 | 0 | 2 | — | 13 |
| PI | `tool-host-policy.ts:109` | `installNetworkPolicy` | fn/exported | 0 | 1 | 0 | 0 | 0 | 2 | — | 3 |
| PI | `tool-host-policy.ts:121` | `restoreNetworkPolicy` | fn/exported | 0 | 1 | 0 | 0 | 0 | 0 | — | 1 |
| POLICY | `policy.ts:8` | `Policy.constructor` | ctor/public | 2 | 0 | 0 | 0 | 0 | 0 | — | 6 |
| POLICY | `policy.ts:14` | `canonicalize` | method/private | 1 | 5 | 3 | 0 | 0 | 1 | — | 12 |
| POLICY | `policy.ts:24` | `resolveWorkspace` | method/private | 1 | 3 | 1 | 0 | 0 | 1 | — | 8 |
| POLICY | `policy.ts:31` | `validate` | method/public | 2 | 10 | 2 | 0 | 0 | 1 | — | 19 |
| POLICY | `policy.ts:55` | `validateResult` | method/public | 1 | 5 | 2 | 0 | 0 | 0 | — | 10 |
| POLICY | `policy.ts:65` | `within` | fn/exported | 3 | 5 | 0 | 0 | 0 | 1 | — | 15 |
| POLICY | `task-equality.ts:3` | `normalizedTask` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | — | 4 |
| POLICY | `task-equality.ts:4` | `sameTask` | fn/exported | 2 | 0 | 0 | 0 | 0 | 1 | serial | 7 |
| POLICY | `workspace.ts:9` | `resolveWorkspace` | fn/exported | 2 | 2 | 1 | 0 | 0 | 1 | async | 10 |
| POLICY | `workspace.ts:14` | `realpathNearestAncestor` | fn/exported | 1 | 3 | 1 | 0 | 0 | 1 | async | 8 |
| POLICY | `workspace.ts:18` | `authorizePath` | fn/exported | 4 | 12 | 4 | 0 | 0 | 1 | async | 29 |
| POLICY | `workspace.ts:32` | `collectOutputs` | fn/exported | 2 | 4 | 0 | 0 | 3 | 1 | async,serial | 14 |
| POLICY | `workspace.ts:41` | `ensureTaskDirs` | fn/exported | 2 | 6 | 0 | 0 | 0 | 0 | async | 12 |
| REPO | `store.ts:44` | `TaskStore.constructor` | ctor/public | 2 | 1 | 0 | 2 | 1 | 0 | db | 10 |
| REPO | `store.ts:52` | `close` | method/public | 0 | 0 | 0 | 0 | 0 | 0 | db | 0 |
| REPO | `store.ts:56` | `migrate` | method/private | 0 | 0 | 0 | 2 | 0 | 0 | db | 2 |
| REPO | `store.ts:170` | `tx` | method/private | 1 | 1 | 1 | 3 | 0 | 1 | db | 9 |
| REPO | `store.ts:183` | `createOrGet` | method/public | 4 | 10 | 0 | 3 | 0 | 6 | clock,serial,db,concur | 31 |
| REPO | `store.ts:225` | `getTask` | method/public | 1 | 2 | 1 | 0 | 0 | 1 | serial,db | 7 |
| REPO | `store.ts:232` | `mutateRun` | method/public | 1 | 9 | 4 | 1 | 0 | 2 | db,concur | 19 |
| REPO | `store.ts:255` | `getRun` | method/public | 1 | 9 | 2 | 0 | 0 | 1 | clock,serial,db | 15 |
| REPO | `store.ts:288` | `setInputStaging` | method/public | 2 | 1 | 1 | 1 | 0 | 0 | serial,db | 9 |
| REPO | `store.ts:295` | `setArtifactDelivery` | method/public | 2 | 1 | 1 | 1 | 0 | 0 | serial,db | 9 |
| REPO | `store.ts:299` | `inputStaging` | method/public | 1 | 0 | 0 | 0 | 0 | 1 | serial,db | 4 |
| REPO | `store.ts:304` | `tryClaimSlot` | method/public | 2 | 3 | 0 | 4 | 0 | 4 | db,concur | 17 |
| REPO | `store.ts:336` | `failAccessLostTasks` | method/public | 0 | 4 | 0 | 4 | 3 | 2 | serial,db,concur | 13 |
| REPO | `store.ts:385` | `recoverOrphaned` | method/public | 2 | 5 | 0 | 3 | 0 | 4 | db,concur | 18 |
| REPO | `store.ts:403` | `readSlot` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | db | 1 |
| REPO | `store.ts:406` | `renewSlot` | method/public | 2 | 0 | 0 | 1 | 0 | 1 | db,concur | 8 |
| REPO | `store.ts:410` | `releaseSlot` | method/public | 2 | 0 | 0 | 1 | 0 | 1 | db,concur | 8 |
| REPO | `store.ts:416` | `scanNonTerminal` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | db | 1 |
| REPO | `store.ts:421` | `nextNeedingStaging` | method/public | 0 | 2 | 0 | 0 | 0 | 1 | db | 3 |
| REPO | `store.ts:431` | `reserveModel` | method/public | 4 | 1 | 0 | 2 | 0 | 3 | db | 18 |
| REPO | `store.ts:442` | `observeUsage` | method/public | 5 | 0 | 0 | 1 | 0 | 0 | serial,db | 16 |
| REPO | `store.ts:449` | `terminalModel` | method/public | 5 | 1 | 0 | 1 | 0 | 0 | db | 17 |
| REPO | `store.ts:456` | `reserveTool` | method/public | 7 | 3 | 0 | 3 | 0 | 4 | db | 31 |
| REPO | `store.ts:483` | `terminalTool` | method/public | 4 | 1 | 0 | 1 | 0 | 0 | db | 14 |
| REPO | `store.ts:489` | `markTurn` | method/public | 5 | 2 | 0 | 1 | 0 | 0 | db | 18 |
| REPO | `store.ts:494` | `pendingTurns` | method/public | 1 | 0 | 0 | 0 | 0 | 1 | db | 4 |
| REPO | `store.ts:497` | `markDiscussionAccessLost` | method/public | 1 | 3 | 0 | 1 | 0 | 4 | serial,db | 11 |
| REPO | `store.ts:516` | `discussionAccessLost` | method/public | 1 | 2 | 0 | 0 | 0 | 1 | db | 6 |
| REPO | `store.ts:519` | `recordProviderCall` | method/public | 6 | 0 | 0 | 1 | 0 | 0 | db | 19 |
| REPO | `store.ts:524` | `recordMatrixEvent` | method/public | 4 | 1 | 0 | 1 | 0 | 1 | db | 15 |
| REPO | `store.ts:528` | `ingestMatrixEvent` | method/public | 5 | 6 | 0 | 2 | 0 | 3 | db | 26 |
| REPO | `store.ts:544` | `hasMatrixEvent` | method/public | 2 | 2 | 0 | 0 | 0 | 1 | db | 9 |
| REPO | `store.ts:547` | `ingestMatrixBatch` | method/public | 2 | 7 | 0 | 3 | 0 | 2 | db | 18 |
| REPO | `store.ts:567` | `discussionRoomsInUse` | method/public | 0 | 4 | 0 | 0 | 0 | 3 | serial,db | 7 |
| REPO | `store.ts:583` | `openDiscussionRuns` | method/public | 1 | 2 | 0 | 0 | 0 | 3 | serial,db | 8 |
| REPO | `store.ts:596` | `matrixCursor` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | db | 1 |
| REPO | `store.ts:599` | `setMatrixCursor` | method/public | 1 | 0 | 0 | 1 | 0 | 0 | db | 4 |
| REPO | `store.ts:602` | `prepareMatrixSend` | method/public | 4 | 2 | 1 | 1 | 0 | 3 | db | 19 |
| REPO | `store.ts:613` | `finishMatrixSend` | method/public | 2 | 0 | 0 | 1 | 0 | 0 | db | 7 |
| REPO | `store.ts:616` | `unknownMatrixSend` | method/public | 1 | 0 | 0 | 1 | 0 | 0 | db | 4 |
| REPO | `store.ts:619` | `tryCloseIntake` | method/public | 2 | 5 | 0 | 1 | 0 | 6 | db,concur | 18 |
| REPO | `store.ts:634` | `cancel` | method/public | 1 | 2 | 0 | 3 | 0 | 4 | db | 12 |
| REPO | `store.ts:667` | `cancelRequested` | method/public | 1 | 3 | 0 | 0 | 0 | 1 | db | 7 |
| REPO | `store.ts:670` | `generation` | method/public | 1 | 0 | 0 | 0 | 0 | 1 | db | 4 |
| REPO | `store.ts:674` | `usageSoFar` | method/private | 1 | 8 | 0 | 0 | 0 | 2 | serial,db | 13 |
| REPO | `store.ts:692` | `rawUsage` | method/public | 1 | 6 | 0 | 0 | 0 | 3 | serial,db | 12 |
| REPO | `store.ts:711` | `knownActions` | method/public | 1 | 8 | 0 | 0 | 0 | 1 | db | 12 |
| REPO | `store.ts:737` | `insertResult` | method/private | 1 | 0 | 0 | 1 | 3 | 0 | serial,db | 7 |
| REPO | `store.ts:745` | `publishResult` | method/public | 2 | 2 | 1 | 1 | 0 | 0 | db,concur | 10 |
| REPO | `store.ts:755` | `finish` | method/public | 2 | 9 | 2 | 3 | 0 | 0 | db,concur | 20 |
| REPO | `store.ts:780` | `finishQueued` | method/public | 1 | 5 | 1 | 2 | 0 | 1 | db | 12 |
| REPO | `store.ts:795` | `result` | method/public | 1 | 3 | 2 | 0 | 0 | 1 | serial,db | 9 |
| REPO | `store.ts:804` | `purge` | method/public | 1 | 6 | 0 | 4 | 0 | 2 | serial,db | 15 |
| REPO | `store.ts:832` | `purgeExpired` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| REPO | `store.ts:855` | `asReader` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | — | 4 |
| SCHED | `scheduler.ts:10` | `Scheduler.constructor` | ctor/public | 2 | 0 | 0 | 0 | 0 | 0 | — | 6 |
| SCHED | `scheduler.ts:15` | `acquire` | method/public | 1 | 1 | 0 | 0 | 0 | 1 | — | 5 |
| SCHED | `scheduler.ts:21` | `recover` | method/public | 1 | 0 | 0 | 0 | 0 | 1 | — | 4 |
| SCHED | `scheduler.ts:25` | `renew` | method/public | 2 | 0 | 0 | 0 | 0 | 1 | concur | 7 |
| SCHED | `scheduler.ts:29` | `release` | method/public | 2 | 0 | 0 | 0 | 0 | 1 | concur | 7 |
| SCHED | `scheduler.ts:33` | `read` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| SCHED | `scheduler.ts:37` | `identity` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| SCHED | `scheduler.ts:41` | `close` | method/public | 0 | 1 | 0 | 1 | 1 | 0 | — | 3 |
| TAPI | `auth.ts:3` | `BearerAuth.constructor` | ctor/public | 2 | 0 | 0 | 0 | 0 | 0 | — | 6 |
| TAPI | `auth.ts:3` | `authenticate` | method/public | 1 | 6 | 2 | 0 | 0 | 1 | — | 12 |
| TAPI | `server.ts:12` | `body` | fn/exported | 2 | 3 | 2 | 0 | 0 | 1 | async,serial | 12 |
| TAPI | `server.ts:27` | `send` | fn/exported | 4 | 0 | 0 | 0 | 0 | 0 | serial | 12 |
| TAPI | `server.ts:40` | `ApiServer.constructor` | ctor/public | 5 | 0 | 0 | 1 | 0 | 0 | — | 16 |
| TAPI | `server.ts:49` | `create` | method/public | 5 | 4 | 1 | 0 | 0 | 1 | async,serial | 21 |
| TAPI | `server.ts:62` | `route` | method/private | 2 | 26 | 6 | 0 | 0 | 5 | async,concur | 43 |
| TAPI | `server.ts:110` | `listen` | method/public | 0 | 0 | 0 | 0 | 0 | 0 | async | 0 |
| TAPI | `server.ts:119` | `close` | method/public | 0 | 1 | 0 | 0 | 0 | 0 | async | 1 |
| TAPI | `server.ts:140` | `mapError` | fn/exported | 1 | 3 | 0 | 0 | 0 | 2 | concur | 8 |
| TRANSFER | `remote-exec-tools.ts:99` | `splitRemoteCommand` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | — | 4 |
| TRANSFER | `remote-exec-tools.ts:106` | `createRemoteBashTool` | fn/exported | 1 | 0 | 0 | 0 | 0 | 1 | async,clock,serial | 4 |
| TRANSFER | `remote-exec-tools.ts:114` | `execute` | method/public | 6 | 8 | 0 | 0 | 0 | 2 | async,clock,serial | 28 |
| TRANSFER | `remote-exec.ts:92` | `execRemote` | fn/exported | 4 | 39 | 2 | 0 | 1 | 4 | async,clock | 58 |
| TRANSFER | `remote-exec.ts:208` | `truncate` | fn/exported | 1 | 1 | 0 | 0 | 0 | 1 | — | 5 |
| TRANSFER | `transfer.ts:15` | `run` | fn/exported | 3 | 2 | 0 | 0 | 1 | 1 | async,clock | 13 |
| TRANSFER | `transfer.ts:25` | `safeJoinIn` | fn/exported | 2 | 2 | 1 | 0 | 0 | 1 | — | 10 |
| TRANSFER | `transfer.ts:31` | `safeJoin` | fn/exported | 3 | 2 | 1 | 0 | 0 | 1 | — | 13 |
| TRANSFER | `transfer.ts:42` | `Transfer.constructor` | ctor/public | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| TRANSFER | `transfer.ts:53` | `scpKeyPath` | method/private | 0 | 7 | 1 | 2 | 2 | 3 | async | 15 |
| TRANSFER | `transfer.ts:75` | `close` | method/public | 0 | 1 | 0 | 2 | 1 | 0 | — | 4 |
| TRANSFER | `transfer.ts:83` | `stagingRoot` | accessor/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| TRANSFER | `transfer.ts:87` | `assertAllowed` | method/private | 1 | 3 | 1 | 0 | 0 | 0 | — | 7 |
| TRANSFER | `transfer.ts:94` | `scpArgs` | method/private | 3 | 3 | 0 | 0 | 0 | 1 | async | 13 |
| TRANSFER | `transfer.ts:112` | `sshBaseArgs` | method/private | 1 | 6 | 2 | 0 | 0 | 1 | async | 12 |
| TRANSFER | `transfer.ts:145` | `sshCommandArgs` | method/public | 2 | 0 | 0 | 0 | 0 | 1 | async | 7 |
| TRANSFER | `transfer.ts:151` | `withRetry` | method/private | 1 | 4 | 1 | 0 | 1 | 1 | async,clock | 10 |
| TRANSFER | `transfer.ts:166` | `fetchInputs` | method/public | 3 | 15 | 3 | 0 | 3 | 2 | async | 32 |
| TRANSFER | `transfer.ts:198` | `deliverArtifacts` | method/public | 5 | 14 | 1 | 0 | 1 | 2 | async,serial | 33 |
| TRANSFER | `transfer.ts:225` | `clearStaging` | method/public | 1 | 1 | 0 | 0 | 1 | 0 | — | 5 |
| USAGE | `semantic.ts:3` | `validateUsage` | fn/exported | 1 | 24 | 8 | 0 | 0 | 0 | — | 35 |
| USAGE | `semantic.ts:14` | `emptyUsage` | fn/exported | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| WORKER | `exec-process.ts:17` | `runExecutionProcess` | fn/exported | 2 | 16 | 0 | 0 | 2 | 1 | async,clock | 25 |
| WORKER | `execution-facts.ts:53` | `record` | method/public | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| WORKER | `execution-facts.ts:58` | `list` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| WORKER | `execution-facts.ts:63` | `last` | method/public | 0 | 0 | 0 | 0 | 0 | 1 | — | 1 |
| WORKER | `execution-facts.ts:67` | `clear` | method/public | 0 | 0 | 0 | 1 | 0 | 0 | — | 1 |
| WORKER | `execution-facts.ts:78` | `statusFromErrorCode` | fn/exported | 1 | 5 | 0 | 0 | 0 | 4 | clock | 12 |
| WORKER | `test-evidence.ts:42` | `buildRawResultRef` | fn/exported | 1 | 3 | 0 | 0 | 0 | 1 | — | 7 |
| WORKER | `test-evidence.ts:65` | `isExecutionFailure` | fn/exported | 1 | 1 | 0 | 0 | 0 | 1 | — | 5 |
| WORKER | `tool-recovery.ts:31` | `fileState` | fn/exported | 3 | 7 | 3 | 0 | 0 | 2 | async,serial | 21 |
| WORKER | `tool-recovery.ts:43` | `isPlan` | fn/exported | 1 | 7 | 0 | 0 | 0 | 2 | — | 12 |
| WORKER | `tool-recovery.ts:49` | `executeRecoverable` | fn/exported | 7 | 16 | 5 | 0 | 0 | 2 | async,serial | 44 |
| WORKER | `tool-recovery.ts:91` | `applyToolRecoveryPolicy` | fn/exported | 3 | 16 | 2 | 0 | 0 | 9 | async | 36 |
| WORKER | `worker.ts:28` | `RunWorker.constructor` | ctor/public | 7 | 0 | 0 | 0 | 0 | 0 | — | 21 |
| WORKER | `worker.ts:39` | `report` | method/private | 1 | 2 | 1 | 0 | 0 | 1 | async | 7 |
| WORKER | `worker.ts:47` | `requestAbort` | method/public | 1 | 0 | 0 | 0 | 0 | 0 | — | 3 |
| WORKER | `worker.ts:50` | `isAborted` | method/private | 1 | 1 | 0 | 0 | 0 | 1 | — | 5 |
| WORKER | `worker.ts:54` | `start` | method/public | 0 | 0 | 0 | 1 | 0 | 0 | — | 1 |
| WORKER | `worker.ts:58` | `loop` | method/private | 0 | 6 | 0 | 1 | 1 | 0 | async,clock,db,concur | 8 |
| WORKER | `worker.ts:78` | `claimNext` | method/private | 0 | 3 | 0 | 0 | 0 | 3 | async,concur | 6 |
| WORKER | `worker.ts:87` | `stageInputs` | method/private | 1 | 7 | 0 | 0 | 2 | 2 | async,clock | 14 |
| WORKER | `worker.ts:125` | `reportPreconditionFailure` | method/private | 2 | 0 | 0 | 0 | 0 | 0 | async | 6 |
| WORKER | `worker.ts:143` | `run` | method/private | 2 | 46 | 1 | 0 | 2 | 0 | async,clock,concur | 55 |
| WORKER | `worker.ts:282` | `close` | method/public | 0 | 0 | 0 | 1 | 0 | 0 | async | 1 |
| WORKER | `worker.ts:288` | `buildStats` | fn/exported | 2 | 2 | 0 | 0 | 0 | 1 | — | 9 |
| WORKER | `worker.ts:299` | `aggregateUsage` | fn/exported | 2 | 12 | 0 | 0 | 0 | 2 | — | 20 |
| WORKER | `worker.ts:320` | `sendDiscussionReplyWithRetry` | fn/exported | 6 | 14 | 2 | 0 | 1 | 1 | async,clock | 36 |

**公式格数合计：3118**（这是 UT 层的义务格总数；已登记 Case 数与本表对账即为覆盖率）。

---

## 逐函数分支路径明细

每行＝该函数的一个分支路径；Case 的维度坐标必须指到这里。

### `validateToolRegistry` — `config.ts:26`（BOOT，fn/exported，参数 1）

参数：`tools: ToolRegistry`

| 行 | 类型 | 条件 |
|--:|---|---|
| 37 | loop | `loop (Object.values(tools.recovery_contracts))` |
| 38 | if | `if (!supported.has(c.implementation_ref))` |
| 38 | ! | `!supported.has(c.implementation_ref)` |
| 40 | loop | `loop (Object.values(tools.profiles))` |
| 41 | loop | `loop (Object.entries(p.tools))` |
| 42 | if | `if (!knownTools.has(name))` |
| 42 | ! | `!knownTools.has(name)` |
| 43 | ternary | `? t.recovery_contract_ref :` |
| 44 | if | `if (t.recovery_contract_ref && !contract)` |
| 44 | && | `t.recovery_contract_ref && !contract` |
| 44 | ! | `!contract` |
| 45 | if | `if (t.replay === "safe" && t.effect !== "read_only" && !contract)` |
| 45 | && | `t.replay === "safe" && t.effect !== "read_only" && !contract` |
| 45 | && | `t.replay === "safe" && t.effect !== "read_only"` |
| 45 | ! | `!contract` |
| 46 | if | `if (contract?.implementation_ref === "builtin:workspace-atomic-write" && (!…)` |
| 46 | && | `contract?.implementation_ref === "builtin:workspace-atomic-…` |
| 46 | ?. | `contract?.implementation_ref` |
| 46 | || | `!["write", "edit"].includes(name) \|\| t.effect !== "workspac…` |
| 46 | ! | `!["write", "edit"].includes(name)` |
| 49 | if | `if (contract?.implementation_ref !== "builtin:workspace-atomic-write" && t.…)` |
| 49 | && | `contract?.implementation_ref !== "builtin:workspace-atomic-…` |
| 49 | && | `contract?.implementation_ref !== "builtin:workspace-atomic-…` |
| 49 | ?. | `contract?.implementation_ref` |
| 50 | ?. | `contract?.implementation_ref` |

### `gitHead` — `config.ts:56`（BOOT，fn/exported，参数 1）

参数：`repo: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 58 | if | `if (!head.startsWith("ref: "))` |
| 58 | ! | `!head.startsWith("ref: ")` |
| 62 | catch | `catch (`${repo}/.git/packed-refs`, "utf8")` |
| 65 | if | `if (!line)` |
| 65 | ! | `!line` |

### `validated` — `config.ts:70`（BOOT，fn/exported，参数 2）

参数：`value: unknown` · `schemaPath: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 72 | ?? | `(Ajv as any).default ?? Ajv` |
| 73 | ?? | `(addFormats as any).default ?? addFormats` |
| 76 | if | `if (!ajv.validate(schema, value))` |
| 76 | ! | `!ajv.validate(schema, value)` |

### `loadConfig` — `config.ts:86`（BOOT，fn/exported，参数 2）

参数：`path: string` · `root: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 97 | if | `if ((await gitHead(piRoot)) !== config.pi.commit)` |
| 100 | if | `if (!harness.includes("onRawUsage"))` |
| 100 | ! | `!harness.includes("onRawUsage")` |
| 108 | if | `if (typeof process.env.PIKO_MATRIX_USER_ID === "string" && process.env.PIKO…)` |
| 108 | && | `typeof process.env.PIKO_MATRIX_USER_ID === "string" && proc…` |
| 111 | if | `if (typeof process.env.PIKO_MATRIX_ACCESS_TOKEN === "string" && process.env…)` |
| 111 | && | `typeof process.env.PIKO_MATRIX_ACCESS_TOKEN === "string" &&…` |
| 114 | if | `if (typeof process.env.PIKO_MATRIX_HOMESERVER === "string" && process.env.P…)` |
| 114 | && | `typeof process.env.PIKO_MATRIX_HOMESERVER === "string" && p…` |
| 117 | if | `if (typeof process.env.PIKO_MATRIX_ENABLED === "string")` |
| 120 | if | `if (Object.keys(envOverrides).length > 0)` |
| 125 | if | `if (config.matrix.enabled && !config.matrix.direct_access_token && !config.…)` |
| 125 | && | `config.matrix.enabled && !config.matrix.direct_access_token…` |
| 125 | && | `config.matrix.enabled && !config.matrix.direct_access_token` |
| 125 | ! | `!config.matrix.direct_access_token` |
| 125 | ! | `!config.matrix.access_token_secret_ref` |

### `resolveSecret` — `config.ts:132`（BOOT，fn/exported，参数 1）

参数：`ref: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 135 | if | `if (kind === "env")` |
| 137 | if | `if (!v)` |
| 137 | ! | `!v` |
| 140 | if | `if (kind === "file")` |

### `absolute` — `durable-fs.ts:20`（BOOT，method/private，参数 1）

参数：`path: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 20 | ternary | `? isAbsolute(path) :` |

### `sync` — `durable-fs.ts:21`（BOOT，method/private，参数 2）

参数：`path: string` · `directory: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 22 | ternary | `? directory :` |

### `exec` — `durable-fs.ts:25`（BOOT，method/public，参数 3）

参数：`command: string` · `options: ShellExecOptions | undefined` · `context: Context`

| 行 | 类型 | 条件 |
|--:|---|---|
| 39 | ?. | `options?.onUpdate` |
| 40 | ternary | `? options :` |
| 44 | if | `if (update.kind === "replace")` |
| 47 | else | `if (update.kind === "append") { capture…` |
| 46 | ?. | `update.output.truncation?.truncated` |
| 47 | if | `if (update.kind === "append")` |
| 59 | if | `if (result.ok)` |
| 72 | else | `{ this.executionFacts.record({ tool_cal…` |
| 66 | || | `capturedTruncated \|\| Boolean(result.value.truncation?.trunc…` |
| 66 | ?. | `result.value.truncation?.truncated` |

### `writeFile` — `durable-fs.ts:88`（BOOT，method/public，参数 3）

参数：`path: string` · `content: string|Uint8Array` · `context: Context`

| 行 | 类型 | 条件 |
|--:|---|---|
| 90 | if | `if (result.ok)` |

### `appendFile` — `durable-fs.ts:93`（BOOT，method/public，参数 3）

参数：`path: string` · `content: string|Uint8Array` · `context: Context`

| 行 | 类型 | 条件 |
|--:|---|---|
| 95 | if | `if (result.ok)` |

### `renameFile` — `durable-fs.ts:98`（BOOT，method/public，参数 3）

参数：`source: string` · `destination: string` · `context: Context`

| 行 | 类型 | 条件 |
|--:|---|---|
| 100 | if | `if (result.ok)` |

### `runControlProcess` — `main.ts:16`（BOOT，fn/exported，参数 2）

参数：`configPath: string` · `root: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 37 | if | `if (outcome === "StopRequested")` |
| 44 | if | `if (closing)` |

### `main` — `main.ts:55`（BOOT，fn/exported，参数 2）

参数：`argv: inferred?` · `env: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 56 | ?? | `argv[2] ?? env.PIKO_CONFIG ?? "config/runtime.json"` |
| 56 | ?? | `argv[2] ?? env.PIKO_CONFIG` |
| 57 | ?? | `import.meta.dirname ?? "."` |

### `apply` — `ipc.ts:50`（IPC，method/public，参数 1）

参数：`fact: Fact`

| 行 | 类型 | 条件 |
|--:|---|---|
| 53 | case | `case "staging"` |
| 56 | case | `case "delivery"` |
| 59 | case | `case "turn"` |
| 62 | case | `case "reserveModel"` |
| 64 | case | `case "observeUsage"` |
| 67 | case | `case "terminalModel"` |
| 70 | case | `case "reserveTool"` |
| 72 | case | `case "terminalTool"` |
| 75 | case | `case "providerCall"` |
| 78 | case | `case "closeIntake"` |
| 80 | case | `case "publishResult"` |
| 83 | case | `case "finish"` |
| 86 | case | `case "preconditionFailure"` |
| 89 | case | `case "stagingClaim"` |
| 91 | ternary | `? task_id :` |
| 93 | case | `case "claim"` |
| 98 | if | `if (grant === "slot_busy")` |
| 101 | default | `default` |
| 104 | catch | `catch (error)` |
| 105 | ternary | `? error instanceof Error :` |

### `ProcessChannel.constructor` — `ipc.ts:131`（IPC，ctor/public，参数 2）

参数：`send: (msg: unknown) => void` · `onCommand: (cmd: Command) => void?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 133 | if | `if (msg?.ipc === "outcome" && typeof msg.id === "number")` |
| 133 | && | `msg?.ipc === "outcome" && typeof msg.id === "number"` |
| 133 | ?. | `msg?.ipc` |
| 135 | if | `if (resolve)` |
| 141 | if | `if (msg?.ipc === "command" && onCommand)` |
| 141 | && | `msg?.ipc === "command" && onCommand` |
| 141 | ?. | `msg?.ipc` |

### `attachChildToHandler` — `ipc.ts:154`（IPC，fn/exported，参数 3）

参数：`child: { on: Function; send?: Function }?` · `handler: FactHandler` · `onCommand: (cmd: Command) => void?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 157 | if | `if (msg?.ipc === "fact")` |
| 157 | ?. | `msg?.ipc` |

### `spawn` — `supervisor.ts:27`（IPC，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 28 | if | `if (this.stopped)` |
| 32 | if | `if (this.facts)` |
| 36 | if | `if (msg?.type === "heartbeat" \|\| msg?.fact?.kind === "heartbeat")` |
| 36 | || | `msg?.type === "heartbeat" \|\| msg?.fact?.kind === "heartbeat"` |
| 36 | ?. | `msg?.type` |
| 36 | ?. | `msg?.fact?.kind` |
| 36 | ?. | `msg?.fact` |
| 40 | if | `if (msg?.type === "ready" \|\| msg?.fact?.kind === "ready")` |
| 40 | || | `msg?.type === "ready" \|\| msg?.fact?.kind === "ready"` |
| 40 | ?. | `msg?.type` |
| 40 | ?. | `msg?.fact?.kind` |
| 40 | ?. | `msg?.fact` |
| 45 | if | `if (!this.stopped)` |
| 45 | ! | `!this.stopped` |

### `startWatchdog` — `supervisor.ts:55`（IPC，method/private，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 56 | if | `if (this.watchdog)` |
| 58 | if | `if (this.stopped \|\| !this.child)` |
| 58 | || | `this.stopped \|\| !this.child` |
| 58 | ! | `!this.child` |
| 59 | if | `if (this.unhealthy())` |

### `send` — `supervisor.ts:67`（IPC，method/public，参数 1）

参数：`cmd: Command`

| 行 | 类型 | 条件 |
|--:|---|---|
| 68 | ?. | `this.channel?.send` |

### `kill` — `supervisor.ts:72`（IPC，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 73 | if | `if (this.child)` |

### `unhealthy` — `supervisor.ts:80`（IPC，method/public，参数 1）

参数：`windowMs: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 81 | && | `this.child !== null && this.clock.now() - this.lastHeartbea…` |

### `stop` — `supervisor.ts:88`（IPC，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 90 | if | `if (this.watchdog)` |
| 92 | if | `if (!this.child)` |
| 92 | ! | `!this.child` |

### `start` — `matrix.ts:15`（MATRIX，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 16 | if | `if (!this.config.matrix.enabled)` |
| 16 | ! | `!this.config.matrix.enabled` |
| 18 | if | `if (who.user_id!==this.config.matrix.user_id)` |
| 19 | if | `if (cursor)` |
| 22 | if | `if (state!=="PREPARED"&&state!=="SYNCING")` |
| 22 | && | `state!=="PREPARED"&&state!=="SYNCING"` |
| 22 | ?. | `this.client?.getSyncStateData()?.nextSyncToken` |
| 22 | ?. | `this.client?.getSyncStateData` |
| 22 | if | `if (!next)` |
| 22 | ! | `!next` |
| 22 | if | `if (!readySettled)` |
| 22 | ! | `!readySettled` |
| 22 | if | `if (!readySettled\|\|permanent)` |
| 22 | || | `!readySettled\|\|permanent` |
| 22 | ! | `!readySettled` |
| 22 | ?. | `this.client?.stopClient` |
| 22 | if | `if (!readySettled)` |
| 22 | ! | `!readySettled` |
| 23 | ?? | `this.config.matrix.sync_timeout_ms??30000` |
| 26 | if | `if (!readySettled)` |
| 26 | ! | `!readySettled` |

### `prepareEvent` — `matrix.ts:29`（MATRIX，method/private，参数 1）

参数：`event: MatrixEvent`

| 行 | 类型 | 条件 |
|--:|---|---|
| 30 | if | `if (event.getType()!=="m.room.message")` |
| 31 | if | `if (!room\|\|!id)` |
| 31 | || | `!room\|\|!id` |
| 31 | ! | `!room` |
| 31 | ! | `!id` |
| 32 | ?? | `event.getSender()??""` |
| 32 | ?. | `event.getUnsigned()?.transaction_id` |
| 33 | if | `if (sender===this.config.matrix.user_id)` |
| 34 | if | `if (typeof content.msgtype!=="string"\|\|!["m.text","m.file","m.image","m.aud…)` |
| 34 | || | `typeof content.msgtype!=="string"\|\|!["m.text","m.file","m.i…` |
| 34 | || | `typeof content.msgtype!=="string"\|\|!["m.text","m.file","m.i…` |
| 34 | ! | `!["m.text","m.file","m.image","m.audio","m.video"].includes(…` |
| 35 | if | `if (this.store.hasMatrixEvent(room,id))` |
| 36 | loop | `loop (this.store.openDiscussionRuns(room))` |
| 38 | if | `if (content.msgtype!=="m.text")` |

### `auditMembership` — `matrix.ts:48`（MATRIX，method/private，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 51 | loop | `loop (this.store.discussionRoomsInUse())` |
| 52 | if | `if (!joined.has(room))` |
| 52 | ! | `!joined.has(room)` |
| 57 | catch | `catch ()` |

### `isJoined` — `matrix.ts:63`（MATRIX，method/public，参数 1）

参数：`room: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 67 | catch | `catch ()` |

### `processBatch` — `matrix.ts:79`（MATRIX，method/private，参数 2）

参数：`events: MatrixEvent[]` · `cursor: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 80 | && | `!!room&&this.store.openDiscussionRuns(room).length>0` |
| 80 | ! | `!!room` |
| 80 | ! | `!room` |
| 86 | if | `if (rooms.size)` |
| 86 | loop | `loop (rooms)` |
| 86 | if | `if (!joined.has(room))` |
| 86 | ! | `!joined.has(room)` |
| 88 | loop | `loop (events)` |
| 88 | if | `if (!room\|\|!allowed.has(room))` |
| 88 | || | `!room\|\|!allowed.has(room)` |
| 88 | ! | `!room` |
| 88 | ! | `!allowed.has(room)` |
| 88 | if | `if (item)` |

### `downloadMedia` — `matrix.ts:91`（MATRIX，method/private，参数 3）

参数：`run: string` · `event: string` · `content: any`

| 行 | 类型 | 条件 |
|--:|---|---|
| 92 | if | `if (!this.client\|\|typeof content.url!=="string"\|\|!content.url.startsWith("m…)` |
| 92 | || | `!this.client\|\|typeof content.url!=="string"\|\|!content.url.s…` |
| 92 | || | `!this.client\|\|typeof content.url!=="string"` |
| 92 | ! | `!this.client` |
| 92 | ! | `!content.url.startsWith("mxc://")` |
| 93 | ?. | `content.info?.size` |
| 93 | if | `if (typeof declaredSize!=="number"\|\|declaredSize<0\|\|declaredSize>(this.conf…)` |
| 93 | || | `typeof declaredSize!=="number"\|\|declaredSize<0\|\|declaredSiz…` |
| 93 | || | `typeof declaredSize!=="number"\|\|declaredSize<0` |
| 93 | ?? | `this.config.matrix.max_media_bytes??0` |
| 94 | ?. | `content.info?.mimetype` |
| 94 | if | `if (typeof declaredMime!=="string"\|\|!this.config.matrix.allowed_mime_types?…)` |
| 94 | || | `typeof declaredMime!=="string"\|\|!this.config.matrix.allowed…` |
| 94 | ! | `!this.config.matrix.allowed_mime_types?.includes(declaredMim…` |
| 94 | ?. | `this.config.matrix.allowed_mime_types?.includes` |
| 95 | if | `if (!url)` |
| 95 | ! | `!url` |
| 96 | if | `if (!response.ok\|\|!response.body)` |
| 96 | || | `!response.ok\|\|!response.body` |
| 96 | ! | `!response.ok` |
| 96 | ! | `!response.body` |
| 97 | ?. | `response.headers.get("content-type")?.split` |
| 97 | if | `if (actualMime!==declaredMime)` |
| 98 | loop | `loop ()` |
| 98 | if | `if (x.done)` |
| 98 | if | `if (size>(this.config.matrix.max_media_bytes??0))` |
| 98 | ?? | `this.config.matrix.max_media_bytes??0` |
| 98 | if | `if (size!==declaredSize)` |
| 99 | || | `basename(content.body).replace(/[^A-Za-z0-9._-]/g,"_")\|\|"at…` |

### `verifyDiscussion` — `matrix.ts:101`（MATRIX，method/public，参数 2）

参数：`room: string` · `event: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 102 | if | `if (!this.client\|\|!this.started)` |
| 102 | || | `!this.client\|\|!this.started` |
| 102 | ! | `!this.client` |
| 102 | ! | `!this.started` |
| 103 | if | `if (!joined.includes(room))` |
| 103 | ! | `!joined.includes(room)` |
| 104 | if | `if (e.room_id!==room)` |
| 105 | ternary | `? typeof e.content?.body==="string" :` |
| 105 | ?. | `e.content?.body` |

### `send` — `matrix.ts:107`（MATRIX，method/public，参数 4）

参数：`room: string` · `txnId: string` · `body: string` · `replyTo: string?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 108 | if | `if (!this.client)` |
| 108 | ! | `!this.client` |
| 110 | if | `if (replyTo)` |

### `sendDiscussionReply` — `matrix.ts:113`（MATRIX，method/public，参数 5）

参数：`run: string` · `room: string` · `event: string` · `turn: number` · `body: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 114 | if | `if (prepared.state==="Sent")` |
| 115 | catch | `catch (error)` |

### `close` — `matrix.ts:117`（MATRIX，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 117 | if | `if (this.client)` |

### `isPermanentMatrixError` — `matrix.ts:120`（MATRIX，fn/exported，参数 1）

参数：`error: unknown`

| 行 | 类型 | 条件 |
|--:|---|---|
| 121 | if | `if (!error\|\|typeof error!=="object")` |
| 121 | || | `!error\|\|typeof error!=="object"` |
| 121 | ! | `!error` |
| 123 | ?? | `e.errcode??e.data?.errcode` |
| 123 | ?. | `e.data?.errcode` |
| 124 | if | `if (code==="M_UNKNOWN_TOKEN"\|\|code==="M_FORBIDDEN"\|\|code==="M_UNKNOWN_ROOM"…)` |
| 124 | || | `code==="M_UNKNOWN_TOKEN"\|\|code==="M_FORBIDDEN"\|\|code==="M_U…` |
| 124 | || | `code==="M_UNKNOWN_TOKEN"\|\|code==="M_FORBIDDEN"\|\|code==="M_U…` |
| 124 | || | `code==="M_UNKNOWN_TOKEN"\|\|code==="M_FORBIDDEN"` |
| 125 | if | `if (typeof e.httpStatus==="number"&&e.httpStatus>=400&&e.httpStatus<500&&e.…)` |
| 125 | && | `typeof e.httpStatus==="number"&&e.httpStatus>=400&&e.httpSt…` |
| 125 | && | `typeof e.httpStatus==="number"&&e.httpStatus>=400&&e.httpSt…` |
| 125 | && | `typeof e.httpStatus==="number"&&e.httpStatus>=400&&e.httpSt…` |
| 125 | && | `typeof e.httpStatus==="number"&&e.httpStatus>=400` |
| 126 | ?? | `e.message??""` |
| 127 | if | `if (/credential identity mismatch\|no longer joined/i.test(msg))` |

### `systemClock.monotonic` — `clock.ts:27`（OBS，fn/module-private，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 28 | ternary | `? typeof performance !== "undefined" :` |

### `set` — `clock.ts:48`（OBS，method/public，参数 2）

参数：`wallIso: string` · `monoMs: number?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 50 | if | `if (monoMs !== undefined)` |

### `redact` — `observability.ts:44`（OBS，fn/exported，参数 1）

参数：`fields: Record<string, unknown> | undefined`

| 行 | 类型 | 条件 |
|--:|---|---|
| 46 | loop | `loop (Object.entries(fields ?? {}))` |
| 46 | ?? | `fields ?? {}` |
| 47 | if | `if (FORBIDDEN_KEYS.test(k))` |
| 51 | ternary | `? typeof v === "string" \|\| typeof v === "number" \|\|… :` |
| 51 | || | `typeof v === "string" \|\| typeof v === "number" \|\| typeof v …` |
| 51 | || | `typeof v === "string" \|\| typeof v === "number"` |
| 51 | ternary | `? v === null :` |

### `emit` — `observability.ts:72`（OBS，method/public，参数 2）

参数：`name: string` · `fields: Record<string, unknown>?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 78 | ternary | `? fields?.task_id :` |
| 78 | ?. | `fields?.task_id` |
| 79 | ternary | `? typeof fields?.generation === "number" :` |
| 79 | ?. | `fields?.generation` |
| 80 | ternary | `? typeof fields?.epoch === "number" :` |
| 80 | ?. | `fields?.epoch` |
| 81 | ternary | `? fields?.redacted_error_class :` |
| 81 | ?. | `fields?.redacted_error_class` |
| 84 | if | `if (this.events.length > 500)` |
| 85 | catch | `catch ()` |

### `metric` — `observability.ts:90`（OBS，method/public，参数 5）

参数：`id: string` · `op: MetricOp` · `value: number?` · `labels: Record<string, string>?` · `unit: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 92 | if | `if (this.config.observability?.metrics_enabled === false)` |
| 92 | ?. | `this.config.observability?.metrics_enabled` |
| 93 | ternary | `? labels && Object.keys(labels).length :` |
| 93 | && | `labels && Object.keys(labels).length` |
| 96 | ternary | `? op === "inc" :` |
| 96 | ?? | `cur?.value ?? 0` |
| 96 | ?. | `cur?.value` |
| 96 | ?? | `value ?? 1` |
| 96 | ternary | `? op === "set" :` |
| 96 | ?? | `value ?? 0` |
| 96 | ?? | `cur?.value ?? Number.POSITIVE_INFINITY` |
| 96 | ?. | `cur?.value` |
| 96 | ?? | `value ?? 0` |
| 97 | ?? | `METRIC_UNITS[unit] ?? unit` |
| 97 | ternary | `? labels :` |
| 98 | catch | `catch ()` |

### `audit` — `observability.ts:104`（OBS，method/public，参数 1）

参数：`record: AuditRecord`

| 行 | 类型 | 条件 |
|--:|---|---|
| 106 | ?? | `record.task_id ?? null` |
| 107 | if | `if (this.auditTrail.length > 200)` |
| 108 | catch | `catch ()` |

### `snapshot` — `observability.ts:114`（OBS，method/public，参数 1）

参数：`limit: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 116 | loop | `loop (this.counters)` |

### `bump` — `observability.ts:127`（OBS，method/public，参数 2）

参数：`counter: string` · `delta: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 129 | ?? | `this.counters.get(counter) ?? 0` |
| 130 | catch | `catch ()` |

### `mapStatusToCode` — `graphrag-client.ts:93`（PI，fn/exported，参数 1）

参数：`status: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 94 | if | `if (status === 401)` |
| 95 | if | `if (status === 403)` |
| 96 | if | `if (status === 404)` |
| 97 | if | `if (status === 429)` |
| 98 | if | `if (status >= 500 && status < 600)` |
| 98 | && | `status >= 500 && status < 600` |

### `search` — `graphrag-client.ts:130`（PI，method/public，参数 2）

参数：`query: string` · `options: GraphRAGSearchOptions?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 134 | if | `if (!query \|\| query.trim() === "")` |
| 134 | || | `!query \|\| query.trim() === ""` |
| 134 | ! | `!query` |
| 140 | ?? | `options?.scope ?? this.defaultScope ?? "all"` |
| 140 | ?? | `options?.scope ?? this.defaultScope` |
| 140 | ?. | `options?.scope` |
| 147 | ?? | `options?.max_results ?? 5` |
| 147 | ?. | `options?.max_results` |
| 156 | ?? | `options?.filters ?? {}` |
| 156 | ?. | `options?.filters` |
| 157 | if | `if (filterEntries.length > 0)` |
| 176 | catch | `catch (err)` |
| 180 | if | `if (response.ok)` |
| 194 | ?? | `data.hits?.hits ?? []` |
| 194 | ?. | `data.hits?.hits` |
| 196 | ?? | `h._source ?? {}` |
| 198 | ?? | `h._id ?? ""` |
| 199 | ?? | `src.content ?? ""` |
| 200 | ternary | `? typeof h._score === "number" :` |
| 201 | ?? | `src.metadata ?? {}` |
| 202 | ?? | `src.created_at ?? ""` |
| 214 | if | `if (errBody.error?.reason)` |
| 215 | else | `if (errBody.message) errMessage = errBo…` |
| 214 | ?. | `errBody.error?.reason` |
| 215 | if | `if (errBody.message)` |
| 216 | catch | `catch ()` |

### `validateDocSearchContext` — `graphrag-tools.ts:85`（PI，fn/exported，参数 1）

参数：`context: DocSearchToolContext`

| 行 | 类型 | 条件 |
|--:|---|---|
| 86 | if | `if (!context.role \|\| context.role.trim() === "")` |
| 86 | || | `!context.role \|\| context.role.trim() === ""` |
| 86 | ! | `!context.role` |
| 89 | if | `if (!context.projectName \|\| context.projectName.trim() === "")` |
| 89 | || | `!context.projectName \|\| context.projectName.trim() === ""` |
| 89 | ! | `!context.projectName` |
| 92 | if | `if (!/^[A-Za-z0-9._-]+$/.test(context.projectName))` |
| 92 | ! | `!/^[A-Za-z0-9._-]+$/.test(context.projectName)` |

### `execute` — `graphrag-tools.ts:122`（PI，method/public，参数 6）

参数：`_toolCallId: inferred` · `params: inferred` · `_onUpdate: inferred` · `_toolContext: inferred` · `_invocation: inferred` · `_context: inferred`

| 行 | 类型 | 条件 |
|--:|---|---|
| 123 | ?? | `params.scope ?? "all"` |
| 133 | catch | `catch (e)` |
| 134 | if | `if (e instanceof GraphRAGApiError)` |

### `mapStatusToCode` — `mem0-client.ts:58`（PI，fn/exported，参数 1）

参数：`status: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 59 | if | `if (status === 401)` |
| 60 | if | `if (status === 403)` |
| 61 | if | `if (status === 404)` |
| 62 | if | `if (status === 429)` |
| 63 | if | `if (status >= 500 && status < 600)` |
| 63 | && | `status >= 500 && status < 600` |

### `search` — `mem0-client.ts:88`（PI，method/public，参数 3）

参数：`query: string` · `user_id: string` · `options: Mem0SearchOptions?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 94 | if | `if (!user_id \|\| user_id.trim() === "")` |
| 94 | || | `!user_id \|\| user_id.trim() === ""` |
| 94 | ! | `!user_id` |
| 99 | ?? | `options?.max_results ?? 5` |
| 99 | ?. | `options?.max_results` |
| 109 | ?? | `options?.filters ?? {}` |
| 109 | ?. | `options?.filters` |
| 111 | if | `if (translatedFilters["metadata.tags"] !== undefined)` |
| 116 | loop | `loop (Object.entries(translatedFilters))` |
| 117 | if | `if (k.startsWith("metadata.") && k !== "metadata.tags")` |
| 117 | && | `k.startsWith("metadata.") && k !== "metadata.tags"` |
| 119 | ?? | `translatedFilters.metadata ?? {}` |
| 146 | catch | `catch (err)` |
| 151 | if | `if (response.ok)` |
| 162 | ?? | `data.results ?? []` |
| 167 | ?? | `r.metadata ?? {}` |
| 168 | if | `if (r.categories && r.categories.length > 0)` |
| 168 | && | `r.categories && r.categories.length > 0` |
| 172 | ?? | `r.id ?? ""` |
| 173 | ?? | `r.memory ?? ""` |
| 174 | ternary | `? typeof r.score === "number" :` |
| 176 | ?? | `r.created_at ?? ""` |
| 186 | if | `if (errBody.message)` |
| 187 | catch | `catch ()` |

### `add` — `mem0-client.ts:203`（PI，method/public，参数 3）

参数：`messages: Array<{ role: "user" | "assistant"; content: string }>` · `user_id: string` · `metadata: Record<string, any>?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 209 | if | `if (!user_id \|\| user_id.trim() === "")` |
| 209 | || | `!user_id \|\| user_id.trim() === ""` |
| 209 | ! | `!user_id` |
| 214 | if | `if (!Array.isArray(messages) \|\| messages.length === 0)` |
| 214 | || | `!Array.isArray(messages) \|\| messages.length === 0` |
| 214 | ! | `!Array.isArray(messages)` |
| 223 | ?. | `(metadata as { tags?: string[] } \| undefined)?.tags` |
| 229 | if | `if (tags && tags.length > 0)` |
| 229 | && | `tags && tags.length > 0` |
| 249 | catch | `catch (err)` |
| 262 | if | `if (response.ok)` |
| 267 | ?? | `data.event_id ?? ""` |
| 268 | if | `if (eventId)` |
| 271 | ?? | `messages[0]?.content ?? ""` |
| 271 | ?. | `messages[0]?.content` |
| 273 | ?? | `memoryId ?? eventId` |
| 283 | if | `if (errBody.message)` |
| 284 | catch | `catch ()` |

### `pollForExtractedMemory` — `mem0-client.ts:299`（PI，method/private，参数 2）

参数：`user_id: string` · `query: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 304 | loop | `loop (Date.now() < deadline)` |
| 306 | || | `query \|\| " "` |
| 307 | if | `if (hits.length > 0)` |
| 312 | ?? | `b.created_at ?? ""` |
| 312 | ?? | `a.created_at ?? ""` |
| 314 | if | `if (sorted[0]?.id)` |
| 314 | ?. | `sorted[0]?.id` |
| 316 | catch | `catch ()` |

### `initialPrompt` — `pi-runtime.ts:43`（PI，fn/exported，参数 3）

参数：`task: TaskRequest` · `turn: DiscussionTurn?` · `timestamp: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 43 | ternary | `? turn :` |

### `normalizeRawUsage` — `pi-runtime.ts:44`（PI，fn/exported，参数 1）

参数：`value: unknown`

| 行 | 类型 | 条件 |
|--:|---|---|
| 44 | ?. | `raw?.input_tokens_details` |
| 44 | ?. | `raw?.output_tokens_details` |
| 44 | ternary | `? typeof raw?.input_tokens==="number" :` |
| 44 | ?. | `raw?.input_tokens` |
| 44 | ternary | `? typeof raw?.output_tokens==="number" :` |
| 44 | ?. | `raw?.output_tokens` |
| 44 | ternary | `? typeof raw?.total_tokens==="number" :` |
| 44 | ?. | `raw?.total_tokens` |
| 44 | ternary | `? typeof input?.cached_tokens==="number" :` |
| 44 | ?. | `input?.cached_tokens` |
| 44 | ternary | `? typeof input?.cache_write_tokens==="number" :` |
| 44 | ?. | `input?.cache_write_tokens` |
| 44 | ternary | `? typeof output?.reasoning_tokens==="number" :` |
| 44 | ?. | `output?.reasoning_tokens` |

### `buildSystemPrompt` — `pi-runtime.ts:55`（PI，fn/exported，参数 3）

参数：`task: TaskRequest` · `identity: {role:string;name:string;memory?:MemoryConfig;doc_search?:Do?` · `skillContext: PrefetchedSkillContext?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 61 | if | `if (!identity)` |
| 61 | ! | `!identity` |
| 71 | if | `if (skillContext)` |
| 73 | if | `if (identity.memory)` |
| 85 | if | `if (identity.doc_search)` |

### `PiRuntime.constructor` — `pi-runtime.ts:114`（PI，ctor/public，参数 8）

参数：`config: RuntimeConfig` · `registry: ToolRegistry` · `store: TaskStore` · `channel: Channel` · `apiKey: string` · `mem0ApiKey: string?` · `graphragApiKey: string?` · `transfer: Transfer?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 118 | if | `if (config.identity?.memory && mem0ApiKey)` |
| 121 | else | `if (config.identity?.memory && !mem0Api…` |
| 118 | && | `config.identity?.memory && mem0ApiKey` |
| 118 | ?. | `config.identity?.memory` |
| 119 | ?? | `config.identity.memory.base_url ?? "https://api.mem0.ai"` |
| 121 | if | `if (config.identity?.memory && !mem0ApiKey)` |
| 124 | else | `{ this.mem0Adapter = undefined; }` |
| 121 | && | `config.identity?.memory && !mem0ApiKey` |
| 121 | ?. | `config.identity?.memory` |
| 121 | ! | `!mem0ApiKey` |
| 129 | if | `if (config.identity?.doc_search && graphragApiKey)` |
| 135 | else | `if (config.identity?.doc_search && !gra…` |
| 129 | && | `config.identity?.doc_search && graphragApiKey` |
| 129 | ?. | `config.identity?.doc_search` |
| 135 | if | `if (config.identity?.doc_search && !graphragApiKey)` |
| 138 | else | `{ this.graphragAdapter = undefined; }` |
| 135 | && | `config.identity?.doc_search && !graphragApiKey` |
| 135 | ?. | `config.identity?.doc_search` |
| 135 | ! | `!graphragApiKey` |
| 142 | ?? | `Object.values(config.workspace.roots)[0]??process.cwd()` |

### `execute` — `pi-runtime.ts:155`（PI，method/public，参数 6）

参数：`runId: string` · `epoch: number` · `task: TaskRequest` · `workspace: string` · `isCancelled: ()=>boolean` · `onDiscussionReply: (event:string,turn:number,body:string)=>Promise<void>?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 158 | ternary | `? existing :` |
| 160 | if | `if (!profile)` |
| 160 | ! | `!profile` |
| 164 | if | `if (this.config.identity?.memory && this.mem0Adapter)` |
| 164 | && | `this.config.identity?.memory && this.mem0Adapter` |
| 164 | ?. | `this.config.identity?.memory` |
| 177 | if | `if (this.config.identity?.doc_search && this.graphragAdapter)` |
| 177 | && | `this.config.identity?.doc_search && this.graphragAdapter` |
| 177 | ?. | `this.config.identity?.doc_search` |
| 189 | if | `if (skillDeps)` |
| 193 | if | `if (docSearchDeps)` |
| 201 | if | `if (this.transfer&&remotePolicy)` |
| 201 | && | `this.transfer&&remotePolicy` |
| 205 | ?? | `remotePolicy.permissions?.remote_hosts??[]` |
| 205 | ?. | `remotePolicy.permissions?.remote_hosts` |
| 206 | ?? | `remotePolicy.permissions?.executables??[]` |
| 206 | ?. | `remotePolicy.permissions?.executables` |
| 212 | && | `available[name]&&applyToolRecoveryPolicy(available[name],po…` |
| 214 | ternary | `? this.config.identity :` |
| 223 | ternary | `? identity :` |
| 224 | ?? | `this.config.identity?.doc_search?.default_scope??""` |
| 224 | ?. | `this.config.identity?.doc_search?.default_scope` |
| 224 | ?. | `this.config.identity?.doc_search` |
| 232 | if | `if (active)` |
| 240 | ?? | `process.env.PIKO_PROVIDER_DEBUG_FILE??`${this.config.pi.ses…` |
| 241 | if | `if (!providerDebug)` |
| 241 | ! | `!providerDebug` |
| 241 | catch | `catch ()` |
| 243 | if | `if (providerDebug)` |
| 243 | ?? | `payload??null` |
| 245 | if | `if (active)` |
| 247 | ?? | `ev.headers?.["x-request-id"]??ev.headers?.["X-Request-ID"]?…` |
| 247 | ?? | `ev.headers?.["x-request-id"]??ev.headers?.["X-Request-ID"]` |
| 248 | ternary | `? payloadSentAt :` |
| 249 | ternary | `? latestUsage?.source==="injected" :` |
| 249 | ?. | `latestUsage?.source` |
| 249 | ?? | `ev.runId??runId` |
| 249 | ?? | `ev.status??null` |
| 249 | catch | `catch ()` |
| 250 | ?? | `ev.runId??runId` |
| 250 | ?? | `ev.status??null` |
| 255 | if | `if (!policy)` |
| 255 | ! | `!policy` |
| 256 | ternary | `? typeof event.args.path==="string" :` |
| 257 | if | `if (path)` |
| 258 | || | `event.toolName==="write"\|\|event.toolName==="edit"` |
| 259 | && | `!write&&(rel===""\|\|(!rel.startsWith(`..${sep}`)&&rel!==".."…` |
| 259 | ! | `!write` |
| 259 | || | `rel===""\|\|(!rel.startsWith(`..${sep}`)&&rel!==".."&&!rel.st…` |
| 259 | && | `!rel.startsWith(`..${sep}`)&&rel!==".."&&!rel.startsWith(se…` |
| 259 | && | `!rel.startsWith(`..${sep}`)&&rel!==".."` |
| 259 | ! | `!rel.startsWith(`..${sep}`)` |
| 259 | ! | `!rel.startsWith(sep)` |
| 260 | if | `if (!stagedRead)` |
| 260 | ! | `!stagedRead` |
| 260 | ternary | `? write :` |
| 260 | catch | `catch (error)` |
| 260 | ternary | `? error instanceof Error :` |
| 266 | ?? | `policy.permissions?.executables??[]` |
| 266 | ?. | `policy.permissions?.executables` |
| 267 | if | `if (execAllowlist.length>0)` |
| 268 | ternary | `? typeof event.args.command==="string" :` |
| 269 | if | `if (command!==undefined)` |
| 269 | catch | `catch (error)` |
| 269 | ternary | `? error instanceof Error :` |
| 272 | if | `if (admission==="UnsafeRetryBlocked")` |
| 275 | && | `event.isError&&event.result.content.some((x:any)=>x.type===…` |
| 275 | && | `x.type==="text"&&typeof x.text==="string"&&x.text.includes(…` |
| 275 | && | `x.type==="text"&&typeof x.text==="string"` |
| 275 | if | `if (recovered&&interrupted)` |
| 275 | && | `recovered&&interrupted` |
| 278 | if | `if (queuedTurn)` |
| 279 | ?? | `queuedTurn.pi_operation_id??`${runId}:turn:${queuedTurn.tur…` |
| 280 | if | `if (operation?.operationId===turnOperation)` |
| 281 | else | `if(!operation){ const result=await lane…` |
| 280 | ?. | `operation?.operationId` |
| 281 | if | `if (!operation)` |
| 281 | ! | `!operation` |
| 283 | if | `if (result)` |
| 284 | else | `{const prompt=queuedTurn.turn_seq===1&&…` |
| 284 | ternary | `? queuedTurn.turn_seq===1&&turnOperation===`${runId… :` |
| 284 | && | `queuedTurn.turn_seq===1&&turnOperation===`${runId}:initial`` |
| 284 | if | `if (!accepted.ok)` |
| 284 | ! | `!accepted.ok` |
| 287 | if | `if (!operation)` |
| 287 | ! | `!operation` |
| 289 | if | `if (prior)` |
| 290 | else | `{const initialTurn=task.discussion?this…` |
| 290 | ternary | `? task.discussion :` |
| 290 | if | `if (initialTurn)` |
| 290 | if | `if (!accepted.ok)` |
| 290 | ! | `!accepted.ok` |
| 292 | if | `if (isCancelled())` |
| 294 | loop | `loop ()` |
| 296 | if | `if (!outcome)` |
| 296 | ! | `!outcome` |
| 296 | if | `if (!driven.ok)` |
| 296 | ! | `!driven.ok` |
| 296 | if | `if (driven.value.kind==="waiting")` |
| 297 | if | `if (activeTurn)` |
| 297 | if | `if (outcome.status==="completed"&&onDiscussionReply)` |
| 297 | && | `outcome.status==="completed"&&onDiscussionReply` |
| 301 | if | `if (toolFailure)` |
| 302 | if | `if (unsafeRetry)` |
| 303 | if | `if (outcome.status==="completed")` |
| 304 | if | `if (task.discussion)` |
| 306 | if | `if (pending.length)` |
| 310 | if | `if (!accepted.ok)` |
| 310 | ! | `!accepted.ok` |
| 315 | if | `if (!(await this.channel.report({kind:"closeIntake",task_id:runId,lease_epo…)` |
| 315 | ! | `!(await this.channel.report({kind:"closeIntake",task_id:runI…` |
| 319 | if | `if (outcome.status==="aborted")` |
| 320 | ?? | `outcome.error?.message??`Pi operation ${outcome.status}.`` |
| 320 | ?. | `outcome.error?.message` |
| 321 | || | `outcome.error?.code==="model_unavailable"\|\|isProviderUnavai…` |
| 321 | ?. | `outcome.error?.code` |
| 322 | ternary | `? unavailable :` |
| 322 | ternary | `? unavailable :` |

### `preflightModelProvider` — `provider-preflight.ts:1`（PI，fn/exported，参数 4）

参数：`base: string` · `key: string` · `timeout: number` · `model: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 4 | ternary | `? base.endsWith("/") :` |
| 5 | if | `if (!response.ok)` |
| 5 | ! | `!response.ok` |
| 7 | if | `if (!Array.isArray(payload?.data)\|\|!payload.data.some((item:any)=>item?.id=…)` |
| 7 | || | `!Array.isArray(payload?.data)\|\|!payload.data.some((item:any…` |
| 7 | ! | `!Array.isArray(payload?.data)` |
| 7 | ?. | `payload?.data` |
| 7 | ! | `!payload.data.some((item:any)=>item?.id===model)` |
| 7 | ?. | `item?.id` |

### `prefetchSkillContext` — `skill-prefetch.ts:137`（PI，fn/exported，参数 5）

参数：`query: string` · `identity: PrefetchIdentity | undefined` · `mem0: Mem0Adapter | undefined` · `graphrag: GraphRAGAdapter | undefined` · `opts: PrefetchOptions?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 145 | ?? | `opts.timeoutMs ?? DEFAULT_PREFETCH_TIMEOUT_MS` |
| 146 | ?? | `opts.maxResults ?? DEFAULT_PREFETCH_MAX_RESULTS` |
| 147 | ?? | `opts.minInstructionLength ?? 20` |
| 159 | if | `if (opts.disabled)` |
| 160 | if | `if (opts.kind === "no_skill")` |
| 161 | if | `if (!query \|\| query.trim().length < minLength)` |
| 161 | || | `!query \|\| query.trim().length < minLength` |
| 161 | ! | `!query` |
| 162 | if | `if (!identity)` |
| 162 | ! | `!identity` |
| 163 | if | `if (!mem0 && !graphrag)` |
| 163 | && | `!mem0 && !graphrag` |
| 163 | ! | `!mem0` |
| 163 | ! | `!graphrag` |
| 169 | if | `if (!opts.noCache)` |
| 169 | ! | `!opts.noCache` |
| 171 | if | `if (hit && hit.query === capped)` |
| 171 | && | `hit && hit.query === capped` |
| 182 | ternary | `? mem0 :` |
| 183 | ternary | `? graphrag :` |
| 188 | ternary | `? memoryOutcome.status === "fulfilled" :` |
| 189 | ternary | `? docsOutcome.status === "fulfilled" :` |
| 197 | ternary | `? !mem0 :` |
| 197 | ! | `!mem0` |
| 197 | ternary | `? memoryOutcome.status === "fulfilled" :` |
| 197 | ternary | `? memory.length > 0 :` |
| 198 | ternary | `? !graphrag :` |
| 198 | ! | `!graphrag` |
| 198 | ternary | `? docsOutcome.status === "fulfilled" :` |
| 198 | ternary | `? docs.length > 0 :` |
| 208 | && | `configured.length > 0 && configured.every((s) => s === "una…` |
| 209 | if | `if (!opts.noCache && !allFailed)` |
| 209 | && | `!opts.noCache && !allFailed` |
| 209 | ! | `!opts.noCache` |
| 209 | ! | `!allFailed` |
| 212 | loop | `loop (cache.size > CACHE_LIMIT)` |
| 214 | if | `if (oldest === undefined)` |

### `renderMemoryEntry` — `skill-prefetch.ts:240`（PI，fn/exported，参数 1）

参数：`entry: Mem0SearchResult`

| 行 | 类型 | 条件 |
|--:|---|---|
| 241 | ?? | `entry.memory ?? ""` |
| 242 | ternary | `? entry.created_at :` |
| 243 | ternary | `? Array.isArray(entry.metadata?.tags) :` |
| 243 | ?. | `entry.metadata?.tags` |
| 245 | ternary | `? suffix :` |

### `renderDocEntry` — `skill-prefetch.ts:249`（PI，fn/exported，参数 1）

参数：`entry: GraphRAGSearchResult`

| 行 | 类型 | 条件 |
|--:|---|---|
| 250 | ?? | `entry.content ?? ""` |
| 251 | ?? | `entry.metadata?.source ?? entry.metadata?.path ?? entry.id` |
| 251 | ?? | `entry.metadata?.source ?? entry.metadata?.path` |
| 251 | ?. | `entry.metadata?.source` |
| 251 | ?. | `entry.metadata?.path` |
| 252 | ternary | `? source :` |

### `renderSkillContext` — `skill-prefetch.ts:262`（PI，fn/exported，参数 1）

参数：`context: PrefetchedSkillContext`

| 行 | 类型 | 条件 |
|--:|---|---|
| 265 | if | `if (context.skipped)` |
| 271 | ternary | `? context.memory.length > 0 :` |
| 273 | ternary | `? context.sources.memory === "unavailable" :` |
| 275 | ternary | `? context.docs.length > 0 :` |
| 277 | ternary | `? context.sources.docs === "unavailable" :` |

### `validateContext` — `skill-tools.ts:101`（PI，fn/exported，参数 1）

参数：`context: SkillToolContext`

| 行 | 类型 | 条件 |
|--:|---|---|
| 102 | if | `if (!context.role \|\| context.role.trim() === "")` |
| 102 | || | `!context.role \|\| context.role.trim() === ""` |
| 102 | ! | `!context.role` |
| 105 | if | `if (!context.projectName \|\| context.projectName.trim() === "")` |
| 105 | || | `!context.projectName \|\| context.projectName.trim() === ""` |
| 105 | ! | `!context.projectName` |
| 108 | if | `if (!/^[A-Za-z0-9._-]+$/.test(context.projectName))` |
| 108 | ! | `!/^[A-Za-z0-9._-]+$/.test(context.projectName)` |

### `execute` — `skill-tools.ts:136`（PI，method/public，参数 6）

参数：`_toolCallId: inferred` · `params: inferred` · `_onUpdate: inferred` · `_toolContext: inferred` · `_invocation: inferred` · `_context: inferred`

| 行 | 类型 | 条件 |
|--:|---|---|
| 142 | ?? | `params.max_results ?? 5` |
| 148 | catch | `catch (e)` |
| 149 | if | `if (e instanceof Mem0ApiError)` |

### `execute` — `skill-tools.ts:184`（PI，method/public，参数 6）

参数：`_toolCallId: inferred` · `params: inferred` · `_onUpdate: inferred` · `_toolContext: inferred` · `_invocation: inferred` · `_context: inferred`

| 行 | 类型 | 条件 |
|--:|---|---|
| 194 | ?? | `params.tags ?? []` |
| 207 | catch | `catch (e)` |
| 208 | if | `if (e instanceof Mem0ApiError)` |

### `splitCommands` — `tool-exec-policy.ts:43`（PI，fn/exported，参数 1）

参数：`command: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 49 | loop | `loop (command)` |
| 50 | if | `if (escaped)` |
| 55 | if | `if (char === "\\" && quote !== "'")` |
| 55 | && | `char === "\\" && quote !== "'"` |
| 60 | if | `if (quote)` |
| 62 | if | `if (char === quote)` |
| 65 | if | `if (char === '"' \|\| char === "'")` |
| 65 | || | `char === '"' \|\| char === "'"` |
| 70 | if | `if (char === ";" \|\| char === "\|" \|\| char === "&" \|\| char === "\n")` |
| 70 | || | `char === ";" \|\| char === "\|" \|\| char === "&" \|\| char === "\…` |
| 70 | || | `char === ";" \|\| char === "\|" \|\| char === "&"` |
| 70 | || | `char === ";" \|\| char === "\|"` |

### `tokenize` — `tool-exec-policy.ts:99`（PI，fn/exported，参数 1）

参数：`segment: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 105 | loop | `loop (segment)` |
| 106 | if | `if (escaped)` |
| 111 | if | `if (char === "\\" && quote !== "'")` |
| 111 | && | `char === "\\" && quote !== "'"` |
| 115 | if | `if (quote)` |
| 116 | if | `if (char === quote)` |
| 121 | else | `{ current += char; }` |
| 126 | if | `if (char === '"' \|\| char === "'")` |
| 126 | || | `char === '"' \|\| char === "'"` |
| 130 | if | `if (/\s/.test(char))` |
| 131 | if | `if (current.length > 0)` |
| 139 | if | `if (current.length > 0)` |

### `parseExecutable` — `tool-exec-policy.ts:143`（PI，fn/exported，参数 1）

参数：`segment: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 147 | loop | `loop (tokens.length > 0 && ENV_ASSIGNMENT.test(tokens[0…)` |
| 147 | && | `tokens.length > 0 && ENV_ASSIGNMENT.test(tokens[0]!)` |
| 152 | loop | `loop (tokens.length > 0 && WRAPPER_COMMANDS.has(stripQu…)` |
| 152 | && | `tokens.length > 0 && WRAPPER_COMMANDS.has(stripQuotes(token…` |
| 154 | loop | `loop (tokens.length > 0 && ENV_ASSIGNMENT.test(tokens[0…)` |
| 154 | && | `tokens.length > 0 && ENV_ASSIGNMENT.test(tokens[0]!)` |
| 160 | if | `if (!first)` |
| 160 | ! | `!first` |
| 163 | ?? | `first.split("/").pop() ?? first` |
| 165 | ternary | `? name.length > 0 :` |

### `parseExecutables` — `tool-exec-policy.ts:176`（PI，fn/exported，参数 1）

参数：`command: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 178 | loop | `loop (splitCommands(command))` |
| 180 | if | `if (executable && !found.includes(executable))` |
| 180 | && | `executable && !found.includes(executable)` |
| 180 | ! | `!found.includes(executable)` |

### `assertExecutablesAllowed` — `tool-exec-policy.ts:193`（PI，fn/exported，参数 2）

参数：`command: string` · `allowlist: readonly string[]`

| 行 | 类型 | 条件 |
|--:|---|---|
| 194 | if | `if (allowlist.length === 0)` |
| 196 | ?? | `stripQuotes(entry).split("/").pop() ?? entry` |
| 197 | loop | `loop (parseExecutables(command))` |
| 198 | if | `if (!allowed.has(executable))` |
| 198 | ! | `!allowed.has(executable)` |

### `assertRemoteExecutableAllowed` — `tool-exec-policy.ts:213`（PI，fn/exported，参数 2）

参数：`argv: readonly string[]` · `allowlist: readonly string[]`

| 行 | 类型 | 条件 |
|--:|---|---|
| 214 | if | `if (allowlist.length === 0)` |
| 216 | if | `if (!first)` |
| 216 | ! | `!first` |
| 218 | ?? | `first.split("/").pop() ?? first` |
| 219 | ?? | `stripQuotes(entry).split("/").pop() ?? entry` |
| 220 | if | `if (!allowed.has(name))` |
| 220 | ! | `!allowed.has(name)` |

### `stripQuotes` — `tool-exec-policy.ts:229`（PI，fn/exported，参数 1）

参数：`value: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 230 | if | `if (value.length >= 2)` |
| 233 | if | `if ((first === '"' && last === '"') \|\| (first === "'" && last === "'"))` |
| 233 | || | `(first === '"' && last === '"') \|\| (first === "'" && last =…` |
| 233 | && | `first === '"' && last === '"'` |
| 233 | && | `first === "'" && last === "'"` |

### `makePolicyFetch` — `tool-host-policy.ts:74`（PI，fn/exported，参数 1）

参数：`base: typeof fetch`

| 行 | 类型 | 条件 |
|--:|---|---|
| 77 | if | `if (allowlist !== null && allowlist.length > 0)` |
| 77 | && | `allowlist !== null && allowlist.length > 0` |
| 78 | ternary | `? typeof input === "string" :` |
| 82 | catch | `catch ("invalid_request", `not a URL: ${urlStr…)` |
| 89 | if | `if (!allowlist.includes(host))` |
| 89 | ! | `!allowlist.includes(host)` |

### `installNetworkPolicy` — `tool-host-policy.ts:109`（PI，fn/exported，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 110 | if | `if (previousFetch !== null)` |

### `restoreNetworkPolicy` — `tool-host-policy.ts:121`（PI，fn/exported，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 122 | if | `if (previousFetch !== null)` |

### `canonicalize` — `policy.ts:14`（POLICY，method/private，参数 1）

参数：`rel: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 15 | if | `if (isAbsolute(rel))` |
| 16 | if | `if (rel.includes("\\"))` |
| 18 | if | `if (norm.split("/").some((s) => s === ".." \|\| s === "." \|\| s === ""))` |
| 18 | || | `s === ".." \|\| s === "." \|\| s === ""` |
| 18 | || | `s === ".." \|\| s === "."` |

### `resolveWorkspace` — `policy.ts:24`（POLICY，method/private，参数 1）

参数：`workspaceRef: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 25 | ?? | `this.config.workspace.roots[workspaceRef] ?? this.config.wo…` |
| 26 | if | `if (!root)` |
| 26 | ! | `!root` |

### `validate` — `policy.ts:31`（POLICY，method/public，参数 2）

参数：`task: TaskRequest` · `_principal: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 36 | if | `if (!this.tools.profiles[task.permissions.tool_profile_ref])` |
| 36 | ! | `!this.tools.profiles[task.permissions.tool_profile_ref]` |
| 39 | loop | `loop (outputs)` |
| 42 | if | `if (!inRead && !inWrite)` |
| 42 | && | `!inRead && !inWrite` |
| 42 | ! | `!inRead` |
| 42 | ! | `!inWrite` |
| 44 | loop | `loop (task.input_refs ?? [])` |
| 44 | ?? | `task.input_refs ?? []` |
| 45 | if | `if (ref.dest)` |

### `validateResult` — `policy.ts:55`（POLICY，method/public，参数 1）

参数：`result: AgentResult`

| 行 | 类型 | 条件 |
|--:|---|---|
| 56 | if | `if (result.state === "Completed" && (result.partial \|\| result.failure !== n…)` |
| 56 | && | `result.state === "Completed" && (result.partial \|\| result.f…` |
| 56 | || | `result.partial \|\| result.failure !== null` |
| 59 | if | `if (result.state === "Failed" && result.failure === null)` |
| 59 | && | `result.state === "Failed" && result.failure === null` |

### `within` — `policy.ts:65`（POLICY，fn/exported，参数 3）

参数：`root: string` · `glob: string` · `path: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 66 | ternary | `? glob.endsWith("/**") :` |
| 66 | ternary | `? glob.endsWith("*") :` |
| 67 | || | `path === base \|\| path.startsWith(base.endsWith("/") ? base …` |
| 67 | || | `path === base \|\| path.startsWith(base.endsWith("/") ? base …` |
| 67 | ternary | `? base.endsWith("/") :` |

### `resolveWorkspace` — `workspace.ts:9`（POLICY，fn/exported，参数 2）

参数：`ref: string` · `roots: Record<string,string>`

| 行 | 类型 | 条件 |
|--:|---|---|
| 10 | if | `if (!configured)` |
| 10 | ! | `!configured` |

### `realpathNearestAncestor` — `workspace.ts:14`（POLICY，fn/exported，参数 1）

参数：`p: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 16 | loop | `loop ()` |
| 16 | catch | `catch (cur)` |
| 16 | if | `if (parent===cur)` |

### `authorizePath` — `workspace.ts:18`（POLICY，fn/exported，参数 4）

参数：`workspace: string` · `input: string` · `allowed: string[]` · `write: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 21 | if | `if (!inside(workspace,candidate))` |
| 21 | ! | `!inside(workspace,candidate)` |
| 23 | ternary | `? write :` |
| 24 | catch | `catch (dirname(candidate)` |
| 24 | ternary | `? write :` |
| 25 | ternary | `? write :` |
| 26 | if | `if (!inside(wsReal,target))` |
| 26 | ! | `!inside(wsReal,target)` |
| 28 | if | `if (!allowedAbs.every(p=>inside(wsReal,p)))` |
| 28 | ! | `!allowedAbs.every(p=>inside(wsReal,p))` |
| 29 | if | `if (!allowedAbs.some(root=>inside(root,target)))` |
| 29 | ! | `!allowedAbs.some(root=>inside(root,target))` |

### `collectOutputs` — `workspace.ts:32`（POLICY，fn/exported，参数 2）

参数：`task: TaskRequest` · `workspace: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 34 | loop | `loop (task.output_paths)` |
| 35 | if | `if (!s.isFile())` |
| 35 | ! | `!s.isFile()` |
| 35 | catch | `catch ()` |

### `ensureTaskDirs` — `workspace.ts:41`（POLICY，fn/exported，参数 2）

参数：`workspace: string` · `task: TaskRequest`

| 行 | 类型 | 条件 |
|--:|---|---|
| 44 | loop | `loop ([...task.permissions.write_paths, ...task.output_…)` |
| 46 | if | `if (!inside(workspace, abs))` |
| 46 | ! | `!inside(workspace, abs)` |
| 49 | loop | `loop (dirs)` |
| 50 | if | `if (!inside(workspace, d))` |
| 50 | ! | `!inside(workspace, d)` |

### `TaskStore.constructor` — `store.ts:44`（REPO，ctor/public，参数 2）

参数：`path: string` · `busyMs: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 45 | if | `if (path !== ":memory:")` |

### `tx` — `store.ts:170`（REPO，method/private，参数 1）

参数：`fn: () => T`

| 行 | 类型 | 条件 |
|--:|---|---|
| 176 | catch | `catch (e)` |

### `createOrGet` — `store.ts:183`（REPO，method/public，参数 4）

参数：`task: TaskRequest` · `principal: string` · `capacity: number` · `triggerContent: string?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 186 | if | `if (old)` |
| 187 | if | `if (old.identity_state === "Tombstone")` |
| 188 | if | `if (!sameTask(JSON.parse(old.task_json), task))` |
| 188 | ! | `!sameTask(JSON.parse(old.task_json), task)` |
| 193 | if | `if (q >= capacity)` |
| 196 | ternary | `? task.input_refs?.length :` |
| 196 | ?. | `task.input_refs?.length` |
| 209 | ternary | `? task.discussion :` |
| 214 | if | `if (task.discussion)` |
| 219 | ?? | `triggerContent ?? ""` |

### `getTask` — `store.ts:225`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 227 | if | `if (!r)` |
| 227 | ! | `!r` |

### `mutateRun` — `store.ts:232`（REPO，method/public，参数 1）

参数：`command: FencedRunCommand`

| 行 | 类型 | 条件 |
|--:|---|---|
| 235 | if | `if (!r)` |
| 235 | ! | `!r` |
| 236 | if | `if (r.generation !== command.expected_generation)` |
| 237 | if | `if (command.expected_state_in && !command.expected_state_in.includes(r.stat…)` |
| 237 | && | `command.expected_state_in && !command.expected_state_in.inc…` |
| 237 | ! | `!command.expected_state_in.includes(r.state)` |
| 240 | if | `if (command.expected_lease_epoch !== undefined)` |
| 242 | if | `if (slot.task_id !== command.task_id \|\| slot.lease_epoch !== command.expect…)` |
| 242 | || | `slot.task_id !== command.task_id \|\| slot.lease_epoch !== co…` |

### `getRun` — `store.ts:255`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 257 | if | `if (!r)` |
| 257 | ! | `!r` |
| 259 | if | `if (t?.identity_state === "Tombstone")` |
| 259 | ?. | `t?.identity_state` |
| 262 | ! | `!!this.db.prepare("SELECT 1 FROM results WHERE task_id=?").g…` |
| 262 | ! | `!this.db.prepare("SELECT 1 FROM results WHERE task_id=?").ge…` |
| 272 | ! | `!!r.cancel_requested` |
| 272 | ! | `!r.cancel_requested` |
| 279 | ternary | `? r.started_at :` |

### `setInputStaging` — `store.ts:288`（REPO，method/public，参数 2）

参数：`taskId: string` · `staging: InputStaging`

| 行 | 类型 | 条件 |
|--:|---|---|
| 293 | if | `if (r.changes === 0)` |

### `setArtifactDelivery` — `store.ts:295`（REPO，method/public，参数 2）

参数：`taskId: string` · `delivery: ArtifactDelivery`

| 行 | 类型 | 条件 |
|--:|---|---|
| 297 | if | `if (r.changes === 0)` |

### `tryClaimSlot` — `store.ts:304`（REPO，method/public，参数 2）

参数：`owner: string` · `boot: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 307 | if | `if (slot.task_id)` |
| 315 | if | `if (!r)` |
| 315 | ! | `!r` |

### `failAccessLostTasks` — `store.ts:336`（REPO，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 348 | loop | `loop (rows)` |
| 351 | ?? | `(this.db.prepare("SELECT generation FROM runs WHERE task_id…` |
| 351 | ?. | `(this.db.prepare("SELECT generation FROM runs WHERE task_id…` |
| 375 | if | `if (owned)` |

### `recoverOrphaned` — `store.ts:385`（REPO，method/public，参数 2）

参数：`owner: string` · `boot: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 388 | if | `if (!slot.task_id)` |
| 388 | ! | `!slot.task_id` |
| 390 | if | `if (!run \|\| isTerminal(run.state))` |
| 390 | || | `!run \|\| isTerminal(run.state)` |
| 390 | ! | `!run` |

### `nextNeedingStaging` — `store.ts:421`（REPO，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 427 | ?? | `r?.task_id ?? null` |
| 427 | ?. | `r?.task_id` |

### `reserveModel` — `store.ts:431`（REPO，method/public，参数 4）

参数：`taskId: string` · `op: string` · `step: string` · `attempt: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 436 | if | `if (ex)` |

### `terminalModel` — `store.ts:449`（REPO，method/public，参数 5）

参数：`taskId: string` · `op: string` · `step: string` · `attempt: number` · `unknown: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 454 | ternary | `? unknown :` |

### `reserveTool` — `store.ts:456`（REPO，method/public，参数 7）

参数：`taskId: string` · `op: string` · `id: string` · `name: string` · `effect: string` · `replay: string` · `contract: string?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 469 | if | `if (ex)` |
| 470 | if | `if (ex.replay !== "safe")` |
| 478 | ?? | `contract ?? null` |

### `terminalTool` — `store.ts:483`（REPO，method/public，参数 4）

参数：`taskId: string` · `op: string` · `id: string` · `unknown: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 486 | ternary | `? unknown :` |

### `markTurn` — `store.ts:489`（REPO，method/public，参数 5）

参数：`taskId: string` · `event: string` · `status: "QueuedInPi" | "Consumed" | "Abandoned"` · `entry: string?` · `op: string?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 492 | ?? | `entry ?? null` |
| 492 | ?? | `op ?? null` |

### `markDiscussionAccessLost` — `store.ts:497`（REPO，method/public，参数 1）

参数：`room: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 505 | ?. | `JSON.parse(x.task_json).discussion?.room_id` |
| 506 | catch | `catch ()` |
| 512 | loop | `loop (affected)` |

### `discussionAccessLost` — `store.ts:516`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 517 | ! | `!!this.db.prepare("SELECT 1 FROM discussion_access_loss WHER…` |
| 517 | ! | `!this.db.prepare("SELECT 1 FROM discussion_access_loss WHERE…` |

### `recordMatrixEvent` — `store.ts:524`（REPO，method/public，参数 4）

参数：`room: string` · `event: string` · `sender: string` · `txn: string?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 525 | ?? | `txn ?? null` |

### `ingestMatrixEvent` — `store.ts:528`（REPO，method/public，参数 5）

参数：`room: string` · `event: string` · `sender: string` · `txn: string | undefined` · `turns: { task: string; visible: string }[]`

| 行 | 类型 | 条件 |
|--:|---|---|
| 530 | ?? | `txn ?? null` |
| 531 | if | `if (!inserted.changes)` |
| 531 | ! | `!inserted.changes` |
| 532 | loop | `loop (turns)` |
| 534 | if | `if (r?.discussion_intake_state !== "Open")` |
| 534 | ?. | `r?.discussion_intake_state` |

### `hasMatrixEvent` — `store.ts:544`（REPO，method/public，参数 2）

参数：`room: string` · `event: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 545 | ! | `!!this.db.prepare("SELECT 1 FROM matrix_events WHERE room_id…` |
| 545 | ! | `!this.db.prepare("SELECT 1 FROM matrix_events WHERE room_id=…` |

### `ingestMatrixBatch` — `store.ts:547`（REPO，method/public，参数 2）

参数：`events: { room: string; event: string; sender: string; txn?: string;?` · `cursor: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 549 | loop | `loop (events)` |
| 550 | ?? | `item.txn ?? null` |
| 551 | if | `if (!inserted.changes)` |
| 551 | ! | `!inserted.changes` |
| 552 | loop | `loop (item.turns)` |
| 554 | if | `if (r?.discussion_intake_state !== "Open")` |
| 554 | ?. | `r?.discussion_intake_state` |

### `discussionRoomsInUse` — `store.ts:567`（REPO，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 575 | ?. | `JSON.parse(x.task_json)?.discussion?.room_id` |
| 575 | ?. | `JSON.parse(x.task_json)?.discussion` |
| 576 | catch | `catch ()` |
| 580 | && | `typeof room === "string" && room.length > 0` |

### `openDiscussionRuns` — `store.ts:583`（REPO，method/public，参数 1）

参数：`room: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 589 | ?. | `JSON.parse(x.task_json).discussion?.room_id` |
| 590 | catch | `catch ()` |

### `prepareMatrixSend` — `store.ts:602`（REPO，method/public，参数 4）

参数：`txn: string` · `taskId: string` · `turn: number` · `payloadSha: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 605 | if | `if (old)` |
| 606 | if | `if (old.payload_sha256 !== payloadSha)` |

### `tryCloseIntake` — `store.ts:619`（REPO，method/public，参数 2）

参数：`taskId: string` · `epoch: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 622 | if | `if (pending)` |
| 626 | if | `if (!r)` |
| 626 | ! | `!r` |
| 627 | if | `if (r.discussion_intake_state === "Closing")` |
| 628 | if | `if (r.discussion_intake_state !== "Open")` |

### `cancel` — `store.ts:634`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 638 | if | `if (isTerminal(r.state))` |
| 639 | if | `if (r.state === "Queued")` |

### `cancelRequested` — `store.ts:667`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 668 | ! | `!!(this.db.prepare("SELECT cancel_requested FROM runs WHERE …` |
| 668 | ! | `!(this.db.prepare("SELECT cancel_requested FROM runs WHERE t…` |
| 668 | ?. | `(this.db.prepare("SELECT cancel_requested FROM runs WHERE t…` |

### `usageSoFar` — `store.ts:674`（REPO，method/private，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 676 | if | `if (!rows.length)` |
| 676 | ! | `!rows.length` |
| 682 | loop | `loop (rows)` |
| 684 | ?? | `v.input ?? 0` |
| 685 | ?? | `v.output ?? 0` |
| 686 | ?? | `v.totalTokens ?? 0` |
| 687 | ?? | `v.cacheRead ?? 0` |
| 688 | ?? | `v.cacheWrite ?? 0` |

### `rawUsage` — `store.ts:692`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 698 | if | `if (value.cost && typeof value.input === "number" && typeof value.cacheRead…)` |
| 699 | && | `value.cost && typeof value.input === "number" && typeof val…` |
| 699 | && | `value.cost && typeof value.input === "number" && typeof val…` |
| 699 | && | `value.cost && typeof value.input === "number" && typeof val…` |
| 699 | && | `value.cost && typeof value.input === "number" && typeof val…` |
| 699 | && | `value.cost && typeof value.input === "number"` |

### `knownActions` — `store.ts:711`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 713 | loop | `loop (this.db .prepare("SELECT operation_id,step_id,att…)` |
| 718 | ternary | `? x.state === "Terminal" :` |
| 718 | ternary | `? x.state === "Unknown" :` |
| 722 | loop | `loop (this.db .prepare("SELECT operation_id,tool_call_i…)` |
| 727 | ternary | `? x.state === "Terminal" :` |
| 727 | ternary | `? x.state === "Unknown" :` |
| 731 | loop | `loop (this.db.prepare("SELECT txn_id,state FROM matrix_…)` |
| 732 | ternary | `? x.state === "Sent" :` |

### `publishResult` — `store.ts:745`（REPO，method/public，参数 2）

参数：`result: AgentResult` · `epoch: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 748 | if | `if (slot.task_id !== result.task_id \|\| slot.lease_epoch !== epoch)` |
| 748 | || | `slot.task_id !== result.task_id \|\| slot.lease_epoch !== epo…` |

### `finish` — `store.ts:755`（REPO，method/public，参数 2）

参数：`result: AgentResult` · `epoch: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 758 | if | `if (slot.task_id !== result.task_id \|\| slot.lease_epoch !== epoch)` |
| 758 | || | `slot.task_id !== result.task_id \|\| slot.lease_epoch !== epo…` |
| 761 | if | `if (result.state === "Completed" && run.discussion_intake_state !== "Disabl…)` |
| 761 | && | `result.state === "Completed" && run.discussion_intake_state…` |
| 761 | && | `result.state === "Completed" && run.discussion_intake_state…` |
| 761 | || | `run.discussion_intake_state !== "Closing" \|\| pending !== 0` |
| 764 | if | `if (result.state !== "Completed")` |
| 767 | if | `if (!this.db.prepare("SELECT 1 FROM results WHERE task_id=? AND generation=…)` |
| 767 | ! | `!this.db.prepare("SELECT 1 FROM results WHERE task_id=? AND …` |

### `finishQueued` — `store.ts:780`（REPO，method/public，参数 1）

参数：`result: AgentResult`

| 行 | 类型 | 条件 |
|--:|---|---|
| 783 | if | `if (!r)` |
| 783 | ! | `!r` |
| 784 | if | `if (isTerminal(r.state))` |
| 785 | if | `if (!this.db.prepare("SELECT 1 FROM results WHERE task_id=? AND generation=…)` |
| 785 | ! | `!this.db.prepare("SELECT 1 FROM results WHERE task_id=? AND …` |

### `result` — `store.ts:795`（REPO，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 797 | if | `if (r)` |
| 799 | if | `if (!isTerminal(state))` |
| 799 | ! | `!isTerminal(state)` |

### `purge` — `store.ts:804`（REPO，method/public，参数 1）

参数：`scope: { task_id: string } | "all"`

| 行 | 类型 | 条件 |
|--:|---|---|
| 807 | ternary | `? scope === "all" :` |
| 814 | loop | `loop (rows)` |
| 816 | if | `if (!identity)` |
| 816 | ! | `!identity` |
| 817 | if | `if (identity.identity_state === "Tombstone")` |
| 818 | loop | `loop (["matrix_sends", "discussion_turns", "discussion_…)` |

### `acquire` — `scheduler.ts:15`（SCHED，method/public，参数 1）

参数：`owner: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 17 | ternary | `? granted === "slot_busy" :` |

### `close` — `scheduler.ts:41`（SCHED，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 42 | if | `if (this.timer)` |

### `authenticate` — `auth.ts:3`（TAPI，method/public，参数 1）

参数：`header: string|undefined`

| 行 | 类型 | 条件 |
|--:|---|---|
| 3 | if | `if (!header?.startsWith("Bearer "))` |
| 3 | ! | `!header?.startsWith("Bearer ")` |
| 3 | ?. | `header?.startsWith` |
| 3 | if | `if (got.length!==this.token.length\|\|!timingSafeEqual(got,this.token))` |
| 3 | || | `got.length!==this.token.length\|\|!timingSafeEqual(got,this.t…` |
| 3 | ! | `!timingSafeEqual(got,this.token)` |

### `body` — `server.ts:12`（TAPI，fn/exported，参数 2）

参数：`req: IncomingMessage` · `max: inferred?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 15 | loop | `loop (req)` |
| 18 | if | `if (size > max)` |
| 23 | catch | `catch ("InvalidRequest", 400, "invalid JSON bo…)` |

### `create` — `server.ts:49`（TAPI，method/public，参数 5）

参数：`config: RuntimeConfig` · `store: TaskStore` · `auth: BearerAuth` · `onCancel: (taskId: string, outcome: string) => void?` · `obs: Observability?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 52 | ?? | `(Ajv as any).default ?? Ajv` |
| 53 | ?? | `(addFormats as any).default ?? addFormats` |
| 58 | if | `if (!x.validateTask)` |
| 58 | ! | `!x.validateTask` |

### `route` — `server.ts:62`（TAPI，method/private，参数 2）

参数：`req: IncomingMessage` · `res: ServerResponse`

| 行 | 类型 | 条件 |
|--:|---|---|
| 63 | ternary | `? typeof req.headers["x-request-id"] === "string" :` |
| 66 | ?? | `req.url ?? "/"` |
| 68 | if | `if (req.method === "POST" && url.pathname === "/tasks")` |
| 68 | && | `req.method === "POST" && url.pathname === "/tasks"` |
| 70 | if | `if (!this.validateTask(task))` |
| 70 | ! | `!this.validateTask(task)` |
| 71 | ?? | `this.validateTask.errors?.map((x) => `${x.instancePath} ${x…` |
| 71 | ?. | `this.validateTask.errors?.map` |
| 76 | if | `if (outcome.kind === "queue_full")` |
| 77 | if | `if (outcome.kind === "tombstone")` |
| 78 | if | `if (outcome.kind === "conflict")` |
| 79 | ternary | `? "task_id" in outcome :` |
| 83 | if | `if (req.method === "POST" && cancel)` |
| 83 | && | `req.method === "POST" && cancel` |
| 87 | ternary | `? receipt.outcome === "StopRequested" :` |
| 90 | if | `if (req.method === "GET" && result)` |
| 90 | && | `req.method === "GET" && result` |
| 92 | if | `if (req.method === "GET" && get)` |
| 92 | && | `req.method === "GET" && get` |
| 96 | if | `if (req.method === "GET" && url.pathname === "/diagnostics")` |
| 96 | && | `req.method === "GET" && url.pathname === "/diagnostics"` |
| 97 | if | `if (!this.obs)` |
| 97 | ! | `!this.obs` |
| 103 | catch | `catch (error)` |
| 105 | ternary | `? e.status === 429 \|\| e.status === 503 :` |
| 105 | || | `e.status === 429 \|\| e.status === 503` |

### `close` — `server.ts:119`（TAPI，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 120 | ternary | `? e :` |

### `mapError` — `server.ts:140`（TAPI，fn/exported，参数 1）

参数：`error: unknown`

| 行 | 类型 | 条件 |
|--:|---|---|
| 141 | if | `if (error instanceof PikoError && PUBLIC_CODES.has(error.code))` |
| 141 | && | `error instanceof PikoError && PUBLIC_CODES.has(error.code)` |
| 144 | ternary | `? error instanceof Error :` |

### `execute` — `remote-exec-tools.ts:114`（TRANSFER，method/public，参数 6）

参数：`_toolCallId: inferred` · `params: inferred` · `_onUpdate: inferred` · `_toolContext: inferred` · `_invocation: inferred` · `_context: inferred`

| 行 | 类型 | 条件 |
|--:|---|---|
| 145 | ?. | `deps.executionFacts?.record` |
| 151 | ternary | `? result.timed_out :` |
| 153 | ternary | `? result.transport_failed :` |
| 186 | catch | `catch (e)` |
| 189 | ternary | `? e instanceof Error :` |
| 190 | ternary | `? e instanceof PikoError :` |
| 195 | ?. | `deps.executionFacts?.record` |
| 197 | ternary | `? code === "ScopeDenied" :` |

### `execRemote` — `remote-exec.ts:92`（TRANSFER，fn/exported，参数 4）

参数：`options: RemoteExecOptions` · `transfer: { sshCommandArgs(host: string, argv: readonly string[]): Pro` · `config: RuntimeConfig` · `spawn: RemoteSpawner?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 100 | if | `if (argv.length === 0)` |
| 107 | ?? | `options.remoteHosts ?? []` |
| 108 | if | `if (allowedHosts.length > 0 && !allowedHosts.includes(host))` |
| 108 | && | `allowedHosts.length > 0 && !allowedHosts.includes(host)` |
| 108 | ! | `!allowedHosts.includes(host)` |
| 117 | ?? | `options.executables ?? []` |
| 120 | ternary | `? options.cwd :` |
| 123 | ?? | `options.timeoutMs ?? DEFAULT_TIMEOUT_MS` |
| 132 | if | `if (settled)` |
| 138 | ?. | `(error as { killed?: boolean } \| undefined)?.killed` |
| 139 | || | `killed \|\| (error as { signal?: string } \| undefined)?.signa…` |
| 139 | ?. | `(error as { signal?: string } \| undefined)?.signal` |
| 142 | if | `if (!error)` |
| 144 | else | `if (timedOut) { // A killed client has …` |
| 142 | ! | `!error` |
| 144 | if | `if (timedOut)` |
| 149 | else | `{ const code = (error as { code?: unkno…` |
| 151 | if | `if (typeof code === "number")` |
| 152 | else | `if (typeof code === "string" && /^\d+$/…` |
| 152 | if | `if (typeof code === "string" && /^\d+$/.test(code))` |
| 152 | && | `typeof code === "string" && /^\d+$/.test(code)` |
| 161 | ?? | `stderr ?? ""` |
| 163 | && | `exitCode === 255 && /(ssh: connect to host \|Could not resol…` |
| 168 | if | `if (transportFailed)` |
| 173 | if | `if (error && exitCode === null && !timedOut && !transportFailed)` |
| 173 | && | `error && exitCode === null && !timedOut && !transportFailed` |
| 173 | && | `error && exitCode === null && !timedOut` |
| 173 | && | `error && exitCode === null` |
| 173 | ! | `!timedOut` |
| 173 | ! | `!transportFailed` |
| 187 | ?? | `stdout ?? ""` |
| 188 | ?? | `stderr ?? ""` |
| 189 | || | `(stdout?.length ?? 0) > MAX_OUTPUT_BYTES \|\| (stderr?.length…` |
| 189 | ?? | `stdout?.length ?? 0` |
| 189 | ?. | `stdout?.length` |
| 189 | ?? | `stderr?.length ?? 0` |
| 189 | ?. | `stderr?.length` |
| 194 | ternary | `? timedOut :` |
| 201 | if | `if (settled)` |

### `truncate` — `remote-exec.ts:208`（TRANSFER，fn/exported，参数 1）

参数：`value: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 209 | ternary | `? value.length > MAX_OUTPUT_BYTES :` |

### `run` — `transfer.ts:15`（TRANSFER，fn/exported，参数 3）

参数：`cmd: string` · `args: string[]` · `signal: AbortSignal?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 18 | if | `if (err)` |
| 19 | else | `res({ stdout, stderr });` |

### `safeJoinIn` — `transfer.ts:25`（TRANSFER，fn/exported，参数 2）

参数：`base: string` · `rel: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 28 | if | `if (relCheck.startsWith("..") \|\| isAbsolute(relCheck))` |
| 28 | || | `relCheck.startsWith("..") \|\| isAbsolute(relCheck)` |

### `safeJoin` — `transfer.ts:31`（TRANSFER，fn/exported，参数 3）

参数：`stagingRoot: string` · `taskId: string` · `rel: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 35 | if | `if (relCheck.startsWith("..") \|\| isAbsolute(relCheck))` |
| 35 | || | `relCheck.startsWith("..") \|\| isAbsolute(relCheck)` |

### `scpKeyPath` — `transfer.ts:53`（TRANSFER，method/private，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 55 | if | `if (!ref)` |
| 55 | ! | `!ref` |
| 56 | if | `if (this.keyPath)` |
| 59 | if | `if (!material)` |
| 59 | ! | `!material` |
| 63 | ternary | `? material.endsWith("\n") :` |
| 66 | catch | `catch ()` |

### `close` — `transfer.ts:75`（TRANSFER，method/public，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 76 | if | `if (this.tempKey)` |

### `assertAllowed` — `transfer.ts:87`（TRANSFER，method/private，参数 1）

参数：`target: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 88 | ?? | `this.config.transfer.target_allowlist ?? []` |
| 89 | if | `if (!allow.some((a) => target.startsWith(a)))` |
| 89 | ! | `!allow.some((a) => target.startsWith(a))` |

### `scpArgs` — `transfer.ts:94`（TRANSFER，method/private，参数 3）

参数：`remote: string` · `local: string` · `direction: "pull" | "push"`

| 行 | 类型 | 条件 |
|--:|---|---|
| 97 | if | `if (this.config.transfer.port)` |
| 98 | if | `if (direction === "pull")` |
| 99 | else | `args.push("--", local, remote);` |

### `sshBaseArgs` — `transfer.ts:112`（TRANSFER，method/private，参数 1）

参数：`binary: "scp" | "ssh"`

| 行 | 类型 | 条件 |
|--:|---|---|
| 114 | if | `if (!knownHosts)` |
| 114 | ! | `!knownHosts` |
| 116 | if | `if (!key)` |
| 116 | ! | `!key` |
| 135 | if | `if (binary === "ssh" && this.config.transfer.port)` |
| 135 | && | `binary === "ssh" && this.config.transfer.port` |

### `withRetry` — `transfer.ts:151`（TRANSFER，method/private，参数 1）

参数：`fn: () => Promise<T>`

| 行 | 类型 | 条件 |
|--:|---|---|
| 152 | ?? | `this.config.transfer.retry ?? { max_attempts: 3, base_delay…` |
| 154 | loop | `loop ()` |
| 157 | catch | `catch (e)` |
| 159 | if | `if (attempt < max_attempts)` |

### `fetchInputs` — `transfer.ts:166`（TRANSFER，method/public，参数 3）

参数：`taskId: string` · `refs: InputRef[]` · `signal: AbortSignal?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 167 | if | `if (!refs.length)` |
| 167 | ! | `!refs.length` |
| 172 | loop | `loop (refs)` |
| 173 | ?? | `ref.dest ?? ref.source.split("/").pop() ?? "input"` |
| 173 | ?? | `ref.dest ?? ref.source.split("/").pop()` |
| 178 | if | `if (this.config.transfer.method === "scp")` |
| 180 | else | `if (this.config.transfer.method === "mo…` |
| 180 | if | `if (this.config.transfer.method === "mount")` |
| 182 | else | `{ throw new PikoError("InputFetchFailed…` |
| 186 | if | `if (ref.sha256 && sha256(local) !== ref.sha256)` |
| 186 | && | `ref.sha256 && sha256(local) !== ref.sha256` |
| 187 | if | `if (size > this.config.transfer.max_input_bytes)` |
| 189 | catch | `catch (e)` |
| 190 | ternary | `? e instanceof Error :` |
| 193 | ternary | `? failed.length :` |

### `deliverArtifacts` — `transfer.ts:198`（TRANSFER，method/public，参数 5）

参数：`taskId: string` · `outputPaths: string[]` · `target: ArtifactTarget` · `signal: AbortSignal?` · `baseDir: string?`

| 行 | 类型 | 条件 |
|--:|---|---|
| 199 | if | `if (!outputPaths.length \|\| !target)` |
| 199 | || | `!outputPaths.length \|\| !target` |
| 199 | ! | `!outputPaths.length` |
| 199 | ! | `!target` |
| 203 | loop | `loop (outputPaths)` |
| 205 | ternary | `? baseDir :` |
| 209 | if | `if (target.method === "scp")` |
| 211 | else | `if (target.method === "mount") { // mou…` |
| 211 | if | `if (target.method === "mount")` |
| 213 | else | `{ throw new PikoError("InternalError", …` |
| 217 | catch | `catch (e)` |
| 218 | ternary | `? e instanceof Error :` |
| 221 | ternary | `? failed.length === 0 :` |
| 221 | ternary | `? delivered.length === 0 :` |

### `clearStaging` — `transfer.ts:225`（TRANSFER，method/public，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 228 | catch | `catch ()` |

### `validateUsage` — `semantic.ts:3`（USAGE，fn/exported，参数 1）

参数：`u: TokenUsage`

| 行 | 类型 | 条件 |
|--:|---|---|
| 4 | if | `if (u.usage_observed_attempts > u.model_attempts)` |
| 6 | loop | `loop (fields)` |
| 6 | if | `if ((u[f] === null) !== missing.has(f))` |
| 7 | if | `if (u.quality === "Complete" && (known.length !== 6 \|\| u.usage_observed_att…)` |
| 7 | && | `u.quality === "Complete" && (known.length !== 6 \|\| u.usage_…` |
| 7 | || | `known.length !== 6 \|\| u.usage_observed_attempts !== u.model…` |
| 8 | if | `if (u.quality === "Partial" && (known.length === 0 \|\| known.length === 6 \|\|…)` |
| 8 | && | `u.quality === "Partial" && (known.length === 0 \|\| known.len…` |
| 8 | || | `known.length === 0 \|\| known.length === 6 \|\| u.usage_observe…` |
| 8 | || | `known.length === 0 \|\| known.length === 6` |
| 9 | if | `if (u.quality === "Unknown" && known.length !== 0)` |
| 9 | && | `u.quality === "Unknown" && known.length !== 0` |
| 10 | if | `if (u.input_tokens !== null && u.output_tokens !== null && u.total_tokens !…)` |
| 10 | && | `u.input_tokens !== null && u.output_tokens !== null && u.to…` |
| 10 | && | `u.input_tokens !== null && u.output_tokens !== null && u.to…` |
| 10 | && | `u.input_tokens !== null && u.output_tokens !== null` |
| 11 | if | `if (u.input_tokens !== null && ((u.cache_read_tokens ?? 0)>u.input_tokens \|…)` |
| 11 | && | `u.input_tokens !== null && ((u.cache_read_tokens ?? 0)>u.in…` |
| 11 | || | `(u.cache_read_tokens ?? 0)>u.input_tokens \|\| (u.cache_write…` |
| 11 | ?? | `u.cache_read_tokens ?? 0` |
| 11 | ?? | `u.cache_write_tokens ?? 0` |
| 12 | if | `if (u.output_tokens !== null && (u.reasoning_tokens ?? 0)>u.output_tokens)` |
| 12 | && | `u.output_tokens !== null && (u.reasoning_tokens ?? 0)>u.out…` |
| 12 | ?? | `u.reasoning_tokens ?? 0` |

### `runExecutionProcess` — `exec-process.ts:17`（WORKER，fn/exported，参数 2）

参数：`configPath: string` · `root: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 24 | if | `if (config.identity?.memory)` |
| 24 | ?. | `config.identity?.memory` |
| 30 | if | `if (config.identity?.doc_search)` |
| 30 | ?. | `config.identity?.doc_search` |
| 35 | if | `if (config.matrix.enabled)` |
| 36 | if | `if (config.matrix.direct_access_token)` |
| 38 | else | `if (config.matrix.access_token_secret_r…` |
| 38 | if | `if (config.matrix.access_token_secret_ref)` |
| 47 | if | `if (cmd.kind === "shutdown")` |
| 73 | if | `if (msg?.ipc !== "command")` |
| 73 | ?. | `msg?.ipc` |
| 74 | if | `if (msg.command?.kind === "shutdown")` |
| 74 | ?. | `msg.command?.kind` |
| 75 | if | `if (msg.command?.kind === "abort" && typeof msg.command.task_id === "string")` |
| 75 | && | `msg.command?.kind === "abort" && typeof msg.command.task_id…` |
| 75 | ?. | `msg.command?.kind` |

### `statusFromErrorCode` — `execution-facts.ts:78`（WORKER，fn/exported，参数 1）

参数：`code: string | undefined`

| 行 | 类型 | 条件 |
|--:|---|---|
| 80 | case | `case "timeout"` |
| 82 | case | `case "aborted"` |
| 84 | case | `case "spawn_error"` |
| 85 | case | `case "shell_unavailable"` |
| 87 | default | `default` |

### `buildRawResultRef` — `test-evidence.ts:42`（WORKER，fn/exported，参数 1）

参数：`input: { declaredOutputPaths: readonly string[]; outputs: readonly `

| 行 | 类型 | 条件 |
|--:|---|---|
| 47 | && | `input.declaredOutputPaths.length > 0 && input.outputs.lengt…` |
| 49 | || | `fact.status !== "exited" \|\| (fact.exit_code !== null && fac…` |
| 49 | && | `fact.exit_code !== null && fact.exit_code !== 0` |

### `isExecutionFailure` — `test-evidence.ts:65`（WORKER，fn/exported，参数 1）

参数：`raw: RawResultRef`

| 行 | 类型 | 条件 |
|--:|---|---|
| 66 | || | `raw.report_missing \|\| raw.execution_failed` |

### `fileState` — `tool-recovery.ts:31`（WORKER，fn/exported，参数 3）

参数：`env: ExecutionToolContext["env"]` · `path: string` · `context: Context`

| 行 | 类型 | 条件 |
|--:|---|---|
| 33 | if | `if (!info.ok)` |
| 33 | ! | `!info.ok` |
| 34 | if | `if (info.error.code==="not_found")` |
| 37 | if | `if (info.value.kind!=="file"&&info.value.kind!=="symlink")` |
| 37 | && | `info.value.kind!=="file"&&info.value.kind!=="symlink"` |
| 39 | if | `if (!read.ok)` |
| 39 | ! | `!read.ok` |

### `isPlan` — `tool-recovery.ts:43`（WORKER，fn/exported，参数 1）

参数：`value: JsonValue|undefined`

| 行 | 类型 | 条件 |
|--:|---|---|
| 44 | if | `if (!value\|\|typeof value!=="object"\|\|Array.isArray(value))` |
| 44 | || | `!value\|\|typeof value!=="object"\|\|Array.isArray(value)` |
| 44 | || | `!value\|\|typeof value!=="object"` |
| 44 | ! | `!value` |
| 46 | && | `plan.version===1&&typeof plan.before==="string"&&typeof pla…` |
| 46 | && | `plan.version===1&&typeof plan.before==="string"&&typeof pla…` |
| 46 | && | `plan.version===1&&typeof plan.before==="string"` |

### `executeRecoverable` — `tool-recovery.ts:49`（WORKER，fn/exported，参数 7）

参数：`base: AgentHarnessTool<ExecutionToolContext>` · `toolCallId: string` · `params: any` · `onUpdate: any` · `toolContext: ExecutionToolContext` · `invocation: AgentHarnessToolInvocation` · `context: Context`

| 行 | 类型 | 条件 |
|--:|---|---|
| 60 | if | `if (planValue!==undefined&&!isPlan(planValue))` |
| 60 | && | `planValue!==undefined&&!isPlan(planValue)` |
| 60 | ! | `!isPlan(planValue)` |
| 62 | if | `if (!plan)` |
| 83 | else | `{ const current=await fileState(toolCon…` |
| 62 | ! | `!plan` |
| 66 | if | `if (base.name==="write")` |
| 69 | else | `if(base.name==="edit"){ if(!Array.isArr…` |
| 69 | if | `if (base.name==="edit")` |
| 80 | else | `throw new Error(`Recovery contract is n…` |
| 70 | if | `if (!Array.isArray(params.edits)\|\|params.edits.length===0)` |
| 70 | || | `!Array.isArray(params.edits)\|\|params.edits.length===0` |
| 70 | ! | `!Array.isArray(params.edits)` |
| 71 | if | `if (before.content===undefined)` |
| 85 | if | `if (current.fingerprint===plan.after)` |
| 86 | if | `if (current.fingerprint!==plan.before)` |

### `applyToolRecoveryPolicy` — `tool-recovery.ts:91`（WORKER，fn/exported，参数 3）

参数：`base: AgentHarnessTool<ExecutionToolContext>` · `policy: ToolPolicy` · `registry: ToolRegistry`

| 行 | 类型 | 条件 |
|--:|---|---|
| 101 | ?? | `policy.permissions?.network_hosts ?? []` |
| 101 | ?. | `policy.permissions?.network_hosts` |
| 103 | if | `if (allowlist.length === 0)` |
| 121 | ?? | `policy.permissions?.executables ?? []` |
| 121 | ?. | `policy.permissions?.executables` |
| 123 | if | `if (execAllowlist.length === 0)` |
| 126 | if | `if (typeof params?.command === "string")` |
| 126 | ?. | `params?.command` |
| 134 | if | `if (policy.replay==="never")` |
| 135 | if | `if (policy.effect==="read_only")` |
| 136 | && | `policy.recovery_contract_ref&&registry.recovery_contracts[p…` |
| 137 | if | `if (!contract\|\|contract.implementation_ref!=="builtin:workspace-atomic-writ…)` |
| 137 | || | `!contract\|\|contract.implementation_ref!=="builtin:workspace…` |
| 137 | ! | `!contract` |
| 138 | if | `if (base.name!=="write"&&base.name!=="edit")` |
| 138 | && | `base.name!=="write"&&base.name!=="edit"` |

### `report` — `worker.ts:39`（WORKER，method/private，参数 1）

参数：`fact: Fact`

| 行 | 类型 | 条件 |
|--:|---|---|
| 41 | if | `if (!outcome.ok)` |
| 41 | ! | `!outcome.ok` |

### `isAborted` — `worker.ts:50`（WORKER，method/private，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 51 | || | `this.aborted.has(taskId) \|\| this.store.cancelRequested(task…` |

### `loop` — `worker.ts:58`（WORKER，method/private，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 61 | loop | `loop (!this.stopped)` |
| 61 | ! | `!this.stopped` |
| 63 | if | `if (!claim)` |
| 63 | ! | `!claim` |
| 67 | if | `if (claim.kind === "staging")` |
| 68 | else | `await this.run(claim.task_id, claim.lea…` |

### `claimNext` — `worker.ts:78`（WORKER，method/private，参数 0）

参数：（无）

| 行 | 类型 | 条件 |
|--:|---|---|
| 81 | if | `if (staging)` |
| 83 | if | `if (!grant)` |
| 83 | ! | `!grant` |

### `stageInputs` — `worker.ts:87`（WORKER，method/private，参数 1）

参数：`taskId: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 89 | ?? | `task.input_refs ?? []` |
| 93 | if | `if (this.isAborted(taskId))` |
| 98 | ternary | `? refs.length :` |
| 101 | catch | `catch (error)` |
| 106 | ternary | `? error instanceof Error :` |
| 110 | if | `if (staging.state === "failed")` |
| 119 | ternary | `? staging.state === "none" :` |

### `run` — `worker.ts:143`（WORKER，method/private，参数 2）

参数：`taskId: string` · `epoch: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 152 | if | `if (accessLost())` |
| 154 | || | `this.isAborted(taskId) \|\| accessLost()` |
| 154 | ternary | `? task.discussion :` |
| 166 | if | `if (task.artifact_target)` |
| 172 | ?? | `outcome.executions ?? []` |
| 179 | ternary | `? outcome.status === "completed" :` |
| 179 | ternary | `? lost :` |
| 179 | ternary | `? outcome.status === "cancelled" :` |
| 180 | ternary | `? state === "Completed" :` |
| 180 | ternary | `? lost :` |
| 180 | ?? | `outcome.failure ?? { code: "InternalError" as const, cause_…` |
| 181 | if | `if (state === "Failed" && failure && failure.code === "ModelResponseInvalid…)` |
| 181 | && | `state === "Failed" && failure && failure.code === "ModelRes…` |
| 181 | && | `state === "Failed" && failure && failure.code === "ModelRes…` |
| 181 | && | `state === "Failed" && failure` |
| 188 | if | `if (state === "Completed" && raw.report_missing)` |
| 188 | && | `state === "Completed" && raw.report_missing` |
| 201 | if | `if (state === "Completed" && raw.execution_failed)` |
| 201 | && | `state === "Completed" && raw.execution_failed` |
| 202 | || | `f.status !== "exited" \|\| (f.exit_code !== null && f.exit_co…` |
| 202 | && | `f.exit_code !== null && f.exit_code !== 0` |
| 207 | ?? | `bad?.command ?? "unknown command"` |
| 207 | ?. | `bad?.command` |
| 208 | ternary | `? bad && bad.exit_code !== null :` |
| 208 | && | `bad && bad.exit_code !== null` |
| 209 | ternary | `? bad && bad.status !== "exited" :` |
| 209 | && | `bad && bad.status !== "exited"` |
| 216 | && | `state !== "Completed" && outputs.length > 0` |
| 228 | catch | `catch (error)` |
| 234 | if | `if (cancelled)` |
| 237 | else | `if (accessLost()) { code = "DiscussionA…` |
| 237 | if | `if (accessLost())` |
| 240 | else | `if (error instanceof PikoError) { code …` |
| 240 | if | `if (error instanceof PikoError)` |
| 243 | else | `if (typeof e.pikoCode === "string") { c…` |
| 243 | if | `if (typeof e.pikoCode === "string")` |
| 246 | else | `if (isProviderUnavailableMessage(String…` |
| 245 | ternary | `? typeof e.cause === "string" :` |
| 246 | if | `if (isProviderUnavailableMessage(String(e.message ?? "")))` |
| 246 | ?? | `e.message ?? ""` |
| 253 | catch | `catch ()` |
| 261 | ternary | `? cancelled :` |
| 263 | ?? | `e.message ?? String(e)` |
| 268 | ?? | `e.message ?? String(e)` |
| 274 | catch | `catch (finalize)` |
| 278 | if | `if (timer)` |

### `buildStats` — `worker.ts:288`（WORKER，fn/exported，参数 2）

参数：`view: ReturnType<TaskStore["getRun"]>` · `outputs: AgentResult["outputs"]`

| 行 | 类型 | 条件 |
|--:|---|---|
| 292 | ternary | `? view.started_at && view.finished_at :` |
| 292 | && | `view.started_at && view.finished_at` |

### `aggregateUsage` — `worker.ts:299`（WORKER，fn/exported，参数 2）

参数：`rows: any[]` · `attempts: number`

| 行 | 类型 | 条件 |
|--:|---|---|
| 300 | if | `if (attempts === 0)` |
| 306 | loop | `loop (fields)` |
| 308 | if | `if (rows.length !== attempts \|\| rows.some((r) => typeof r[key] !== "number"))` |
| 311 | else | `sums[field] = rows.reduce((n, r) => n +…` |
| 308 | || | `rows.length !== attempts \|\| rows.some((r) => typeof r[key] …` |
| 314 | ternary | `? missing.length === fields.length :` |
| 314 | ternary | `? missing.length === 0 && observed === attempts :` |
| 314 | && | `missing.length === 0 && observed === attempts` |
| 315 | if | `if (quality === "Unknown")` |
| 315 | loop | `loop (fields)` |
| 315 | if | `if (!missing.includes(f))` |
| 315 | ! | `!missing.includes(f)` |

### `sendDiscussionReplyWithRetry` — `worker.ts:320`（WORKER，fn/exported，参数 6）

参数：`matrix: MatrixRuntime` · `taskId: string` · `roomId: string` · `eventId: string` · `turn: number` · `body: string`

| 行 | 类型 | 条件 |
|--:|---|---|
| 322 | loop | `loop ()` |
| 327 | if | `if (!(await matrix.isJoined(roomId)))` |
| 327 | ! | `!(await matrix.isJoined(roomId))` |
| 335 | catch | `catch (error)` |
| 337 | if | `if (/M_FORBIDDEN\|not in room\|not joined/i.test(String((error as Error)?.mes…)` |
| 337 | ?? | `(error as Error)?.message ?? error` |
| 337 | ?. | `(error as Error)?.message` |
| 345 | if | `if (isPermanentMatrixError(error))` |
| 346 | if | `if (error instanceof Error)` |
| 347 | || | `error.name === "ConnectionError" \|\| /ConnectionError\|fetch …` |
| 347 | ?? | `error.message ?? ""` |
| 348 | if | `if (!transient)` |
| 348 | ! | `!transient` |
| 350 | if | `if (attempt < DISCUSSION_RETRY_DELAYS_MS.length)` |
