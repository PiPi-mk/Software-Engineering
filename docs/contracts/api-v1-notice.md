# API v1：通知闭环（全员通知 + 测试账号）

## 基本约定

- Base URL：`/api`
- 认证方式：`Authorization: Bearer <token>`
- 返回格式：见 [errors.md](./errors.md)
- 角色：
  - `admin`：管理端（发布通知、看统计）
  - `student`：学生端（拉取、查看、标记已读）

## 一期测试账号（建议）

一期先用测试账号表（可由后端预置在内存/配置文件中）：

- 管理员：`admin` / `admin123`
- 学生：`student1` / `student123`，`student2` / `student123`

## 数据结构（v1）

### Notice

```json
{
  "id": "n_123",
  "title": "关于...",
  "content": "正文...",
  "publisherId": "u_admin",
  "publishedAt": 1716630000000,
  "createdAt": 1716630000000
}
```

### NoticeSummary（列表展示）

```json
{
  "id": "n_123",
  "title": "关于...",
  "publishedAt": 1716630000000,
  "read": false
}
```

## Auth

### POST /api/auth/login

说明：测试账号登录，返回 token 与当前用户信息。

请求：

```json
{ "username": "admin", "password": "admin123" }
```

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "t_xxx",
    "user": { "id": "u_admin", "username": "admin", "role": "admin" }
  }
}
```

失败响应：

```json
{ "code": 40101, "message": "用户名或密码错误", "data": null }
```

### GET /api/auth/me

说明：用于前端启动时校验 token 并获取用户信息。

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": { "id": "u_admin", "username": "admin", "role": "admin" }
}
```

## Notice（通知）

### POST /api/notices

权限：`admin`

说明：发布一条全员通知。

请求：

```json
{ "title": "标题", "content": "正文" }
```

成功响应：

```json
{ "code": 0, "message": "ok", "data": { "id": "n_123" } }
```

错误：

- `40001`：缺少 `title`/`content`
- `40301`：非管理员

### GET /api/notices?page=1&pageSize=20

权限：`student` / `admin`

说明：获取通知列表（学生端需要包含“是否已读”）。

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "list": [
      { "id": "n_2", "title": "第二条", "publishedAt": 1716630100000, "read": true },
      { "id": "n_1", "title": "第一条", "publishedAt": 1716630000000, "read": false }
    ]
  }
}
```

### GET /api/notices/:id

权限：`student` / `admin`

说明：获取通知详情（不自动标记已读，避免“打开详情页即已读”的争议；由前端显式调用 read 接口）。

成功响应：

```json
{ "code": 0, "message": "ok", "data": { "id": "n_1", "title": "标题", "content": "正文", "publisherId": "u_admin", "publishedAt": 1716630000000, "createdAt": 1716630000000 } }
```

错误：

- `40401`：通知不存在

### POST /api/notices/:id/read

权限：`student`

说明：标记已读（要求幂等：重复调用不报错）。

请求：空 body

成功响应：

```json
{ "code": 0, "message": "ok", "data": { "readAt": 1716630200000 } }
```

错误：

- `40401`：通知不存在
- `40301`：非学生

### GET /api/notices/:id/stats

权限：`admin`

说明：管理端查看通知统计（一期只做“已读数/总人数/未读数”）。

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": { "noticeId": "n_1", "total": 2, "readCount": 1, "unreadCount": 1 }
}
```

