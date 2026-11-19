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
