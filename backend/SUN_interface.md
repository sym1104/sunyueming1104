# SUN_interface.md · 接口记录

> 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
> 说明：本文件只追加、不覆盖。所有接口统一前缀 `/api`，统一响应格式 `{ code, msg, data }`，`code=0` 为成功。
> 服务地址：http://localhost:8325　端口：8325　跨域：允许所有来源。

---

## GET /api

**接口路径：** `/api`
**HTTP 方法：** GET
**请求参数：** 无

**响应格式：**

```json
{
  "code": 0,
  "msg": "TechScope API 服务运行中",
  "data": {
    "SUN_project": "科技视界 TechScope",
    "SUN_student": "孙跃铭 / 24001011104",
    "SUN_endpoints": [
      { "method": "POST", "path": "/api/database/test", "desc": "测试数据库连接" },
      { "method": "GET", "path": "/api/database/status", "desc": "检查默认数据库连接状态" },
      { "method": "GET", "path": "/api/news", "desc": "科技新闻列表" },
      { "method": "GET", "path": "/api/news/:id", "desc": "科技新闻详情" },
      { "method": "GET", "path": "/api/gallery", "desc": "图文列表" },
      { "method": "GET", "path": "/api/gallery/:id", "desc": "图文详情" }
    ]
  }
}
```

**修改时间：** 2026-11-19 10:00

---

## POST /api/database/test

**接口路径：** `/api/database/test`
**HTTP 方法：** POST
**请求参数（JSON Body）：**

```json
{
  "SUN_user": "root",
  "SUN_password": "root"
}
```

兼容简写：`{ "user": "root", "password": "root" }`；两个字段都不传时使用 `.env` 中的 `DB_USER` / `DB_PASSWORD`。

**成功响应：**

```json
{
  "code": 0,
  "msg": "数据库连接成功",
  "data": {
    "SUN_connected": true,
    "SUN_user": "root",
    "SUN_host": "127.0.0.1:3306",
    "SUN_server": "DESKTOP-XXXX",
    "SUN_version": "8.0.30",
    "SUN_database": "sun_tech_db",
    "SUN_database_exists": true,
    "SUN_tables": ["SUN_news", "SUN_gallery"]
  }
}
```

**失败响应（HTTP 200，code 非 0）：**

```json
{
  "code": 1,
  "msg": "数据库连接失败：用户名或密码错误，请检查输入（默认 root / root，以 .env 实际配置为准）",
  "data": {
    "SUN_connected": false,
    "SUN_user": "root",
    "SUN_host": "127.0.0.1:3306",
    "SUN_error_code": "ER_ACCESS_DENIED_ERROR"
  }
}
```

**错误码映射：** `ER_ACCESS_DENIED_ERROR`（账号密码错误）、`ECONNREFUSED`（服务未启动）、`ETIMEDOUT`（连接超时）、`ER_BAD_DB_ERROR`（数据库不存在）。

**修改时间：** 2026-11-19 10:38

---

## GET /api/database/status

**接口路径：** `/api/database/status`
**HTTP 方法：** GET
**请求参数：** 无（使用 `.env` 中的凭据）

**响应格式：**

```json
{
  "code": 0,
  "msg": "数据库可用",
  "data": {
    "SUN_connected": true,
    "SUN_host": "127.0.0.1:3306",
    "SUN_database": "sun_tech_db"
  }
}
```

**修改时间：** 2026-11-19 10:38

---

## GET /api/news

**接口路径：** `/api/news`
**HTTP 方法：** GET
**请求参数：** 无（数据表 `SUN_news`，按 `SUN_publish_time` 倒序）

**响应格式：**

```json
{
  "code": 0,
  "msg": "科技新闻查询成功，共 8 条",
  "data": {
    "SUN_total": 8,
    "SUN_list": [
      {
        "SUN_id": 1,
        "SUN_title": "多模态大模型端侧推理成本下降三成，轻量化成为新赛点",
        "SUN_summary": "多家开源社区发布面向移动端的量化版本……",
        "SUN_source": "科技前线",
        "SUN_category": "人工智能",
        "SUN_publish_time": "2026-11-18 09:20:00",
        "SUN_image": "/images/SUN_tech_03.png",
        "SUN_views": 1286
      }
    ]
  }
}
```

**失败响应：** `{ "code": 1, "msg": "科技新闻查询失败：<原因>", "data": { "SUN_list": [] } }`

**修改时间：** 2026-11-19 10:55

---

## GET /api/news/:id

**接口路径：** `/api/news/:id`
**HTTP 方法：** GET
**请求参数（路径参数）：** `id`，新闻主键，示例：`/api/news/3`

**响应格式：**

```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "SUN_item": {
      "SUN_id": 3,
      "SUN_title": "一体化算力网新增 8 个智算节点，公共算力调度平台上线试运行",
      "SUN_summary": "……",
      "SUN_source": "算力周刊",
      "SUN_category": "基础设施",
      "SUN_publish_time": "2026-11-16 10:30:00",
      "SUN_image": "/images/SUN_tech_01.png",
      "SUN_views": 745
    }
  }
}
```

**异常：** `id` 非数字返回 `code=2`；查无记录返回 `code=3`。

**修改时间：** 2026-11-19 10:55

---

## GET /api/gallery

**接口路径：** `/api/gallery`
**HTTP 方法：** GET
**请求参数：** 无（数据表 `SUN_gallery`，按 `SUN_create_time` 倒序）

**响应格式：**

```json
{
  "code": 0,
  "msg": "图文列表查询成功，共 8 条",
  "data": {
    "SUN_total": 8,
    "SUN_list": [
      {
        "SUN_id": 1,
        "SUN_title": "智算中心机房：液冷机柜与夜间巡检",
        "SUN_image": "/images/SUN_tech_01.png",
        "SUN_intro": "整排液冷机柜在夜间低负荷运行……",
        "SUN_tag": "基础设施",
        "SUN_create_time": "2026-11-19 08:30:00"
      }
    ]
  }
}
```

**修改时间：** 2026-11-19 11:12

---

## GET /api/gallery/:id

**接口路径：** `/api/gallery/:id`
**HTTP 方法：** GET
**请求参数（路径参数）：** `id`，图文主键，示例：`/api/gallery/2`

**响应格式：**

```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "SUN_item": {
      "SUN_id": 2,
      "SUN_title": "量子实验室：稀释制冷机内部结构",
      "SUN_image": "/images/SUN_tech_02.png",
      "SUN_intro": "多层屏蔽线与同轴接口层层包裹……",
      "SUN_tag": "量子科技",
      "SUN_create_time": "2026-11-18 15:10:00"
    }
  }
}
```

**异常：** `id` 非数字返回 `code=2`；查无记录返回 `code=3`。

**修改时间：** 2026-11-19 11:12

---

## POST /api/chat（AI 对话 · SiliconFlow DeepSeek-V4-Flash）

**接口路径：** `/api/chat`
**HTTP 方法：** POST
**请求参数（JSON Body，二选一）：**

方式 A — 传入 messages 数组（多轮对话推荐）：

```json
{
  "messages": [
    { "role": "system", "content": "你是一个有用的助手，回答简明、有条理。" },
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好！我可以帮你解答问题。" },
    { "role": "user", "content": "再问一个……" }
  ]
}
```

方式 B — 传入 question 字符串（后端自动补默认 system prompt）：

```json
{
  "question": "你好，请用一句话介绍你自己"
}
```

**成功响应：**

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "SUN_reply": "你好！我是一个乐于助人的AI助手……😊",
    "SUN_model": "deepseek-ai/DeepSeek-V4-Flash",
    "SUN_usage": { "prompt_tokens": 22, "completion_tokens": 105, "total_tokens": 127 },
    "SUN_request": {
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "messages": [
        { "role": "system", "content": "你是一个有用的助手，回答简明、有条理。" },
        { "role": "user", "content": "你好，请用一句话介绍你自己" }
      ],
      "stream": false
    },
    "SUN_response": {
      "id": "01a2073c8164484cd8b5407e5196dafd",
      "object": "chat.completion",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "choices": [{
        "index": 0,
        "message": { "role": "assistant", "content": "你好！……" },
        "finish_reason": "stop"
      }],
      "usage": { "prompt_tokens": 22, "completion_tokens": 105, "total_tokens": 127 }
    }
  }
}
```

**失败响应（HTTP 200，code 非 0）：**
- `code=4001` 缺少 messages 或 question 参数
- `code=5001` 大模型服务未配置（.env 缺少 SILICONFLOW_*）
- `code=5002` 大模型返回错误
- `code=5099` 服务器内部异常

**后端终端打印（取证截图）：**

```
========== [发给大模型] ==========
{ model, messages, stream }   ← 后端转发给 SiliconFlow 的完整 JSON
==================================
========== [模型返回] ==========
{ id, choices, usage, ... }   ← SiliconFlow 返回的完整 chat.completion
==================================
```

**前端控制台三层日志：**

```
[AI 聊天] 发送给大模型的数据（前端 payload = messages 数组）：
[AI 聊天] 后端拼好后发送给大模型的数据（data.SUN_request）：
[AI 聊天] 从大模型接收到的原始响应（data.SUN_response）：
```

**大模型配置（backend/.env）：**

```
SILICONFLOW_API_KEY=sk-*****
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1/chat/completions
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V4-Flash
```

**修改时间：** 2026-11-23 15:10

---

## 6. 知识库 RAG 接口（2026-11-23 16:30）

### 6.1 POST /api/knowledge/upload — 文件上传 + 解析 + 分块

**请求：** `Content-Type: multipart/form-data`，字段名 `file`。
支持格式：.txt .md .csv .json .rtf .docx .pptx .xlsx .pdf .epub .doc .ppt；大小 ≤ 20MB。

**成功响应：**

```json
{
  "code": 0, "msg": "上传成功",
  "data": { "SUN_id": 1, "SUN_name": "hash.txt", "SUN_ext": ".txt",
            "SUN_size": 4945, "SUN_chunk_count": 5 }
}
```

### 6.2 GET /api/knowledge/files — 文件列表

**响应：**

```json
{ "code": 0, "msg": "ok",
  "data": { "SUN_total": 2,
    "SUN_list": [
      { "SUN_id": 2, "SUN_name": "timestamp_hash.txt",
        "SUN_original_name": "高级网页设计与全栈项目要点.txt",
        "SUN_ext": ".txt", "SUN_size": 6157, "SUN_chunk_count": 8,
        "SUN_upload_time": "2026-11-23T07:17:58.000Z" }
    ]
  }
}
```

### 6.3 DELETE /api/knowledge/files/:id — 删除文件（级联删 chunk）

**响应：** `{ "code": 0, "msg": "删除成功", "data": { "SUN_id": 1 } }`

### 6.4 POST /api/knowledge/ask — 基于知识库的 RAG 问答

**请求：** `{ "question": "大模型应用的四层架构是什么？" }`

**响应：**

```json
{
  "code": 0, "msg": "ok",
  "data": {
    "SUN_reply": "根据知识库片段[1]，大语言模型应用一般可以拆成四层：……",
    "SUN_model": "deepseek-ai/DeepSeek-V4-Flash",
    "SUN_usage": { "prompt_tokens": 1200, "completion_tokens": 300, "total_tokens": 1500 },
    "SUN_sources": [
      { "SUN_file_id": 1, "SUN_name": "大模型应用工程实践手册.txt", "SUN_ext": ".txt" },
      { "SUN_file_id": 2, "SUN_name": "高级网页设计与全栈项目要点.txt", "SUN_ext": ".txt" }
    ],
    "SUN_payload": {
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "messages": [
        { "role": "system", "content": "你是一个基于知识库的智能问答助手……===== 知识库片段 =====\n[1] 来源：大模型应用工程实践手册.txt……" },
        { "role": "user", "content": "大模型应用的四层架构是什么？" }
      ],
      "stream": false
    },
    "SUN_response": { "id": "01a2...", "choices": [...], "usage": {...} }
  }
}
```

**后端终端打印（取证截图）：**

```
========== [发给大模型（RAG）] ==========
{ messages: [ { role:'system', content:'你是……===== 知识库片段 =====...' }, ... ] }
=========================================
========== [模型返回（RAG）] ==========
{ id, choices, usage, ... }
========================================
```

**前端控制台三层日志：**

```
[RAG 问答] 发送给大模型的数据（前端 payload）：{ question }
[RAG 问答] 后端拼接好后发送给大模型的数据（data.SUN_payload）：{ model, messages }
[RAG 问答] 从大模型接收到的原始响应（data.SUN_response）：{ choices, usage }
```

**修改时间：** 2026-11-23 16:30
