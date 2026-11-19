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