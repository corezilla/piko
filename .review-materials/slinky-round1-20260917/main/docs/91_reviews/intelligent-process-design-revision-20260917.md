# 智能流程推动器设计修订检查

Date: 2026-09-17
Status: Local design revision; provider alignment and implementation pending

## 已修改

系统设计draft.29、需求draft.6、外部接口控制/消费契约draft.6、Runtime/IR draft.5、Plan/Knowledge draft.4、开发计划draft.3及对应metadata。README增加当前设计入口。

明确智能角色决定业务下一步、确定性权限/版本/隔离约束；一IR一Piko、多IR讨论；失败由PM改派或转用户；记忆更新为普通Piko任务返回建议、Slinky验收落库；标准模型/Embeddings、token Usage、各自环境诊断恢复。Cost及复杂跨系统控制退出范围。

## 验证

- fallback git diff --check：PASS。
- 修改的9份metadata JSON解析及正文版本一致性：PASS。
- 当轮新增本地Markdown链接22项：PASS；后续编辑新增引用均为同一已检查目标。
- SRS中69个V03需求ID唯一性：PASS。
- 当前设计定义16项IP验证场景；这里只校验场景完整列出，不代表运行测试通过。

## 明确限制

此次未修改生产源码或运行配置，未运行产品测试/浏览器/外部服务，不以旧设计fixture替代新目标测试。未运行全量STD模板校验；重写模块的模板完整性与详细字段映射须继续在下游细化时校验。

旧fixed-stage ISD、SM002/003/004、通信/View/机制机器契约及Memory底层文档的冲突内容已明确撤回实施authority，仍保留历史正文/图片供迁移定位，并非全部逐图、逐DTO改写完成。旧requirements-traceability机器映射也须重新派生，不作为本轮验收依据。未改写provider-evidence或历史冻结证据；提供方缩减后的机器契约尚未签署。

本地未commit/push，未发送新Matrix请求，未变更投送控制、权限或runtime activation。
