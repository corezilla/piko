# Piko v0.3 单元测试计划

## 1. 目标与范围

本计划验证 Piko 自有逻辑在不依赖真实 Matrix、LLMTier 或 oMLX 的情况下可重复执行。测试使用 Vitest、内存 SQLite、临时目录、假 Matrix client/fetch 和假 Pi runtime；真实进程崩溃、模型协议兼容及外部服务联调仍由集成与验收测试负责。

完成标准：

1. 下表所有用例均有自动化测试并通过。
2. `npm run check` 通过，包括 TypeScript、Vitest 和机器契约检查。
3. 测试不访问公网，不依赖本机已有数据库，不留下临时文件。
4. 发现的实现缺陷先修复，再将对应回归用例保留在测试集中。

## 2. 测试矩阵

| ID | 组件 | 验证目标 | 主要断言 |
|---|---|---|---|
| UT-HTTP-01 | Auth/API | 缺失、格式错误及错误 bearer | 401；保留/生成 request ID；不访问 Store |
| UT-HTTP-02 | API Schema | 非法 JSON、未知字段和外部 model selector | 400 `InvalidRequest` |
| UT-HTTP-03 | API identity | 重复任务、冲突定义及不可用 Result | 原 Run；409 `TaskConflict`；409 `RunNotTerminal` |
| UT-HTTP-04 | API admission | 队列满与依赖异常 | 429/503 且返回 `retry-after` |
| UT-MX-01 | Matrix intake | 房间路由、自身 echo、event dedup、cursor 原子提交 | 只为 Open 且同 room 的 Run 插入一次 turn；cursor 最后提交 |
| UT-MX-02 | Matrix membership | sync 前成员资格撤销 | batch 失败且 cursor 不推进 |
| UT-MX-03 | Matrix media | URL、声明大小、MIME ACL | 非法输入 fail closed，且不写 staging |
| UT-MX-04 | Matrix media | 响应 MIME/实际大小不符 | 下载失败且不发布附件路径 |
| UT-MX-05 | Matrix media | 合法附件与文件名净化 | 字节一致、路径位于 run staging、文件名无越界片段 |
| UT-WRK-01 | Usage aggregate | 无 usage attempt 与逐字段缺失 | Unknown/Partial 语义及 null 字段正确 |
| UT-WRK-02 | Failure result | 异常前已有输出 | Failed、partial=true、输出 hash/size 保留 |
| UT-WRK-03 | Deadline | 执行开始前 deadline 已过 | Failed/DeadlineExceeded，Pi 不被调用 |
| UT-WRK-04 | Cancellation | cancel 与执行失败竞态 | CancelledByRequest 优先，终态只有一个 Result |
| UT-WRK-05 | Error mapping | 非字符串 `Error.cause` | 合法 `Internal` cause_class，不泄露对象 |
| UT-DISC-01 | Discussion | turn 插入与 Open→Closing 两种 writer 顺序 | turn-before-close 被消费；close-before-turn 被拒绝 |
| UT-DISC-02 | Discussion | Closing 重启恢复 | 同 lease 重试幂等成功，不重开 intake |
| UT-DISC-03 | Discussion | Failed/Cancelled 收尾 | Pending/QueuedInPi 全部变为 Abandoned |
| UT-DISC-04 | Discussion | Completed 守卫 | 非 Closing 或仍有 pending 时拒绝完成 |
| UT-TOOL-01 | Tool policy | read-only safe 与 registry binding | 只接受已注册、适用的实现 |
| UT-TOOL-02 | Tool recovery | write/edit 未执行、已执行及漂移 | 分别重放、确认、不确定失败 |
| UT-TOOL-03 | Tool ledger | logical call 重入与 never replay | 预算只计一次；never 重入 UnsafeRetryBlocked |
| UT-TOOL-04 | Tool recovery | 损坏或不匹配 memo | fail closed，不执行副作用 |
| UT-USG-01 | Usage validator | attempt、总量、cache、reasoning 算术反例 | 各反例均拒绝 |
| UT-USG-02 | Usage validator | Complete/Partial/Unknown 与 missing_fields | quality、null 和 missing 集合严格一致 |
| UT-USG-03 | Usage persistence | 同 attempt 覆盖及迟到 usage | 不相加；已发布 Result 字节不变 |
| UT-CFG-01 | Config | tool/recovery 注册与适用性 | 缺失、未知或不适用 binding 启动失败 |
| UT-CFG-02 | Config | SecretRef、Matrix 必填项、loopback HTTP 限制 | Schema 正负例符合部署边界 |

## 3. 执行顺序

1. 先补纯函数和 Store 语义测试：Usage、Discussion、Tool、Config。
2. 再补 Worker 异常与竞态测试。
3. 使用假 client/fetch 补 Matrix intake/media 测试。
4. 使用随机 loopback 端口补 HTTP 负例测试。
5. 运行定向测试、全量 `npm run check`，回填本计划执行结果。

## 4. 执行记录

状态：`Complete`

执行日期：`2026-09-18`

结果：

- 计划用例：27；已自动化：27；通过：27；失败：0。
- 全量测试：16 个测试文件、59 项测试全部通过。
- `npm run check` 通过：TypeScript 编译、Vitest、`simplified.6` 机器契约校验均成功。
- 新增测试文件：`tests/unit/server.test.ts`、`tests/unit/config-schema.test.ts`、`tests/unit/worker-runtime.test.ts`。
- 扩展测试文件：`tests/unit/matrix.test.ts`、`tests/unit/core.test.ts`、`tests/unit/store.test.ts`、`tests/unit/tool-recovery.test.ts`。
- 本轮首次定向执行出现两项测试夹具错误：重复提交夹具每次生成不同 deadline；Matrix intake 断言未排除初始 trigger turn。两者均为测试构造问题，修正后定向测试 41/41、全量测试 59/59 通过，没有发现新的运行时代码缺陷。

未覆盖边界：真实 Matrix homeserver 的连接、membership 传播、媒体下载和进程崩溃恢复；真实 oMLX/LLMTier 的协议与故障行为；操作系统级 SIGKILL/fsync。它们继续由集成、故障注入和验收测试承担，不计入本单元测试计划完成度。
