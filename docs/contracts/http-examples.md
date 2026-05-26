# 接口联调示例（curl）

约定：

- Base URL：`http://localhost:3000/api`
- Header：`Authorization: Bearer <token>`
- 返回格式见 [errors.md](./errors.md)

## 1) 健康检查

```bash
curl -s http://localhost:3000/api/health
```

## 2) 登录（管理员）

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

将响应中的 `data.token` 复制为 `ADMIN_TOKEN`。

## 3) 发布通知（管理员）

```bash
curl -s -X POST http://localhost:3000/api/notices \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{"title":"一期联调通知","content":"这是一条全员通知，用于闭环1联调。"}'
```

将响应中的 `data.id` 复制为 `NOTICE_ID`。

## 4) 登录（学生A）

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"student1","password":"student123"}'
```

将响应中的 `data.token` 复制为 `STUDENT_TOKEN`。

## 5) 拉取通知列表（学生A）

```bash
curl -s "http://localhost:3000/api/notices?page=1&pageSize=20" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}"
```

## 6) 通知详情（学生A）

```bash
curl -s "http://localhost:3000/api/notices/${NOTICE_ID}" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}"
```

## 7) 标记已读（学生A）

```bash
curl -s -X POST "http://localhost:3000/api/notices/${NOTICE_ID}/read" \
  -H "Authorization: Bearer ${STUDENT_TOKEN}"
```

重复调用应保持幂等，仍返回成功。

## 8) 统计（管理员）

```bash
curl -s "http://localhost:3000/api/notices/${NOTICE_ID}/stats" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

