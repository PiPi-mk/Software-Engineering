## 微信小程序 Demo：记录本（待办）

### 功能
- **登录**：输入昵称和密码即可登录（Demo 逻辑：新用户自动注册；老用户密码校验通过即可登录）。**点击「登录」会先发起一次与教程类似的 `wx.request`（POST + JSON 账号密码），便于在 Network 里观察**；随后再执行本地登录逻辑。
- **待办**：登录后在 **本地 Node 服务** 中按昵称隔离存储；**小程序与 Postman GET 列表一致**。若你曾用过旧版仅本地 Storage 的待办，**首次进入待办页**会自动 `POST /todo/sync` 把旧数据迁到服务端并清空该用户的本地待办键。

### 运行方式
1. 打开微信开发者工具
2. 选择“导入项目”
3. 目录选择当前文件夹（本项目根目录）
4. AppID 可选用测试号/无 AppID（按你的环境选择）
5. 编译运行后，先在登录页输入昵称和密码登录

### 本地存储说明（仅 Demo）
- `users:v1`：用户表（`{ [nickname]: { passwordHash, createdAt } }`）
- `session:v1`：当前会话（`{ nickname, loginAt }`）
- `todos:v1:<nickname>`：旧版本地待办（**当前逻辑以服务端为准**；迁移成功后该键会被清空）

### 按教程演示 Network（与图中步骤对应）

1. 打开微信开发者工具，切到 **调试器 → Network**（可先清空列表）。
2. 回到模拟器 **登录页**，输入昵称、密码，点击 **「登录」**（对应教程「触发请求」）。
3. 再回到 **Network**，找到发往 **`https://httpbin.org/post`** 的请求（等价于教程里的 `https://example.com/login` POST；本 Demo 用 httpbin 便于返回可读的回显数据）。
4. 点开该条请求，查看 **Request Method**（应为 POST）、**请求体**（含 `username`、`password` 字段）、**响应**（httpbin 会回显你提交的内容）。Console 中也会有 `[Network 登录演示]` 日志。

**说明**：真实业务请勿把明文密码发到第三方；此处仅用于本地/课堂演示 Network。项目已设置 `urlCheck: false` 方便模拟器调试；**真机预览**需在小程序后台将 `httpbin.org` 配为 request 合法域名（或按官方说明使用开发环境）。

### 本地待办接口（Postman 与小程序同源）

先执行：`node server/index.js`（保持终端不关）。**所有接口均需 query：`nickname=你的昵称`**。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/todo/list?nickname=` | 拉取该用户待办列表（与小程序列表一致） |
| POST | `/todo/add?nickname=` | Body JSON：`{"text":"待办内容"}`，在列表头部新增一条 |
| POST | `/todo/sync?nickname=` | Body JSON：`{"items":[{id,text,createdAt},...]}`，全量覆盖该用户列表 |
| DELETE | `/todo/item?nickname=&id=` | 按 `id` 删除一条 |

**Postman 示例**：`GET http://localhost:3000/todo/list?nickname=zhangsan` 查看 zhangsan 的待办；在小程序里增删后 **再发同一 GET** 即可看到更新（数据在服务端内存，**重启 Node 会清空**）。

微信开发者工具：**详情 → 本地设置** 勾选 **不校验合法域名**；待办页的增删查均走上述 `localhost:3000`。

### 额外：Network 专项页（成功 / 失败对照）

- 登录页底部 **「Network 面板练习（wx.request）」** 可进入 `pages/network-demo`。
- **成功**：`GET https://httpbin.org/get`；**失败**：无效域名，预期走 `fail`。

