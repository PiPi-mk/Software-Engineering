# 答辩技术细节 Q&A（Top 30）

> 目标：用于课程答辩的技术追问准备，答案偏口语化且包含可引用的实现证据（文件与行号）。  
> 使用建议：每题回答控制在 20–40 秒，顺序建议按“结论一句话 → 证据点 → 边界与改进”。

---

## 1 系统架构与技术选型

### Q1：为什么做成“小程序 + Web 管理端”双端？

- A：学生高频操作适合小程序随时用；老师/管理员的批量管理、表格操作更适合 Web 后台；两端通过统一接口层联动，形成闭环。
- 证据：
  - 小程序页面入口：[app.json](file:///workspace/local-deploy/new_v2.0/miniprogram/app.json#L2-L16)
  - 管理端路由结构：[router/index.ts](file:///workspace/local-deploy/new_v2.0/admin-pc/src/router/index.ts#L5-L59)
- 边界与改进：演示环境优先保证闭环可跑通；后续可接入更完整的数据持久化与权限体系。

### Q2：你们的“接口层”具体解决了什么问题？

- A：把双端的数据交互标准化：统一 URL 前缀、统一鉴权方式（Bearer Token）、统一返回结构（code/message/data），让小程序和 Web 都按一致规则调用。
- 证据：
  - 小程序请求封装：[request.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/request.ts#L35-L86)
  - 后端统一返回结构：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L41-L49)
- 边界与改进：可进一步用 OpenAPI/Swagger 规范化接口文档。

### Q3：为什么 Web 管理端用 Vue3 + Element Plus + Vite？

- A：Vue3 组合式 API 适合组件化开发；Element Plus 提供成熟表格/表单/弹窗组件；Vite 启动快、代理配置方便联调。
- 证据：
  - 路由和页面划分：[router/index.ts](file:///workspace/local-deploy/new_v2.0/admin-pc/src/router/index.ts#L5-L59)
- 边界与改进：后续可补统一的错误拦截、表单校验策略与更细粒度权限控制。

### Q4：小程序端为什么用 TypeScript + Less？

- A：TS 能在编译期减少类型错误（尤其是接口字段和页面状态），Less 让样式组织更清晰。
- 证据：
  - 项目配置启用 TS/Less 编译插件：[project.config.json](file:///workspace/local-deploy/new_v2.0/project.config.json#L5-L9)
- 边界与改进：可补充更严格的类型定义，减少 any。

---

## 2 登录、鉴权与会话

### Q5：登录流程是怎样的？

- A：前端调用 `/api/auth/login` 获取 token；token 存 storage；后续请求自动带 `Authorization: Bearer <token>`；后端用 token 映射用户身份。
- 证据：
  - 登录接口：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L129-L137)
  - 小程序登录封装：[auth.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/auth.ts#L23-L29)
  - 小程序请求自动带 token：[request.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/request.ts#L37-L49)
- 边界与改进：当前 token 为演示用内存 token；后续可接 JWT/数据库会话、加过期与刷新机制。

### Q6：未登录怎么处理？

- A：Web 端路由守卫检测 localStorage token，未登录强制跳转 `/login`；小程序端请求遇到 `40101` 会清 token 并跳登录页。
- 证据：
  - Web 路由守卫：[router/index.ts](file:///workspace/local-deploy/new_v2.0/admin-pc/src/router/index.ts#L64-L77)
  - 小程序 401 处理：[request.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/request.ts#L58-L63)
  - 后端 401 code 用法：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L87-L90)
- 边界与改进：可补“token 过期提示”和“自动刷新”。

### Q7：你们的权限控制做到了什么程度？

- A：实现了最基础的“角色鉴权 + 接口端拦截”。例如发布通知要求 admin 角色，否则返回权限不足。
- 证据：
  - 发布通知鉴权逻辑：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L138-L142)
- 边界与改进：目前是粗粒度角色；后续可扩展到 RBAC（功能点级别权限）与数据范围权限（按学院/班级）。

---

## 3 接口返回与错误处理

### Q8：你们的接口返回为什么有 code/message/data？

- A：为了统一前端处理逻辑：code=0 表示成功；非 0 表示业务错误；message 用于提示；data 是有效载荷。
- 证据：
  - 后端统一返回：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L41-L49)
  - 前端按 code 判断：[request.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/request.ts#L55-L71)
- 边界与改进：可以定义更细的错误码表并写进接口文档。

### Q9：前端如何处理网络异常？

- A：小程序端对网络 fail 和非 200 统一 toast；Web 端在页面 catch 中提示，保证用户能得到明确反馈。
- 证据：
  - 小程序网络 fail 处理：[request.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/request.ts#L88-L96)
- 边界与改进：可加入错误日志上报与统一错误提示组件。

---

## 4 环境切换与部署联调

### Q10：小程序怎么切换本地/远程环境？

- A：通过配置文件的 `currentEnv` 切换 baseURL 和 fileURL，本地 dev 指向 `localhost:3000`，远程 server 指向 `10.10.0.22`。
- 证据：
  - 环境配置：[config.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/config.ts#L5-L16)
- 边界与改进：后续可改成构建注入或在开发者工具编译条件中切换。

### Q11：为什么真机预览时不能用 localhost？

- A：真机上的 localhost 指手机本机，不是电脑；需要改成电脑局域网 IP，并确保端口可访问。
- 证据：
  - dev 环境默认是 localhost：[config.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/config.ts#L5-L8)
- 边界与改进：在用户手册中明确给出“真机配置示例”。

### Q12：管理端出现 502/代理错误通常是什么原因？

- A：Vite 代理转发到后端端口失败（后端没启动/端口不对/localhost IPv6 解析问题）；改成 127.0.0.1 通常更稳。
- 证据：
  - 后端端口固定为 3000：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L10)
- 边界与改进：在 README/手册中写清端口、代理、排错步骤。

---

## 5 核心闭环（答辩高频）

### Q13：你们说的“通知闭环”闭在哪里？

- A：闭环在“发布 → 学生端查看 → 已读回写 → 管理端统计回看”，证明不仅是静态页面，还有数据回流与可追踪性。
- 证据：
  - 通知列表接口：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L92-L101)
  - 已读标记接口：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L151-L159)
  - 统计接口：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L102-L107)
- 边界与改进：当前统计基于内存数据；后续落库后可支持“已读时间”“按班级统计”等。

### Q14：已读状态是怎么实现的？

- A：学生端触发 read 接口，后端把 noticeId 与 userId 关联；列表接口返回每条 notice 的 read 字段。
- 证据：
  - 读者记录结构：`notice_reads`：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L20-L21)
  - 列表返回 read 字段：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L97-L100)
  - read 写入逻辑：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L151-L159)
- 边界与改进：后续可落库并支持多端一致和更细统计维度。

### Q15：申请审批闭环你们怎么保证“状态能回到学生端”？

- A：设计上通过统一接口让学生端读 `/applications` 列表、管理端写审批结果；学生端刷新即可看到状态变化。
- 证据：
  - 学生端申请列表拉取接口：[application-list.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/pages/application-list/application-list.ts#L20-L36)
  - 学生端提交申请：[application-create.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/pages/application-create/application-create.ts#L81-L92)
- 边界与改进：本地 mock 环境对部分接口存在占位响应，建议答辩时以已验证可跑通的环境为准演示闭环。

### Q16：知识库搜索是怎么实现的？

- A：小程序端请求 `/knowledge` 拉取条目，在前端按标签和关键词进行过滤，点击进入详情。
- 证据：
  - 列表拉取与过滤：[knowledge.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/pages/knowledge/knowledge.ts#L17-L29)
  - 管理端维护入口：[KnowledgeManage.vue](file:///workspace/local-deploy/new_v2.0/admin-pc/src/views/KnowledgeManage.vue#L34-L83)
- 边界与改进：后续可把搜索下沉到后端，实现分页、排序和模糊搜索。

---

## 6 Web 管理端工程实现

### Q17：Web 端路由怎么做权限保护？

- A：全局路由守卫检查 token，未登录跳转登录页；如果已经有 token 则跳过登录页。
- 证据：
  - 路由守卫实现：[router/index.ts](file:///workspace/local-deploy/new_v2.0/admin-pc/src/router/index.ts#L64-L77)
- 边界与改进：可加入 token 失效校验与角色路由白名单。

### Q18：管理端有哪些核心页面？如何证明不是“只做了登录页”？

- A：路由里明确列出通知、学生、审批、流程、导入导出、知识库、日志等页面，对应独立 view 组件。
- 证据：
  - 页面路由列表：[router/index.ts](file:///workspace/local-deploy/new_v2.0/admin-pc/src/router/index.ts#L16-L58)
- 边界与改进：可补充更完整的页面级用例与演示脚本。

### Q19：导入导出功能具体做了什么？

- A：支持下载学生导入模板（前端生成 CSV）、上传 CSV 导入（multipart/form-data），并支持导出审批记录与文件清单。
- 证据：
  - 导入与导出逻辑：[ImportExport.vue](file:///workspace/local-deploy/new_v2.0/admin-pc/src/views/ImportExport.vue#L10-L59)
- 边界与改进：导出目前偏演示版，后续可由后端生成文件并提供下载链接。

### Q20：操作日志是怎么实现的？

- A：管理端调用 `/audit-logs` 获取日志列表并分页展示，用于追踪“谁在什么时候做了什么”。
- 证据：
  - 日志拉取与展示：[AuditLog.vue](file:///workspace/local-deploy/new_v2.0/admin-pc/src/views/AuditLog.vue#L22-L68)
- 边界与改进：可扩展为更细粒度动作枚举与对象快照。

---

## 7 小程序端页面与交互

### Q21：小程序有哪些核心入口？如何证明结构完整？

- A：TabBar 4 个入口：首页/服务/通知/我的；服务页集中提供政策搜索、模板下载、党团流程、证明申请、请假申请、我的申请等入口。
- 证据：
  - TabBar 配置：[app.json](file:///workspace/local-deploy/new_v2.0/miniprogram/app.json#L21-L52)
  - 服务页入口列表：[service.wxml](file:///workspace/local-deploy/new_v2.0/miniprogram/pages/service/service.wxml#L6-L66)
- 边界与改进：可补统一空状态、加载态与交互细节优化。

### Q22：附件上传怎么做的？

- A：小程序通过 `wx.chooseMessageFile` 选文件，再用 `wx.uploadFile` 上传到 `/files/upload`，并记录返回文件名到 attachments。
- 证据：
  - 上传实现：[application-create.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/pages/application-create/application-create.ts#L33-L68)
- 边界与改进：可补失败重试、文件大小/类型校验、服务端安全扫描。

### Q23：模板下载如何实现？

- A：通过 `config.fileURL` 拼接文件 URL，调用 `wx.downloadFile` 下载，再用 `wx.openDocument` 打开。
- 证据：
  - 下载与打开文档：[template-download.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/pages/template-download/template-download.ts#L31-L41)
  - fileURL 来源：[config.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/config.ts#L13-L16)
- 边界与改进：模板列表部分为演示数据，后续可由后端返回动态清单。

### Q24：党团流程页的数据从哪来？

- A：页面并行请求“阶段列表”和“我的进度”，在前端标记当前阶段与已完成阶段，并计算进度百分比。
- 证据：
  - 并行请求与状态标记：[process.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/pages/process/process.ts#L21-L58)
- 边界与改进：该模块依赖后端返回 stages/progress；演示环境下以联调验证为主。

---

## 8 后端（演示版）实现与边界说明

### Q25：你们后端怎么跑起来？技术栈是什么？

- A：当前演示版后端用 Python 标准库 `http.server` 提供 HTTP API，端口 3000，多线程处理请求，便于本地快速联调。
- 证据：
  - 多线程 HTTPServer：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L7-L9)
  - 端口与启动入口：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L10) [server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L228-L236)
- 边界与改进：生产化可替换为 Node/Java + 数据库 + 完整鉴权与持久化。

### Q26：为什么用 mock 后端？会不会被认为“不是真后端”？

- A：课程阶段优先验证“闭环流程与双端联动”，mock 后端能快速支撑登录、通知、文件等关键链路，降低环境搭建成本；并且手册明确区分了本地演示与远程环境差异。
- 证据：
  - 内置用户与通知数据：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L13-L28)
- 边界与改进：后续接入数据库，把学生、申请、知识库、流程等核心数据落地。

### Q27：后端如何处理 CORS？

- A：统一加 `Access-Control-Allow-Origin: *` 等响应头，保证本地联调跨域可用。
- 证据：
  - CORS headers：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L45-L48)
- 边界与改进：生产环境应收紧 Origin 白名单，避免过度开放。

### Q28：接口出错时怎么避免服务打挂？

- A：关键 handler 都有 try/except 兜底；异常返回统一错误码；并使用多线程 server 避免单请求阻塞。
- 证据：
  - do_GET 异常兜底：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L119-L122)
  - do_POST 异常兜底：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L167-L170)
- 边界与改进：可加入结构化日志与监控指标。

---

## 9 测试与质量

### Q29：你们怎么做测试？为什么没上自动化？

- A：以业务闭环的手工联调测试为主：管理员端操作 → 小程序端验证 → 回到管理端看统计/状态。课程阶段优先保证“核心流程跑通 + 可演示”，自动化测试作为后续迭代方向。
- 证据：
  - 核心闭环接口存在并可调用：登录与通知相关接口见 [server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L87-L107) [server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L129-L159)
- 边界与改进：后续可补接口单测（pytest/jest）、前端 e2e（Playwright/Cypress）、异常场景覆盖。

### Q30：如果老师追问“你们系统最大的技术风险是什么”，怎么答？

- A：最大风险在“环境差异导致联调不一致”，典型包括本地/远程接口地址、真机 localhost、代理端口、以及部分模块在不同环境的数据完整度差异。我们通过统一请求封装、集中环境配置、以及双环境用户手册来降低风险。
- 证据：
  - 小程序环境配置集中在：[config.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/config.ts#L5-L16)
  - 小程序请求封装集中在：[request.ts](file:///workspace/local-deploy/new_v2.0/miniprogram/utils/request.ts#L35-L86)
  - 后端端口固定：[server.py](file:///workspace/local-deploy/new_v2.0/server/server.py#L10)
- 边界与改进：进一步把环境配置外置化（.env）、加健康检查、把核心数据落库减少环境差异。

---

## 10 临场答题节奏（建议背诵法）

- 先一句话给结论：让老师 3 秒内听懂你在回答什么。
- 再给 1 个证据点：最好是“接口名/配置名/页面名”这种可核对的信息。
- 最后补一句边界与改进：既真实又能体现工程判断力。

