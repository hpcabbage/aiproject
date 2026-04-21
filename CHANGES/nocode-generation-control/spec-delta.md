# Spec Delta

## Affected Specs

- NoCode 聊天生成链路
- SSE 事件协议
- 生成任务状态模型

## Before

- 一轮生成没有显式 `generationId`
- 前端仅有 `isGenerating`
- SSE 主要承载文本流与 done
- 用户无法中途终止
- 无法清晰表达当前阶段与失败阶段

## After

- 每轮生成具备显式 `generationId`
- 生成任务具备 `status` 与 `phase`
- SSE 支持业务事件（phase change / stop / failed / completed）
- 前端提供终止生成按钮与阶段可视化
- 为 retry / 执行详情 / 历史追踪预留统一状态语义

## Why

该变更用于把现有黑盒式聊天生成升级为可控、可感知、可恢复的生成任务流，降低用户等待焦虑，并为后续更强的任务控制能力提供基础。