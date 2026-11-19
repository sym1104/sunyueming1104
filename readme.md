# 科技视界 TechScope · 全栈项目

学生信息：**姓名：孙跃铭　学号：24001011104**

- 项目名称：科技视界 TechScope
- 项目类别：自选
- 技术栈：原生 HTML / CSS / JavaScript + Node.js / Express + MySQL 8.0
- 后端端口：8325　接口前缀：/api/

## 目录结构

```
.
├─ AGENTS.md                 项目开发规则
├─ readme.md                 项目说明（本文件）
├─ run.bat                   一键启动后端并保持窗口
├─ SUN_prompt.md             开发指令记录（只追加）
├─ frontend/                 前端（静态托管）
│  ├─ index.html             首页：个人信息 + 页面导航 + canvas 背景动画
│  ├─ database.html          数据库连接测试页
│  ├─ news.html              科技新闻列表页
│  ├─ gallery.html           图文列表页
│  ├─ css/SUN_common.css     公共样式
│  ├─ js/                    各页面脚本
│  ├─ images/                图文列表本地图片
│  └─ fonts/                 iconfont（预留）
└─ backend/                  后端（Express，MVC）
   ├─ app.js                 入口
   ├─ .env                   数据库凭据（已加入 .gitignore）
   ├─ config/                数据库连接池
   ├─ models/                数据访问层
   ├─ controllers/           控制器
   ├─ routes/                路由（/api）
   ├─ init/SUN_initDb.js     建库建表 + 测试数据
   ├─ SUN_interface.md       接口记录（只追加）
   └─ SUN_database.md        数据库 SQL 记录（只追加）
```

数据库：MySQL 8.0，库名 `sun_tech_db`。

## 启动方式

1. 确认 MySQL 服务已启动（本机：MySQL80）。
2. 双击根目录 `run.bat`，或在 `backend/` 下执行 `node app.js`。
3. 浏览器打开 <http://localhost:8325>。

首次在新机器部署时：

```bash
cd backend
npm i express cors dotenv mysql2   # 优先 cnpm i
node init/SUN_initDb.js         # 建库、建表、写入测试数据
node app.js
```

数据库连接参数写在 `backend/.env`：`DB_USER`、`DB_PASSWORD`、`DB_HOST`、`DB_NAME`、`PORT`。

## 页面与接口

| 页面 | 地址 | 对应接口 |
| --- | --- | --- |
| 首页 | `/index.html` | — |
| 数据库连接测试 | `/database.html` | `POST /api/database/test` |
| 科技新闻列表 | `/news.html` | `GET /api/news` |
| 图文列表 | `/gallery.html` | `GET /api/gallery` |

> 说明：新闻、图文数据均为课程演示用的示例数据，不构成真实新闻事实。
