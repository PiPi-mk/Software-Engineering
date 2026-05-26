# 后端目录结构与约定（Express + TS）

本节定义“代码结构与约定”，让闭环1在 Express 上也能保持清晰分层，方便后续扩展到流程、审批、导入导出与提醒任务。

## 推荐目录结构

以 `backend/` 作为后端工程根目录（建议在 `dev` 集成分支落地工程骨架）：

```text
backend/
  src/
    app.ts
    server.ts
    config/
      env.ts
    routes/
      index.ts
      auth.routes.ts
      notice.routes.ts
    controllers/
      auth.controller.ts
      notice.controller.ts
    services/
      auth.service.ts
      notice.service.ts
      noticeRead.service.ts
    repositories/
      user.repo.ts
      notice.repo.ts
      noticeRead.repo.ts
    middlewares/
      auth.middleware.ts
      rbac.middleware.ts
      error.middleware.ts
    utils/
      response.ts
      validate.ts
    types/
      request.d.ts
  package.json
  tsconfig.json
  .env.example
```

## 分层职责

- routes
  - 只负责路由拼装与中间件挂载，不写业务逻辑。
- controllers
  - 只做参数读取与基础校验、调用 service、返回统一格式。
- services
  - 承载业务规则（例如：发布通知、已读上报幂等、统计聚合）。
- repositories
  - 只负责数据访问（一期可先内存实现，二期落地 Kingbase）。
- middlewares
  - 鉴权、RBAC、统一异常处理。

## 权限校验位置（强制约定）

- `auth.middleware.ts`：解析 `Authorization: Bearer <token>`，将 `req.user` 注入请求上下文。
- `rbac.middleware.ts`：基于 `req.user.role` 做接口级别权限控制。
- service 内仍可做“对象级权限”校验（例如：学生只能标记自己已读）。

## 统一响应工具（模板）

建议提供 `utils/response.ts`，统一返回结构：

```ts
export type ApiResponse<T> = { code: number; message: string; data: T }

export function ok<T>(data: T, message = 'ok'): ApiResponse<T> {
  return { code: 0, message, data }
}

export function fail(message: string, code: number, data: null = null): ApiResponse<null> {
  return { code, message, data }
}
```

## 测试账号策略（一期）

一期允许用“测试账号表”替代微信登录绑定：

- userRepo 支持预置用户（admin 与若干学生）
- `POST /api/auth/login` 用用户名/密码换 token
- token 可先用简单实现（例如随机字符串 + 内存表），但接口契约保持不变，后续可替换为 JWT 或接入统一鉴权

