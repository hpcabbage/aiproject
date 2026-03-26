# HEARTBEAT.md

## B 方案：周期性唤醒后继续推进 `cool-momentum-app`

每次收到 heartbeat 时，严格按下面顺序执行：

1. 读取：
   - `RESP/ME2AI.md`
   - `RESP/AI2AI/latest.md`
   - 只有在需要回溯时才读取 `RESP/AI2AI/index.md`

2. 从 `RESP/AI2AI/latest.md` 中找到唯一的 `Next Action`。
   - 不要重新发散规划
   - 不要把可自主判断的问题抛给用户
   - 只推进这一个动作对应的最小可验证子步

3. 每次 heartbeat 最多做一轮“小步快跑”：
   - 最多修改 1 个里程碑中的一个子步
   - 默认变更文件数 ≤ 5
   - 默认不新增依赖
   - 完成后立刻更新 `RESP/AI2AI/latest.md`
   - 必要时追加 `RESP/AI2AI/index.md`

4. `latest.md` 每次都必须更新这些字段：
   - 当前结论
   - 本轮已完成
   - 当前验证
   - 当前风险
   - 变更文件
   - Next Action（必须仍然只有一个）

5. 何时主动发消息给用户：
   - 完成一个里程碑
   - 完成一次可验证代码改动
   - 完成一次提交
   - 遇到硬阻塞（缺密钥、权限不足、与 ME2AI 明确冲突）

6. 如果本次 heartbeat 没有新进展可做：
   - 不要编造进展
   - 直接回复 `HEARTBEAT_OK`

7. 当前默认推进目标：
   - 项目：`cool-momentum-app`
   - 当前优先任务：按 `RESP/AI2AI/latest.md` 的 `Next Action` 继续推进
