# 学院学生综合服务与党团管理平台 — 开发者文档

> 版本：V1.0  
> 适用：接手开发的工程师

---

## 目录

1. [项目架构](#1-项目架构)
2. [代码仓库](#2-代码仓库)
3. [本地开发环境](#3-本地开发环境)
4. [Server 部署](#4-服务器部署)
5. [数据库](#5-数据库)
6. [API 接口](#6-api-接口)
7. [小程序页面路由](#7-小程序页面路由)
8. [Web 管理端路由](#8-web-管理端路由)
9. [数据流](#9-数据流)
10. [常见维护操作](#10-常见维护操作)

---

## 1. 项目架构

```
                     ┌──────────────────────┐
                     │   微信小程序 (学生)     │
                     │   miniprogram/        │
                     │   TypeScript + Less   │
                     │   Skyline 渲染         │
                     └──────────┬───────────┘
                                │ wx.request
                                ▼
┌─────────────────────────────────────────────────┐
│              nginx :80                          │
│  /          → /home/user/admin-dist/            │
│  /api/      → proxy_pass http://127.0.0.1:3000  │
│  /files/    → /home/user/public/files/          │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│          Node.js :3000 (systemd)                │
│          backend/src/                           │
│  routes/ → controllers/ → services/ → db/       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│       PostgreSQL :54321 (Kingbase 兼容)          │
│       13 张业务表                                 │
└─────────────────────────────────────────────────┘
```

## 2. 代码仓库

- **GitHub**: `https://github.com/PiPi-mk/Software-Engineering`
- **分支**: `backend` (后端 + 管理端), `feature-pc-align-schema` (管理端增强)
- **本地工作目录**: `D:\software\`

```
D:\software\
├── miniprogram/          # 微信小程序
│   ├── pages/            # 13 个页面
│   ├── components/       # 3 个组件
│   ├── utils/            # 4 个工具模块
│   └── custom-tab-bar/   # 自定义 TabBar
├── admin-pc/             # Web 管理端 (Vue 3 + Element Plus)
│   └── src/
│       ├── views/        # 7 个页面
│       ├── api/          # API 函数封装
│       ├── router/       # Vue Router
│       └── utils/        # axios 封装
├── server/               # 部署脚本 + Python 模拟后端
│   ├── server.py         # Python Mock API (开发备用)
│   ├── sync_ruc.py       # RUC 公告同步脚本
│   └── public/files/     # 可下载文件
└── typings/              # TypeScript 类型定义
```

## 3. 本地开发环境

### 3.1 小程序

```bash
# 1. 用微信开发者工具打开 D:\software 目录
# 2. 详情 → 本地设置 → 勾选"不校验合法域名"
# 3. 编译运行

# 切换后端地址: miniprogram/utils/config.ts
currentEnv = 'dev'      # 连本地 localhost:3000
currentEnv = 'server'   # 连部署服务器 10.10.0.22
```

### 3.2 Web 管理端

```bash
cd D:\software\admin-pc
npm install              # 需先装 Node.js
npm run dev              # Vite 开发服务器 :5173
npm run build            # 生产构建 → dist/
```

### 3.3 后端

```bash
# 本地测试用 Python 模拟后端
python server/server.py  # :3000

# 生产用 Node.js 后端
cd backend && npm install && npx tsc && node dist/app.js
```

## 4. 服务器部署

服务器地址：`10.10.0.22` (Ubuntu 24.04, user/user)

### 4.1 部署命令

```bash
# 构建并部署管理端
cd D:\software\admin-pc && npm run build
cd dist && tar -czf /tmp/admin-dist.tar.gz .
scp /tmp/admin-dist.tar.gz user@10.10.0.22:/tmp/
ssh user@10.10.0.22 "
  rm -rf /home/user/admin-dist && mkdir -p /home/user/admin-dist
  cd /home/user/admin-dist && tar -xzf /tmp/admin-dist.tar.gz
"

# 部署后端代码
scp -r backend/src user@10.10.0.22:/home/user/Software-Engineering/backend/
ssh user@10.10.0.22 "
  cd /home/user/Software-Engineering/backend
  npx tsc
  sudo systemctl restart college-backend
"
```

### 4.2 服务管理

```bash
# 查看服务状态
sudo systemctl status college-backend
# 重启
sudo systemctl restart college-backend
# 查看日志
sudo journalctl -u college-backend -f
tail -f /tmp/node-backend.log
```

### 4.3 自动化脚本

| 脚本 | 用途 |
|------|------|
| `deploy2.py` / `deploy3.py` | 一键部署 |
| `setup_server.py` | 配置服务 |
| `setup_audit.py` | 审计日志 + 密码哈希 |
| `upload_dist.py` | 上传管理端产物 |
| `sync_ruc.py` | RUC 公告同步 (cron: `0 */6 * * *`) |

## 5. 数据库

- **类型**: PostgreSQL 16 (兼容人大金仓)
- **连接**: `host=127.0.0.1 port=54321 user=postgres password=2608760170wanG dbname=test`

### 5.1 表结构 (14 张表)

| 表 | 说明 |
|----|------|
| `syst_user` | 用户登录表（密码 bcrypt 哈希） |
| `student` | 学生档案表 |
| `notice` | 通知主表（含 external_source 支持外部同步） |
| `notice_read` | 通知已读记录 |
| `application` | 申请主表（form_data JSON） |
| `approval_log` | 审批日志 |
| `result_file` | 审批结果文件 |
| `process_def` | 流程定义（入党/入团） |
| `process_stage` | 流程阶段 |
| `student_process` | 学生流程进度 |
| `process_action_log` | 流程操作日志 |
| `policy_knowledge` | 政策知识库 |
| `import_export_job` | 导入导出任务 |
| `audit_log` | 操作审计日志 |

### 5.2 密码安全

所有密码使用 PostgreSQL `pgcrypto` 的 bcrypt 哈希存储：
```sql
crypt('admin123', gen_salt('bf'))
```
登录时后端 SQL 使用 `password = crypt($2, password)` 比对，不从数据库取回明文。

## 6. API 接口

- **Base URL**: `/api`
- **认证方式**: `Authorization: Bearer <JWT_TOKEN>` (24h 有效)
- **响应格式**: `{ code: 0, message: "ok", data: {...} }`

### 6.1 错误码

| code | 含义 |
|------|------|
| 0 | 成功 |
| 40001 | 参数缺失/格式错误 |
| 40101 | 未登录/Token 无效 |
| 40301 | 无权限 |
| 40401 | 资源不存在 |
| 40901 | 冲突（重复操作） |
| 50001 | 服务端内部错误 |

### 6.2 端点清单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/auth/login` | 公开 | 登录 |
| GET | `/auth/me` | 登录 | 当前用户信息（含学生档案） |
| GET | `/notices` | 登录 | 通知列表（分页） |
| GET | `/notices/:id` | 登录 | 通知详情 |
| POST | `/notices` | admin | 发布通知 |
| PUT | `/notices/:id` | admin | 编辑通知 |
| DELETE | `/notices/:id` | admin | 删除通知 |
| POST | `/notices/:id/read` | student | 标记已读 |
| GET | `/notices/:id/stats` | admin | 已读统计 |
| GET | `/applications` | 登录 | 申请列表（学生看自己，管理看全部） |
| GET | `/applications/:id` | 登录 | 申请详情 + 审批历史 |
| POST | `/applications` | student | 提交申请 |
| PUT | `/applications/:id/approval` | admin | 审批（通过/驳回/补交） |
| GET | `/process/:type/stages` | 登录 | 流程阶段列表 |
| GET | `/process/:type/my-progress` | student | 我的进度 |
| PUT | `/process/students/:id/progress` | admin | 更新学生进度 |
| GET | `/knowledge` | 登录 | 知识库列表 |
| POST | `/knowledge` | admin | 新建知识条目 |
| PUT | `/knowledge/:id` | admin | 编辑知识条目 |
| DELETE | `/knowledge/:id` | admin | 删除知识条目 |
| POST | `/knowledge/ask` | 登录 | AI 问答（占位） |
| GET | `/files` | 登录 | 文件列表 |
| POST | `/files/upload` | admin | 上传文件 |
| DELETE | `/files/:name` | admin | 删除文件 |
| GET | `/audit-logs` | 登录 | 操作日志 |

## 7. 小程序页面路由

| 页面路径 | 类型 | 说明 |
|---------|------|------|
| `pages/login/login` | 启动页 | 登录 |
| `pages/home/home` | Tab | 首页 |
| `pages/service/service` | Tab | 服务 |
| `pages/notices/notices` | Tab | 通知 |
| `pages/profile/profile` | Tab | 我的 |
| `pages/notice-detail/notice-detail` | 子页 | 通知详情 |
| `pages/knowledge/knowledge` | 子页 | 政策搜索 |
| `pages/knowledge-detail/knowledge-detail` | 子页 | 政策详情 |
| `pages/template-download/template-download` | 子页 | 模板下载 |
| `pages/process/process` | 子页 | 党团流程 |
| `pages/application-create/application-create` | 子页 | 提交申请 |
| `pages/application-list/application-list` | 子页 | 我的申请 |
| `pages/application-detail/application-detail` | 子页 | 申请详情 |

### 7.1 自定义 TabBar

`miniprogram/custom-tab-bar/index.*` — 4 个 Tab，选中态蓝色。每个 Tab 页面在 `onShow()` 中调用 `this.getTabBar().setData({ selected: N })` 同步状态。

### 7.2 请求封装

`miniprogram/utils/request.ts` — 统一处理：
- `config.baseURL` 前缀
- `Authorization: Bearer` token 注入
- 40101 自动清 token 跳登录
- loading 状态
- 错误 toast

### 7.3 环境切换

`miniprogram/utils/config.ts`:
```ts
const ENV = {
  dev:    { baseURL: 'http://localhost:3000/api',  fileURL: 'http://localhost:3000/files' },
  server: { baseURL: 'http://10.10.0.22/api',       fileURL: 'http://10.10.0.22/files' },
  prod:   { baseURL: 'https://api.example.com/api', fileURL: 'https://api.example.com/files' },
}
const currentEnv = 'server'
```

## 8. Web 管理端路由

| 路径 | 页面 | 功能 |
|------|------|------|
| `/login` | Login.vue | 登录 |
| `/notice` | NoticeManage.vue | 通知 CRUD + 附件上传 + 统计 |
| `/approval` | ApprovalWorkbench.vue | 审批工作台 |
| `/process` | ProcessConfig.vue | 党团流程配置 |
| `/import-export` | ImportExport.vue | 数据导入导出 |
| `/knowledge` | KnowledgeManage.vue | 知识库 CRUD + 模板上传 |
| `/audit-log` | AuditLog.vue | 操作日志查看 |

路由守卫：`router.beforeEach` — 无 token 跳 `/login`，有 token 直接进。

## 9. 数据流

### 9.1 通知闭环

```
管理员 [发布通知] → POST /api/notices → notice 表
                                          ↓
学生 [打开小程序] → GET /api/notices → 列表 (read=false)
学生 [点开通知] → GET /api/notices/:id + POST /:id/read
学生 [返回列表] → GET /api/notices → 列表 (read=true, 红点消失)
管理员 [已读统计] → GET /api/notices/:id/stats
```

### 9.2 申请审批闭环

```
学生 [提交申请] → POST /api/applications → application 表 (status=待审批)
管理员 [审批台] → GET /api/applications → 待审批列表
管理员 [审批] → PUT /api/applications/:id/approval
              → BEGIN TRANSACTION
              → UPDATE application SET status
              → INSERT INTO approval_log
              → COMMIT
学生 [刷新] → GET /api/applications → 状态已更新
```

### 9.3 文件上传下载

```
管理员 [选文件] → FormData → POST /api/files/upload
              → multer → 写入 /home/user/public/files/
学生 [模板下载] → GET /files/xxx → nginx alias → 直接返回文件
```

## 10. 常见维护操作

### 更新 RUC Cookie
编辑 `/home/user/sync_ruc.py`，替换 `RUC_COOKIE` 变量。Cookie 有效期约 24-48 小时。

### 重置管理端密码
```sql
UPDATE syst_user SET password = crypt('newpassword', gen_salt('bf')) WHERE username = 'admin';
```

### 重建前端
```bash
cd D:\software\admin-pc && npm run build
# 上传 dist/ 到 /home/user/admin-dist/
```

### 重启后端
```bash
ssh user@10.10.0.22 "sudo systemctl restart college-backend"
```

### 查看 PostgreSQL 数据
```bash
ssh user@10.10.0.22
PGPASSWORD=2608760170wanG psql -h 127.0.0.1 -p 54321 -U postgres -d test
```

### 添加新页面（小程序）
1. 在 `miniprogram/pages/` 下创建目录和 4 个文件 (ts/wxml/less/json)
2. 在 `app.json` 的 `pages` 数组中注册
3. 如果是 Tab，在 `custom-tab-bar/index.ts` 中添加入口

### 添加新 API 端点（后端）
1. 在 `backend/src/controllers/` 创建 Controller
2. 在 `backend/src/routes/` 创建路由文件
3. 在 `backend/src/app.ts` 中 `app.use('/api/xxx', xxxRoutes)`
4. `npx tsc && sudo systemctl restart college-backend`
