# SUN_prompt.md · 开发指令记录

> 说明：本文件只追加，不覆盖。每条记录格式为：时间 | 提示词全文 | 大模型名称。

---

## 2026-11-19 09:42 | 豆包大模型（Doubao）

**提示词全文：**

```text
根据这三个文件完成文件内的全栈开发：
1. 初始化项目.txt（基于 vibe coding 的全栈项目开发基本流程，含 0-6 共七个阶段）
2. 全栈开发提示词.txt（AGENTS.md 规则全文）
3. 全栈项目开发步骤.html（开发步骤与验收清单）

要求：按 AGENTS.md 的规则建立 frontend/ 与 backend/，完成首页（姓名、学号、项目名称、项目类别、所有页面超链接、canvas 背景动画）、
run.bat、database.html、科技新闻列表页、图文列表页，并补齐 SUN_prompt.md / SUN_interface.md / SUN_database.md 三份记录文件。
```

**大模型名称：** 豆包大模型（Doubao）

---

## 2026-11-19 10:05 | 豆包大模型（Doubao）

**提示词全文：**

```text
请初始化本项目：
1、 git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页index.html，包括姓名孙跃铭、学号24001011104、项目名称科技视界 TechScope、项目类别（自选），所有完成的html页面的超链接。有canvas背景动画。主体是页面链接导航。页面美观。
4、创建readme.md，在根目录下，包括学号、姓名。
```

**大模型名称：** 豆包大模型（Doubao）

---

## 2026-11-19 10:20 | 豆包大模型（Doubao）

**提示词全文：**

```text
创建运行后台的 bat 文件，在根目录下：启动 backend 下的 node app.js，保持窗口不关闭，并提示访问地址 http://localhost:8325。
```

**大模型名称：** 豆包大模型（Doubao）

---

## 2026-11-19 10:38 | 豆包大模型（Doubao）

**提示词全文：**

```text
创建 database.html 页面：输入用户名、密码，点击“连接数据库”调用后端 /api 接口，数据库使用 MySQL，成功和错误都有提示，默认用户名 root、密码 root。
页面显示接口链接、连接结果、服务器版本、主机名、目标库与数据表数量，并把接口返回数据与错误信息输出到浏览器控制台。
后端需提供 POST /api/database/test 接口，并在 backend/SUN_interface.md 追加记录。
```

**大模型名称：** 豆包大模型（Doubao）

---

## 2026-11-19 10:55 | 豆包大模型（Doubao）

**提示词全文：**

```text
完成科技新闻列表页面，新闻的数据存在数据库表 SUN_news 里（至少 8 条真实业务意义的测试数据）。
后端按 RESTful + MVC 创建 /api/news 接口，统一返回 { code, msg, data }。
前端新建 news.html，调用接口渲染列表，页面上显示后端接口链接和数据内容，并在 index.html 追加超链接入口。
追加 SUN_prompt.md、SUN_interface.md、SUN_database.md 记录。
```

**大模型名称：** 豆包大模型（Doubao）

---

## 2026-11-19 11:12 | 豆包大模型（Doubao）

**提示词全文：**

```text
完成图文列表：创建新表 SUN_gallery（标题、图片地址、简介、标签、创建时间），插入至少 8 条测试数据；
图片使用本地创建后放入 frontend/images/ 的图片；后端新增 /api/gallery 接口，前端新建 gallery.html 调用接口渲染，
页面显示接口链接和数据内容；在 index.html 追加超链接入口，并追加三份记录文件。
```

**大模型名称：** 豆包大模型（Doubao）

---

## 2026-11-19 14:42 | 豆包大模型（Doubao）

**提示词全文：**

```text
将今天 C:\高级网页设计案例\孙跃铭全栈开发 新建的项目代码上传到 https://github.com/sym1104/sunyueming1104.git
```

**大模型名称：** 豆包大模型（Doubao）

**补充说明：** 上传前移除 database.html 中的明文数据库密码（原「本机配置为 root / 123456」改为「凭据不写进代码，以 .env 为准」），并把本地两条提交整理为一条干净提交后推送。
---

## 2026-11-19 14:52 | 豆包大模型（Doubao）

**提示词全文：**

```text
创建技能 skill：提交到 GitHub，将C:\高级网页设计案例\孙跃铭全栈开发项目提交 commit 并 push 到 https://github.com/sym1104/sunyueming1104.git，使用已设置公钥。
```

**大模型名称：** 豆包大模型（Doubao）

**说明：** 技能创建于 `.user_skills/github-push`，主脚本 `scripts/SUN_push.ps1`；执行顺序为检查敏感文件 → commit → SSH 优先 / HTTPS 回退 → push（含重试）→ 远程 HEAD 校验。
---

## 2026-11-23 15:10 | 大模型：DeepSeek-V4.1-Flash

**时间：** 2026-11-23 15:10
**提示词全文：**
`
创建AI聊天页面。
Api-key：sk-venmhlwesjjnhyjvrbkiccekwrqsricaufjpuzxkdrwhsigm(自己的key)
curl --request POST --url https://api.siliconflow.cn/v1/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_API_KEY" -d '{"model":"deepseek-ai/DeepSeek-V4-Flash","messages":[{"role":"system","content":"你是一个有用的助手"},{"role":"user","content":"你好，请介绍一下你自己"}]}'
在控制台里输出发送给大模型的数据和从大模型接收到的数据。
`
**实现摘要：** 新建后端路由 backend/routes/SUN_chatRoutes.js 代理 SiliconFlow chat/completions（API Key 存 backend/.env，变量 SILICONFLOW_API_KEY / SILICONFLOW_BASE_URL / SILICONFLOW_MODEL）；SUN_apiRoutes.js 挂载 /chat 路由；新建前端 chat.html + js/SUN_chat.js + CSS 追加块；前端三层 console.log（前端 payload / 后端 SUN_request / 后端 SUN_response），后端终端固定打印两段 ====== [发给大模型] ====== + ====== [模型返回] ======。POST /api/chat 支持 question 或 messages 两种入参。

## 2026-11-23 16:30 | 大模型：DeepSeek-V4.1-Flash

**时间：** 2026-11-23 16:30
**提示词全文：**
```
完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地文件（如 PDF/TXT）上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。
```
**实现摘要：** 新建数据库表 SUN_knowledge_file / SUN_knowledge_chunk（SUN_initKnowledge.js 初始化）；新建 backend/services/SUN_knowledgeService.js（officeparser 解析 docx/pptx/pdf，word-extractor 解析 doc，pdf-parse 解析 pdf，txt 直接读；固定 500 字分块 + 60 overlap；简易 BM25 关键词打分 Top-K=8）；新建 backend/routes/SUN_knowledgeRoutes.js 四条路由（upload / files / files/:id DELETE / ask）；SUN_apiRoutes 挂载 /knowledge；新建前端 knowledge.html + js/SUN_knowledge.js + CSS 追加块；控制台三层日志 [RAG 上传] / [RAG 问答 发送给大模型] / [RAG 问答 从大模型接收]；后端终端固定两段 [发给大模型（RAG）] / [模型返回（RAG）]。种子文件 2 个 .txt 存于 backend/knowledge_seed/，上传后入库 13 个 chunk。
