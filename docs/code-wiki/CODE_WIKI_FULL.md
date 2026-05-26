# Code Wiki（完整单文件版）

面向本仓库当前可见的全部分支与代码。经检索，本仓库仅存在 `main`（本地与 `origin` 远端均只有该分支），因此“全分支扫描”的结论等同于对 `main` 的完整扫描。

仓库内容由两部分构成：

- 目标系统文档：根目录的需求/协作规划文件，描述「学院学生综合服务与党团管理平台」的目标范围与建议技术选型
- 可运行代码：`demoApp/`（微信小程序 Demo「记录本（待办）」+ 本地 Node.js 待办 API）

相关的多文件版 Code Wiki 已存在于 [docs/code-wiki](file:///workspace/docs/code-wiki)（`00-05` 系列文件）。本文档在其基础上做“单文件汇总 + 代码级关键函数说明”，并明确区分“规划/需求”与“已落地代码”。

---

## 1. 仓库结构

### 1.1 目录概览

- `demoApp/`：可运行代码（小程序端 + 本地 Node 服务端）
- `docs/code-wiki/`：已有的多文件版 Wiki（偏需求/规划 + demoApp 指引）
- 根目录 `*.md`：需求、沟通版、分工计划、资料清单等
- `产品需求文档.docx`：补充版 PRD（Word）

### 1.2 可运行代码结构（demoApp）

- 小程序入口
  - [app.js](file:///workspace/demoApp/app.js)：小程序启动逻辑（根据 session 自动跳转）
  - [app.json](file:///workspace/demoApp/app.json)：页面注册与窗口配置
  - `app.wxss`：全局样式
- 页面（WXML/WXSS/JS）
  - `pages/login/`：登录页（带 Network 教学请求 + 本地登录逻辑）
  - `pages/todos/`：待办页（以本地 Node 服务为唯一数据源）
  - `pages/network-demo/`：Network 面板练习（成功/失败对照）
- 工具
  - [utils/storage.js](file:///workspace/demoApp/utils/storage.js)：Storage 读写、session、简单 hash
- 本地服务端
  - [server/index.js](file:///workspace/demoApp/server/index.js)：Node.js 原生 `http` 模块实现的待办 CRUD API

---

## 2. 分支与版本结论

### 2.1 分支扫描结论

- 本地分支：`main`
- 远端分支：`origin/main`
- 未发现 `dev`、`feature-*` 等分支；仓库内 “分支策略” 仅存在于协作文档中（规划约定，非实际分支）

### 2.2 当前实现边界

目标系统（学生端/管理端/后端/数据库）在仓库内以文档形式存在，但没有对应工程骨架；当前唯一可运行实现是 `demoApp/` 的教学 Demo。

---

## 3. 整体架构（需求/规划 vs 当前实现）

### 3.1 目标系统（按需求定义，尚未在代码中落地）

来源参考：

- [需求文档-小组需求说明V1.md](file:///workspace/需求文档-小组需求说明V1.md)
- [需求文档-甲方沟通版B.md](file:///workspace/需求文档-甲方沟通版B.md)
- [四人分工与整体流程计划.md](file:///workspace/四人分工与整体流程计划.md)

目标系统的推荐形态：

- 学生端：微信小程序（文档建议使用 uni-app 以复用 Vue 语法）
- 管理端：PC Web 管理后台（文档建议 Vue 3 + Element Plus）
- 后端服务：统一 API、RBAC、文件处理、定时任务、审计
- 数据库：人大金仓 Kingbase（按 PostgreSQL 方式连接）

推荐后端分层（概念层面）：

- Controller（HTTP 接口层）：鉴权、参数校验、统一返回结构
- Service（业务层）：通知/流程/审批/导入导出/知识库
- Repository/DAO（数据访问层）：Kingbase 表与查询
- Infra（基础设施）：文件存储、任务调度、日志审计、加密

### 3.2 当前实现（demoApp：小程序 + 本地 Node API）

当前 demoApp 的真实架构是“前端小程序直连本地 Node API + 本地 Storage 辅助”：

- 小程序端：原生小程序（`App`/`Page` + `wx.request` + `wx.getStorageSync`）
- 服务端：单文件 Node.js HTTP Server（内存 store，重启即清空）
- 数据存储：
  - 服务端内存：按昵称隔离的 todo 列表（唯一真源）
  - 小程序 Storage：用户表、会话、历史旧版待办（首次会迁移到服务端）

---

## 4. 主要模块职责（当前可运行代码）

### 4.1 登录与会话（pages/login + utils/storage）

核心职责：

- 采集昵称/密码并做本地校验
- 先发起一笔教学用的 Network 请求（`httpbin.org`），用于在开发者工具 Network 面板观察请求细节
- 之后执行本地登录逻辑（自动注册或校验密码）并写入 session

关键实现：

- 登录页逻辑：`onLogin`、`doLocalLogin` in [login.js](file:///workspace/demoApp/pages/login/login.js#L36-L110)
- 本地用户表/会话存取：`loadUsers/saveUsers/getSession/setSession/clearSession` in [storage.js](file:///workspace/demoApp/utils/storage.js#L34-L77)
- 密码哈希（仅 Demo 级别）：`hashPassword` in [storage.js](file:///workspace/demoApp/utils/storage.js#L24-L32)

Storage 键约定（与 [demoApp/README.md](file:///workspace/demoApp/README.md#L14-L18) 一致）：

- `users:v1`：用户表 `{ [nickname]: { passwordHash, createdAt } }`
- `session:v1`：当前会话 `{ nickname, loginAt }`
- `todos:v1:<nickname>`：旧版本地待办（本版本以服务端为准，仅用于迁移）

### 4.2 待办（pages/todos + server）

核心职责：

- 待办的唯一数据源是服务端：列表、添加、删除均走 Node API
- 当服务端返回空列表且本地还有旧待办时，执行一次性迁移（`POST /todo/sync`），迁移后清空本地旧键

关键实现：

- 页面 onShow：读取 session 并触发拉取 in [todos.js](file:///workspace/demoApp/pages/todos/todos.js#L32-L43)
- 拉取列表 + 迁移逻辑：`fetchTodoList` in [todos.js](file:///workspace/demoApp/pages/todos/todos.js#L56-L119)
- 新增：`onAdd` → `POST /todo/add` in [todos.js](file:///workspace/demoApp/pages/todos/todos.js#L125-L157)
- 删除：`onDelete` → `DELETE /todo/item` in [todos.js](file:///workspace/demoApp/pages/todos/todos.js#L159-L188)
- 退出登录：`onLogout`（清 session 后回登录页）in [todos.js](file:///workspace/demoApp/pages/todos/todos.js#L190-L201)

### 4.3 Network 面板练习（pages/network-demo）

核心职责：

- 产生一笔“必然成功”的 HTTPS 请求与一笔“必然失败”的请求，便于对照观察 Network 面板与 `wx.request` 的 success/fail 行为

关键实现：

- `onRequestOk`：`GET https://httpbin.org/get` in [network-demo.js](file:///workspace/demoApp/pages/network-demo/network-demo.js#L12-L33)
- `onRequestFail`：请求 `.invalid` 保留域名，预期触发 fail in [network-demo.js](file:///workspace/demoApp/pages/network-demo/network-demo.js#L35-L56)

### 4.4 App 启动与自动跳转（app.js）

核心职责：

- 小程序启动时读取 session，若已登录则自动跳转到待办页

关键实现：

- `onLaunch` in [app.js](file:///workspace/demoApp/app.js#L6-L13)

---

## 5. 服务端 API（demoApp/server）

服务端文件：[server/index.js](file:///workspace/demoApp/server/index.js)

### 5.1 数据模型

服务端唯一数据结构：

- `todoStore: Record<string, Array<{ id, text, createdAt }>>`，key 为 `nickname`
  - 初始化与获取：`getList(nickname)` in [index.js](file:///workspace/demoApp/server/index.js#L37-L42)

### 5.2 通用能力

- CORS：`cors(res)` 设置允许跨域，支持小程序与 Postman 调试 in [index.js](file:///workspace/demoApp/server/index.js#L15-L19)
- JSON 响应封装：`json(res, status, obj)` in [index.js](file:///workspace/demoApp/server/index.js#L21-L26)
- Query 参数解析：`getNicknameFromUrl(rawUrl)` in [index.js](file:///workspace/demoApp/server/index.js#L28-L35)
- Body 读取与 JSON 解析：`readJsonBody(req)` in [index.js](file:///workspace/demoApp/server/index.js#L44-L62)

### 5.3 路由与接口约定

接口统一返回结构：

- 成功：`{ code: 0, message: "ok", nickname, data: [...] }`
- 失败：`{ code: 400|404, message: "...", ... }`

接口列表（与 [demoApp/README.md](file:///workspace/demoApp/README.md#L28-L39) 一致）：

- `GET /todo/list?nickname=`
  - 处理分支：`if (req.method === "GET" && path === "/todo/list")` in [index.js](file:///workspace/demoApp/server/index.js#L90-L94)
- `POST /todo/add?nickname=`（body: `{ "text": "..." }`）
  - 处理分支：`if (req.method === "POST" && path === "/todo/add")` in [index.js](file:///workspace/demoApp/server/index.js#L96-L118)
  - 生成 id：`t_${Date.now()}_${Math.random()...}` in [index.js](file:///workspace/demoApp/server/index.js#L106-L111)
- `POST /todo/sync?nickname=`（body: `{ "items": [{ id, text, createdAt }, ...] }` 全量覆盖）
  - 处理分支：`if (req.method === "POST" && path === "/todo/sync")` in [index.js](file:///workspace/demoApp/server/index.js#L120-L143)
- `DELETE /todo/item?nickname=&id=`
  - 处理分支：`if (req.method === "DELETE" && path === "/todo/item")` in [index.js](file:///workspace/demoApp/server/index.js#L145-L162)

错误处理要点：

- `/todo/*` 接口缺少 `nickname`：返回 400（统一在路由前置校验）in [index.js](file:///workspace/demoApp/server/index.js#L75-L88)
- JSON 解析失败：返回 400（`readJsonBody` reject/catch）in [index.js](file:///workspace/demoApp/server/index.js#L113-L115)

---

## 6. 依赖关系

### 6.1 demoApp（当前实际依赖）

- 运行时
  - 小程序端：微信小程序运行环境（`wx.*` API）
  - 服务端：Node.js（使用内置模块 `http`、`URL`、`Buffer`）
- 外部网络（教学用途）
  - `httpbin.org`：用于 Network 面板观察请求与响应
- 工程工具
  - 微信开发者工具配置：[project.config.json](file:///workspace/demoApp/project.config.json)
    - `setting.urlCheck: false`：开发者工具环境可绕过合法域名校验（便于演示；真机需按微信要求配置域名）

### 6.2 目标系统（规划依赖，仓库内未落地）

该部分属于需求/选型建议，详见多文件版 Wiki：

- [01-整体架构.md](file:///workspace/docs/code-wiki/01-整体架构.md)
- [04-依赖关系.md](file:///workspace/docs/code-wiki/04-依赖关系.md)

---

## 7. 运行与开发方式

### 7.1 运行 demoApp（当前唯一可运行内容）

1) 启动本地服务端（仓库根目录）

```bash
node demoApp/server/index.js
```

2) 微信开发者工具导入并运行小程序

- 导入目录：`demoApp/`
- 登录页：输入昵称与密码即可登录（Demo 逻辑：新用户自动注册；老用户校验密码）
- 待办页：增删查均请求 `http://localhost:3000`

3) Postman/浏览器验证服务端（可选）

- `GET http://localhost:3000/todo/list?nickname=zhangsan`

### 7.2 调试要点（demoApp）

- 若待办页请求失败：优先确认 Node 服务是否启动、端口是否为 3000、以及环境是否允许访问 `localhost`
- 若 Network 练习请求不可用：确认开发者工具允许外网访问；同时注意真机预览的合法域名要求

---

## 8. 目标系统模块清单（需求视角，便于后续落地对齐）

此部分用于把 demoApp 的“联调习惯”与“未来目标系统模块”对齐，避免误解 demoApp 已经实现目标系统。

一期模块（需求文档 A–E）：

- 模块A：政策/制度知识库与标准问答
- 模块B：党团事务流程管理（入党/入团）
- 模块C：通知与精准推送
- 模块D：电子证明生成与审批
- 模块E：导入导出

建议的关键领域对象与接口边界详见：

- [03-关键领域对象与接口.md](file:///workspace/docs/code-wiki/03-关键领域对象与接口.md)

