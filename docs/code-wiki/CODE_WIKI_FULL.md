# Code Wiki（完整单文件版：覆盖全部远端分支）

本文档覆盖本仓库远端 `origin` 下的全部分支。之前本地仓库的 fetch 规则仅拉取 `main`，导致分支列表不完整；现已拉取并逐一检索全部分支内容，并在文档中按“分支 → 子工程/模块”进行归纳。

为便于对多分支文件做可点击引用，本地生成了分支快照目录（Git worktree）：

- `main/dev` 快照：[/workspace/.branch-worktrees/main](file:///workspace/.branch-worktrees/main)、[/workspace/.branch-worktrees/dev](file:///workspace/.branch-worktrees/dev)
- `backend` 快照：[/workspace/.branch-worktrees/backend](file:///workspace/.branch-worktrees/backend)
- `new_backend` 快照：[/workspace/.branch-worktrees/new_backend](file:///workspace/.branch-worktrees/new_backend)
- `feature/notice-contracts-v1` 快照：[/workspace/.branch-worktrees/feature_notice_contracts](file:///workspace/.branch-worktrees/feature_notice_contracts)
- `feature/phase1-integration-kit` 快照：[/workspace/.branch-worktrees/phase1_integration_kit](file:///workspace/.branch-worktrees/phase1_integration_kit)
- `feature-pc-align-schema` 快照：[/workspace/.branch-worktrees/feature_pc_align_schema](file:///workspace/.branch-worktrees/feature_pc_align_schema)

---

## 1. 分支清单与差异

### 1.1 远端分支（origin）

核心业务相关分支与内容分布如下（按“子工程”维度归纳）：

- `origin/main`：仅 `demoApp/`（小程序 Demo + 本地 Node 待办 API）+ `docs/code-wiki/` 与根目录需求文档
- `origin/dev`：与 `origin/main` 基本一致（同为 demoApp + 文档）
- `origin/backend`：`admin-pc/`（Vue3 管理端）+ `backend/`（Express+TS 后端）+ `docs/code-wiki/`
- `origin/new_backend`：仅后端（项目根 `src/` 结构，等价于 `origin/backend/backend/` 的扁平化版本）
- `origin/feature/notice-contracts-v1`：在 `demoApp` 基础上新增 `docs/contracts/`（通知闭环契约文档）
- `origin/feature/phase1-integration-kit`：`backend/`（一期闭环骨架版后端）+ `demoApp/` + `docs/contracts/`
- `origin/feature-pc-align-schema`：仅 `admin-pc/`（加入 axios、API typings、页面与契约对齐），并移除了后端目录
- `origin/trae/solo-agent-admCND`：仅新增单文件 Wiki（本文件）
- `origin/trae/solo-agent-jxBH5V`：与 `origin/backend` 类似（admin-pc + 后端），用于自动化产出/试验

结论：仓库是“多子工程 + 多条演进分支”的形态，不同分支保存了不同阶段/不同端的代码，并非单一 `main`。

---

## 2. 仓库整体架构（跨分支汇总）

从“全分支合并视角”看，仓库目标是形成一个三端架构：

- 学生端：微信小程序（现有 demoApp 为教学/原型）
- 管理端：PC Web（Vue 3 + Element Plus）
- 后端：Express + TypeScript（对接 Kingbase/PG，提供鉴权、通知、流程、审批、知识库、导入导出等 API）

当前各端所在分支：

- 小程序 Demo：`origin/main` / `origin/dev` / `origin/feature/phase1-integration-kit`
- 管理端：`origin/backend` / `origin/feature-pc-align-schema`
- 后端：`origin/backend` / `origin/new_backend` / `origin/feature/phase1-integration-kit`
- 契约文档：`origin/feature/notice-contracts-v1` / `origin/feature/phase1-integration-kit`

---

## 3. 子工程一：微信小程序 Demo（demoApp）

参考分支快照：[/workspace/.branch-worktrees/main/demoApp](file:///workspace/.branch-worktrees/main/demoApp)

### 3.1 模块划分

- 小程序入口
  - [app.js](file:///workspace/.branch-worktrees/main/demoApp/app.js)
  - [app.json](file:///workspace/.branch-worktrees/main/demoApp/app.json)
- 页面
  - 登录页：[/pages/login](file:///workspace/.branch-worktrees/main/demoApp/pages/login)
  - 待办页：[/pages/todos](file:///workspace/.branch-worktrees/main/demoApp/pages/todos)
  - Network 练习页：[/pages/network-demo](file:///workspace/.branch-worktrees/main/demoApp/pages/network-demo)
- 工具
  - Storage： [storage.js](file:///workspace/.branch-worktrees/main/demoApp/utils/storage.js)
- 本地服务端
  - 待办 API： [server/index.js](file:///workspace/.branch-worktrees/main/demoApp/server/index.js)

### 3.2 关键函数与数据流

- 登录链路
  - UI 输入 → `onLogin` 发起演示请求 → `doLocalLogin` 本地注册/校验 → 写入 session → `wx.reLaunch`
  - 入口实现：[login.js:L64-L111](file:///workspace/.branch-worktrees/main/demoApp/pages/login/login.js#L64-L111)
- 待办链路（服务端为唯一真源）
  - `onShow` 读取 session → `fetchTodoList` 拉取服务端列表；若服务端为空且本地有旧数据则 `POST /todo/sync` 迁移
  - 拉取/迁移实现：[todos.js:L32-L119](file:///workspace/.branch-worktrees/main/demoApp/pages/todos/todos.js#L32-L119)
- 本地服务端（Node 原生 http + 内存 store）
  - 路由与校验：[/server/index.js:L64-L165](file:///workspace/.branch-worktrees/main/demoApp/server/index.js#L64-L165)

---

## 4. 子工程二：后端（Express + TypeScript）

本仓库存在两种后端形态：

- 完整功能版（模块齐全，带 Controller/Service/Route 分层）：`origin/backend`（目录 `backend/`）
- 骨架版（一期闭环最小框架 + 统一返回/错误中间件）：`origin/feature/phase1-integration-kit`（目录 `backend/`）
- 扁平化版：`origin/new_backend`（根目录 `src/`，代码结构与完整功能版基本一致）

### 4.1 完整功能版后端（origin/backend）

参考分支快照：[/workspace/.branch-worktrees/backend/backend](file:///workspace/.branch-worktrees/backend/backend)

#### 4.1.1 入口与路由挂载

- 应用入口：[app.ts:L1-L24](file:///workspace/.branch-worktrees/backend/backend/src/app.ts#L1-L24)
  - 绑定 `cors` 与 `express.json()`
  - 路由前缀：
    - `/api/notices`
    - `/api/auth`
    - `/api/process`
    - `/api/applications`
    - `/api/knowledge`

#### 4.1.2 鉴权中间件

- JWT 校验：`authenticate` in [auth.ts:L8-L29](file:///workspace/.branch-worktrees/backend/backend/src/middlewares/auth.ts#L8-L29)
  - 约定：`Authorization: Bearer <token>`
  - 解析后的用户信息挂到 `req.user`
  - 注意：当前实现将密钥常量写在代码里；建议改为环境变量注入，避免泄露风险

#### 4.1.3 通知模块（Notice）

- 路由层：通知模块全量加鉴权拦截，通知 CRUD + 已读/统计在同一 Router 中
  - [notice.ts:L1-L22](file:///workspace/.branch-worktrees/backend/backend/src/routes/notice.ts#L1-L22)
- Controller（接口编排 + 权限校验 + 返回结构）
  - 列表/详情/创建/修改/删除/已读/统计： [noticeController.ts:L4-L175](file:///workspace/.branch-worktrees/backend/backend/src/controllers/noticeController.ts#L4-L175)
  - 典型权限策略：
    - 创建/修改/删除/统计：`admin`
    - 已读：`student`
- Service（SQL 与数据库访问）
  - 分页列表（学生带 is_read，管理员固定 false）：[noticeService.ts:L5-L40](file:///workspace/.branch-worktrees/backend/backend/src/services/noticeService.ts#L5-L40)
  - 已读幂等：利用 `ON CONFLICT (notice_id, student_id)`：[noticeService.ts:L76-L88](file:///workspace/.branch-worktrees/backend/backend/src/services/noticeService.ts#L76-L88)

#### 4.1.4 流程模块（Process）

- Service 侧使用事务保证“更新进度 + 写入日志留痕”强一致性：
  - [processService.ts:L55-L99](file:///workspace/.branch-worktrees/backend/backend/src/services/processService.ts#L55-L99)

#### 4.1.5 审批模块（Application）

- 申请提交：将 `formData/attachments` JSON 化存入 DB：[applicationService.ts:L5-L21](file:///workspace/.branch-worktrees/backend/backend/src/services/applicationService.ts#L5-L21)
- 审批操作：事务内更新主表状态、写审批日志、（通过时）写入模拟结果文件路径：[applicationService.ts:L75-L127](file:///workspace/.branch-worktrees/backend/backend/src/services/applicationService.ts#L75-L127)

### 4.2 骨架版后端（origin/feature/phase1-integration-kit）

参考分支快照：[/workspace/.branch-worktrees/phase1_integration_kit/backend](file:///workspace/.branch-worktrees/phase1_integration_kit/backend)

- App 构建：`buildApp` in [app.ts:L6-L17](file:///workspace/.branch-worktrees/phase1_integration_kit/backend/src/app.ts#L6-L17)
- 路由示例：`GET /api/health` in [routes/index.ts:L4-L11](file:///workspace/.branch-worktrees/phase1_integration_kit/backend/src/routes/index.ts#L4-L11)
- 统一返回：`ok/fail` in [response.ts:L1-L13](file:///workspace/.branch-worktrees/phase1_integration_kit/backend/src/utils/response.ts#L1-L13)
- 统一错误中间件： [error.middleware.ts:L4-L11](file:///workspace/.branch-worktrees/phase1_integration_kit/backend/src/middlewares/error.middleware.ts#L4-L11)

---

## 5. 子工程三：管理端（admin-pc：Vue 3 + Element Plus）

管理端存在两个主要形态：

- 纯 UI mock 版：`origin/backend` 的 `admin-pc/`（页面内置 mock 数据，未接后端）
- 契约对齐/联调版：`origin/feature-pc-align-schema` 的 `admin-pc/`（axios + typed API + 拦截器）

### 5.1 路由与页面

纯 UI 版（origin/backend 快照）：

- Vue Router： [router/index.ts:L1-L28](file:///workspace/.branch-worktrees/backend/admin-pc/src/router/index.ts#L1-L28)
  - `/notice`：通知管理
  - `/approval`：审批工作台

契约对齐版（feature-pc-align-schema 快照）：

- Layout 菜单扩展（通知/审批/流程/导入导出）：[Layout.vue:L8-L13](file:///workspace/.branch-worktrees/feature_pc_align_schema/admin-pc/src/views/Layout.vue#L8-L13)
- 通知管理页改为真实请求：
  - API 调用入口：[NoticeManage.vue:L21-L109](file:///workspace/.branch-worktrees/feature_pc_align_schema/admin-pc/src/views/NoticeManage.vue#L21-L109)

### 5.2 API 访问层（axios）

- axios 实例与拦截器（自动注入 token，统一处理 `{code,message,data}`）：[request.ts:L4-L41](file:///workspace/.branch-worktrees/feature_pc_align_schema/admin-pc/src/utils/request.ts#L4-L41)
- 通知模块 API typings 与方法： [notice.ts:L3-L65](file:///workspace/.branch-worktrees/feature_pc_align_schema/admin-pc/src/api/notice.ts#L3-L65)

---

## 6. 契约文档（docs/contracts）

参考分支快照：[/workspace/.branch-worktrees/feature_notice_contracts/docs/contracts](file:///workspace/.branch-worktrees/feature_notice_contracts/docs/contracts)

核心文档：

- 通知闭环 API v1： [api-v1-notice.md](file:///workspace/.branch-worktrees/feature_notice_contracts/docs/contracts/api-v1-notice.md)
- 错误码与返回规范： [errors.md](file:///workspace/.branch-worktrees/feature_notice_contracts/docs/contracts/errors.md)

该契约与后端 `origin/backend` 的实现高度一致（同样的路由前缀与错误码语义），并被 `feature-pc-align-schema` 的管理端调用层对齐（例如 `getNoticeList/createNotice/getNoticeStats`）。

---

## 7. 依赖关系（跨分支汇总）

### 7.1 demoApp

- 微信小程序运行环境（`wx.*`）
- 本地 Node 服务端（Node.js 内置 `http`）

### 7.2 后端（完整功能版）

参考 [backend/package.json](file:///workspace/.branch-worktrees/backend/backend/package.json)：

- Web 框架：Express
- 跨域：cors
- JWT：jsonwebtoken
- DB：pg（以 PostgreSQL 方式连接 Kingbase）
- 开发：TypeScript + ts-node + nodemon

### 7.3 管理端（契约对齐版）

参考 [admin-pc/package.json](file:///workspace/.branch-worktrees/feature_pc_align_schema/admin-pc/package.json)：

- Vue 3、Vue Router、Element Plus
- axios（用于联调后端 API）
- Vite（开发/构建）

---

## 8. 运行方式（按子工程）

### 8.1 运行 demoApp（origin/main）

1) 启动本地 Node 待办服务：

```bash
node /workspace/.branch-worktrees/main/demoApp/server/index.js
```

2) 微信开发者工具导入目录：`/workspace/.branch-worktrees/main/demoApp`

### 8.2 运行后端（origin/backend）

```bash
cd /workspace/.branch-worktrees/backend/backend
npm install
npm run dev
```

说明：

- 默认监听端口为 3000（见 [app.ts:L22-L24](file:///workspace/.branch-worktrees/backend/backend/src/app.ts#L22-L24)）
- DB 连接参数目前写在代码里（见 `db/index.ts`）；建议在真实环境中改为读取环境变量（避免把敏感信息写入仓库）

### 8.3 运行管理端（feature-pc-align-schema）

```bash
cd /workspace/.branch-worktrees/feature_pc_align_schema/admin-pc
npm install
npm run dev
```

说明：

- `request.ts` 的 `baseURL` 为 `/api`：[request.ts:L4-L7](file:///workspace/.branch-worktrees/feature_pc_align_schema/admin-pc/src/utils/request.ts#L4-L7)
- 本地开发需要 Vite 代理把 `/api` 转发到后端（可在 `vite.config.ts` 中配置）
