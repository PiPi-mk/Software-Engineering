# CLAUDE.md

> 项目：学院学生综合服务与党团管理平台  
> 角色定位：协助团队在已有开发文档和代码基础上完成一期 MVP。  
> 使用对象：代码生成 Agent、项目协作 Agent、开发成员。  
> 核心原则：尊重已有设计文档，优先完成核心闭环，避免无边界扩展。

---

## 1. 项目背景

本项目是一个学院学生事务服务平台，面向学生提供微信小程序入口，面向老师、助教和管理员提供 PC Web 后台。平台目标是把政策问答、通知分发、党团流程、证明/请假申请、导入导出等事务统一到一个系统中。

当前团队已经有《软件设计规格说明书 SDS》。后续开发应优先与 SDS 中的架构、技术栈、模块划分和数据设计保持一致。

在原始需求中，部分功能范围较大，例如 AI 问答、自动抓取公众号、PDF 成绩单解析、培养方案比对、多渠道通知等。这些能力应作为增强或演示功能处理。一期优先完成能跑通的核心业务闭环。

---

## 2. 协作规则

### 2.1 以已有开发文档为基准

开发时优先遵循已有 SDS 中的设计：

- 学生端：原生微信小程序。
- 管理端：Vue 3 + Element Plus。
- 后端：Node.js + Express。
- 数据库：人大金仓 Kingbase。
- 部署：Nginx + 后端 API + Kingbase。
- 后端分层：Controller / Service / DAO 或 Repository / Infra。
- 核心模块：Knowledge、Process、Notice、Application/Approval、Import/Export、Auth/RBAC/Audit。

### 2.2 对不合理内容的处理方式

遇到已有文档中表达不完整、范围过小或存在隐含风险的地方，不要直接大幅推翻。

采用以下方式处理：

1. **保持命名和模块边界稳定**：继续使用文档中已有模块名、表名、接口风格。
2. **用兼容表述修正方向**：例如“用户规模一期 ≤100”可理解为“一期试点/课程验收规模 ≤100，系统面向学院约 1000 用户保留扩展能力”。
3. **优先补充约束，不随意重构**：例如登录可以一期简化，但小程序学生端仍应保留微信 openid + 学号绑定的最终路径。
4. **避免破坏接口契约**：新增字段优先使用可选字段，避免影响已有页面。
5. **复杂功能先做最小闭环**：AI、PDF 解析、自动抓取等功能先做可演示版本。

### 2.3 开发策略

优先级顺序：

```text
先跑通业务闭环
再完善权限与异常
再补充导入导出
最后增加智能化和亮点功能
```

任何功能开发前，先确认它属于：

- P0：一期必须完成。
- P1：增强功能。
- P2：演示亮点或后续扩展。

---

## 3. 一期 MVP 范围

### 3.1 P0 必须完成

#### 学生端小程序

- 微信登录或模拟登录。
- 学号 + 姓名身份绑定。
- 首页服务入口。
- 通知列表。
- 通知详情。
- 通知已读上报。
- 政策知识库搜索。
- 政策详情查看。
- 模板文件下载。
- 党团流程总览。
- 我的党团进度。
- 申请提交。
- 我的申请列表。
- 申请详情与审批状态查看。
- 个人中心。

#### 管理端 Web

- 管理员登录。
- 学生信息导入与查询。
- 知识库维护。
- 模板上传。
- 通知发布。
- 通知已读统计。
- 流程阶段维护。
- 学生流程进度更新。
- 申请审批。
- 审批日志查看。

#### 后端

- 认证与鉴权。
- 学生身份绑定。
- 通知模块 API。
- 知识库模块 API。
- 党团流程模块 API。
- 申请审批模块 API。
- 文件上传下载。
- 基础审计日志。
- Kingbase 数据库连接。

### 3.2 P1 增强功能

- 证明 PDF 自动生成。
- 流程节点定时提醒。
- 理论题库自测。
- 通知按标签和人群规则精准分发。
- 导入导出任务表。
- 审批结果导出。
- 权限角色细化。

### 3.3 P2 亮点功能

- AI 政策问答。
- 公众号通知自动抓取。
- 成绩单 PDF 解析。
- 培养方案比对。
- 选课建议。
- 邮件/短信通知。
- 数据分析看板。

---

## 4. 推荐目录结构

### 4.1 后端

```text
backend/
  src/
    app.js
    config/
      db.js
      auth.js
      file.js
    middlewares/
      authMiddleware.js
      errorHandler.js
      validate.js
    modules/
      auth/
        auth.controller.js
        auth.service.js
        auth.routes.js
      student/
        student.controller.js
        student.service.js
        student.repository.js
        student.routes.js
      knowledge/
        knowledge.controller.js
        knowledge.service.js
        knowledge.repository.js
        knowledge.routes.js
      notice/
        notice.controller.js
        notice.service.js
        notice.repository.js
        notice.routes.js
      process/
        process.controller.js
        process.service.js
        process.repository.js
        process.routes.js
      application/
        application.controller.js
        application.service.js
        application.repository.js
        application.routes.js
      file/
        file.controller.js
        file.service.js
        file.routes.js
      audit/
        audit.service.js
        audit.repository.js
    utils/
      response.js
      pagination.js
      crypto.js
      date.js
  migrations/
  scripts/
  package.json
```

### 4.2 管理端

```text
admin-web/
  src/
    api/
      auth.js
      student.js
      knowledge.js
      notice.js
      process.js
      application.js
      file.js
    views/
      Login.vue
      Dashboard.vue
      students/
      knowledge/
      notices/
      process/
      applications/
      importExport/
    components/
    router/
    store/
```

### 4.3 小程序端

```text
miniprogram/
  pages/
    login/
    bind/
    home/
    service/
    notices/
    notice-detail/
    knowledge/
    knowledge-detail/
    process/
    application-create/
    application-list/
    application-detail/
    profile/
  components/
    service-card/
    notice-card/
    process-timeline/
    status-tag/
  utils/
    request.js
    auth.js
    config.js
```

---

## 5. 后端开发规范

### 5.1 分层约定

每个业务模块应尽量保持以下结构：

```text
routes -> controller -> service -> repository -> database
```

职责划分：

- routes：注册路径。
- controller：读取参数、调用 service、返回统一响应。
- service：处理业务规则、权限校验、状态流转、审计日志。
- repository：封装 SQL 和数据库事务。
- middleware：处理鉴权、异常、参数校验。
- infra/file：处理文件上传、下载、导入导出、PDF 生成等基础能力。

### 5.2 响应格式

统一成功响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

统一失败响应：

```json
{
  "code": 40001,
  "message": "未绑定学生身份",
  "data": null
}
```

### 5.3 分页格式

请求参数：

```text
page
pageSize
keyword
status
```

响应数据：

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 10
}
```

### 5.4 事务要求

以下操作必须使用事务：

- 审批申请：写 approval_log，同时更新 application.status。
- 更新学生流程：写 process_action_log，同时更新 student_process。
- 导入学生：批量写入并记录 import_export_job。
- 生成结果文件：写 result_file，同时更新 application 状态。

### 5.5 幂等要求

以下操作应支持重复调用：

- 通知已读上报。
- 文件下载记录。
- 学生身份绑定校验。
- 导入任务状态查询。

---

## 6. 数据库设计约定

### 6.1 核心表

一期优先创建以下表：

```text
user
student
admin_user
knowledge_item
template_file
notice
notice_read
process_def
process_stage
student_process
process_action_log
application
approval_log
result_file
import_export_job
audit_log
```

### 6.2 JSON 字段使用原则

可以使用 JSON 字段的位置：

- application.form_data
- application.attachments
- notice.audience_rule
- process_stage.materials
- import_export_job.result_detail
- audit_log.detail

使用 JSON 的目的：

- 减少频繁改表。
- 支持不同申请事项的表单字段。
- 支持不同通知的人群规则。
- 支持材料清单配置化。

### 6.3 敏感字段

敏感字段包括：

- 身份证号。
- 手机号。
- 邮箱。
- 家庭住址。
- 其他个人隐私字段。

处理要求：

- 存储时尽量加密。
- 展示时默认脱敏。
- 导出时需要管理员权限。
- 下载导出文件时写审计日志。

---

## 7. 小程序开发规范

### 7.1 小程序定位

小程序只承担学生侧轻量操作：

- 查。
- 看。
- 提交。
- 下载。
- 查看进度。
- 接收通知。

不要在小程序中实现复杂配置、批量导入、流程建模、统计分析等后台能力。

### 7.2 页面优先级

按以下顺序开发：

```text
login / bind
home
notices / notice-detail
knowledge / knowledge-detail
process
application-create
application-list / application-detail
profile
```

### 7.3 TabBar

建议使用 4 个 Tab：

```text
首页
服务
通知
我的
```

服务页中展示：

```text
政策问答
党团事务
证明申请
请假申请
模板下载
理论自测
学业分析
```

未完成的 P2 功能可以显示“建设中”或隐藏入口。

### 7.4 请求封装

小程序统一使用 `utils/request.js` 处理：

- baseURL。
- token 注入。
- loading。
- 错误提示。
- 401 跳转登录。
- 统一响应 code 解析。

### 7.5 登录状态

建议流程：

```text
wx.login
→ 后端换取 openid
→ 后端返回 token 和 bindStatus
→ 未绑定则跳转 bind 页面
→ 已绑定则进入首页
```

在无法接入真实微信环境时，可保留 mock 登录模式，但代码结构应保留最终微信登录接口。

---

## 8. 管理端开发规范

### 8.1 管理端定位

管理端承担配置、审批、导入导出和统计工作。

### 8.2 页面优先级

按以下顺序开发：

```text
登录
仪表盘
学生管理
知识库管理
模板管理
通知管理
流程配置
学生流程管理
审批工作台
导入导出
审计日志
```

### 8.3 表格页通用能力

每个管理表格页建议具备：

- 查询。
- 筛选。
- 分页。
- 新增。
- 编辑。
- 删除或停用。
- 导入。
- 导出。
- 操作记录。

### 8.4 表单校验

所有管理端表单需进行前端校验和后端校验：

- 必填字段。
- 长度限制。
- 文件类型限制。
- 日期合法性。
- 状态流转合法性。
- 权限校验。

---

## 9. 模块实现要求

## 9.1 Auth 模块

### 学生登录

接口：

```http
POST /api/auth/wechat-login
POST /api/auth/bind-student
GET /api/profile/me
```

要求：

- 根据微信 openid 创建或查询 user。
- 未绑定学生身份时返回 bindRequired。
- 绑定时使用学号和姓名匹配 student 表。
- 绑定成功后 user 与 student 建立关联。
- 后续请求通过 token 获取当前用户。

### 管理员登录

接口：

```http
POST /api/admin/login
```

要求：

- 一期可使用账号密码登录。
- 密码存储使用 hash。
- 登录后返回 token。
- 后续管理端接口检查角色权限。

---

## 9.2 Notice 模块

### 学生端接口

```http
GET /api/notices
GET /api/notices/{id}
POST /api/notices/{id}/read
```

要求：

- 通知列表只返回匹配当前学生的人群规则的通知。
- 通知详情打开后调用已读接口。
- notice_read 的 `(notice_id, student_id)` 保持唯一。
- 重复上报已读不报错。

### 管理端接口

```http
POST /api/admin/notices
GET /api/admin/notices
PUT /api/admin/notices/{id}
POST /api/admin/notices/{id}/publish
GET /api/admin/notices/{id}/read-stats
```

要求：

- 通知支持标题、正文、标签、附件、目标人群规则。
- 目标人群规则可以使用 JSON。
- 发布后学生端可见。
- 已读统计按应读人数、已读人数、未读人数展示。

---

## 9.3 Knowledge 模块

### 学生端接口

```http
GET /api/knowledge/search
GET /api/knowledge/categories
GET /api/knowledge/{id}
GET /api/templates
GET /api/templates/{id}/download
```

要求：

- 支持关键词搜索。
- 支持分类浏览。
- 详情页展示来源文件或官方链接。
- 模板文件支持下载。

### 管理端接口

```http
POST /api/admin/knowledge
GET /api/admin/knowledge
PUT /api/admin/knowledge/{id}
DELETE /api/admin/knowledge/{id}
POST /api/admin/templates/upload
```

要求：

- 管理员可维护知识条目。
- 知识条目包含标题、分类、关键词、正文、来源链接、附件。
- 支持启用/停用。
- 删除可采用软删除。

### AI 问答处理建议

一期先实现 FAQ/知识库检索。若加入 AI：

- 检索结果为空时不编造答案。
- 回答必须带来源。
- 对敏感问题返回人工咨询路径。
- 大模型只做基于命中内容的摘要整理。

---

## 9.4 Process 模块

### 学生端接口

```http
GET /api/process/my
GET /api/process/my/records
```

要求：

- 返回流程定义。
- 返回当前阶段。
- 返回历史动作记录。
- 返回材料清单和待办事项。

### 管理端接口

```http
GET /api/admin/process/definitions
POST /api/admin/process/definitions
POST /api/admin/process/stages
PUT /api/admin/process/students/{studentId}/stage
```

要求：

- 流程定义可配置。
- 阶段顺序可配置。
- 学生当前阶段可更新。
- 每次阶段更新写入 process_action_log。
- 支持入党、入团等不同流程类型。

---

## 9.5 Application / Approval 模块

### 学生端接口

```http
POST /api/applications
GET /api/applications/my
GET /api/applications/{id}
POST /api/applications/{id}/cancel
```

要求：

- 学生提交申请。
- 学生只能查看本人申请。
- 支持附件上传。
- 支持请假申请、证明申请、盖章申请等类型。
- 表单字段存储在 form_data JSON 中。

### 管理端接口

```http
GET /api/admin/applications
GET /api/admin/applications/{id}
POST /api/admin/applications/{id}/approve
POST /api/admin/applications/{id}/reject
POST /api/admin/applications/{id}/require-supplement
```

要求：

- 管理员查看待审批申请。
- 审批通过、驳回、要求补充材料均写 approval_log。
- 更新 application.status 与写日志必须同事务。
- 审批意见不可覆盖，只能追加。

### 状态流转

```text
draft
submitted
reviewing
approved
rejected
supplement_required
completed
cancelled
```

中文展示：

```text
草稿
已提交
审核中
已通过
已驳回
待补充
已完成
已撤回
```

---

## 9.6 Import / Export 模块

要求：

- 导入任务写 import_export_job。
- 导入失败行生成错误报告。
- 导出文件路径写入 result_path。
- 大文件或耗时任务尽量异步。
- 一期允许同步处理小文件，但接口设计保留 job 状态。

任务状态：

```text
pending
running
success
failed
partial_success
```

---

## 9.7 Audit 模块

需要记录以下操作：

- 管理员登录。
- 学生信息导入。
- 通知发布。
- 流程阶段修改。
- 学生流程进度更新。
- 申请审批。
- 文件导出。
- 敏感数据查看。

audit_log 字段建议：

```text
id
operator_id
operator_role
action
target_type
target_id
detail
ip
created_at
```

---

## 10. API 路由清单

### 10.1 学生端

```http
POST /api/auth/wechat-login
POST /api/auth/bind-student
GET  /api/profile/me

GET  /api/home/overview

GET  /api/knowledge/search
GET  /api/knowledge/categories
GET  /api/knowledge/:id

GET  /api/templates
GET  /api/templates/:id/download

GET  /api/notices
GET  /api/notices/:id
POST /api/notices/:id/read

GET  /api/process/my
GET  /api/process/my/records

POST /api/applications
GET  /api/applications/my
GET  /api/applications/:id
POST /api/applications/:id/cancel
```

### 10.2 管理端

```http
POST /api/admin/login

POST /api/admin/students/import
GET  /api/admin/students
GET  /api/admin/students/:id

POST /api/admin/knowledge
GET  /api/admin/knowledge
GET  /api/admin/knowledge/:id
PUT  /api/admin/knowledge/:id
DELETE /api/admin/knowledge/:id

POST /api/admin/templates/upload
GET  /api/admin/templates

POST /api/admin/notices
GET  /api/admin/notices
GET  /api/admin/notices/:id
PUT  /api/admin/notices/:id
POST /api/admin/notices/:id/publish
GET  /api/admin/notices/:id/read-stats

GET  /api/admin/process/definitions
POST /api/admin/process/definitions
POST /api/admin/process/stages
PUT  /api/admin/process/stages/:id
PUT  /api/admin/process/students/:studentId/stage

GET  /api/admin/applications
GET  /api/admin/applications/:id
POST /api/admin/applications/:id/approve
POST /api/admin/applications/:id/reject
POST /api/admin/applications/:id/require-supplement

GET  /api/admin/import-export/jobs
GET  /api/admin/audit-logs
```

---

## 11. 开发顺序建议

### 阶段 1：基础骨架

目标：项目能启动、能连接数据库、能登录。

任务：

- 初始化后端 Express 项目。
- 配置 Kingbase 连接。
- 建立统一响应、错误处理、中间件。
- 创建基础表。
- 实现管理员登录。
- 实现小程序登录/模拟登录。
- 实现学生绑定接口。

### 阶段 2：通知闭环

目标：管理员能发布通知，学生能查看并标记已读。

任务：

- notice 表。
- notice_read 表。
- 管理端通知 CRUD。
- 学生端通知列表与详情。
- 已读上报。
- 已读统计。

### 阶段 3：知识库闭环

目标：学生能查政策，管理员能维护知识。

任务：

- knowledge_item 表。
- template_file 表。
- 管理端知识库 CRUD。
- 学生端搜索。
- 详情页。
- 模板下载。

### 阶段 4：党团流程闭环

目标：学生能看进度，管理员能改阶段。

任务：

- process_def 表。
- process_stage 表。
- student_process 表。
- process_action_log 表。
- 管理端流程配置。
- 管理端学生流程更新。
- 学生端流程时间线。

### 阶段 5：申请审批闭环

目标：学生提交申请，管理员审批，学生看结果。

任务：

- application 表。
- approval_log 表。
- result_file 表。
- 小程序申请提交。
- 管理端审批工作台。
- 状态流转。
- 审批日志。

### 阶段 6：增强与答辩

目标：提升演示效果。

可选任务：

- 证明 PDF 生成。
- 学业分析 Demo。
- AI 问答 Demo。
- 数据看板。
- 演示数据脚本。
- 用户手册和答辩 PPT 材料。

---

## 12. 测试要求

### 12.1 核心测试场景

必须覆盖：

- 学生首次登录并绑定身份。
- 未绑定学生访问业务接口。
- 管理员发布通知。
- 学生查看通知并标记已读。
- 管理端查看通知已读统计。
- 学生搜索政策。
- 学生下载模板。
- 管理员更新学生党团阶段。
- 学生查看党团进度。
- 学生提交申请。
- 管理员审批通过。
- 管理员审批驳回。
- 学生查看审批意见。
- 文件上传失败。
- 无权限访问他人数据。

### 12.2 演示数据

建议准备：

- 10 名学生。
- 2 名管理员。
- 5 条政策知识。
- 3 个模板文件。
- 5 条通知。
- 1 套入党流程。
- 3 条学生流程状态。
- 3 条申请记录。

---

## 13. 代码生成注意事项

Agent 在生成代码时遵循：

1. 不随意改变已有技术栈。
2. 不随意重命名已有模块。
3. 不一次性生成过多无关功能。
4. 每次只围绕一个业务闭环提交。
5. 先保证接口可跑，再优化页面效果。
6. 后端业务规则放在 service。
7. SQL 或 ORM 操作放在 repository。
8. 学生端接口必须校验当前用户身份。
9. 管理端接口必须校验管理员角色。
10. 所有关键状态变更写审计或业务日志。
11. 文件上传路径通过配置项控制。
12. 对 P2 功能使用 mock 或 demo 数据时，需要在代码注释中标明。

---

## 14. 冲突处理策略

当需求文档、SDS、代码现状出现不一致时，按以下顺序处理：

1. **已完成且可运行的代码优先保持稳定。**
2. **已有 SDS 的模块边界和技术栈优先。**
3. **原始 PRD 的业务目标作为方向。**
4. **一期 MVP 范围优先于完整远期功能。**
5. **安全和权限约束优先于演示便利。**

典型处理方式：

| 冲突 | 处理 |
|---|---|
| 原始需求面向 1000 学生，SDS 写一期 ≤100 | 表述为系统面向 1000，课程一期按 ≤100 试点验收 |
| 原始需求要求 AI 问答，SDS 只写知识库 | 一期先做知识库检索，AI 作为增强 |
| 原始需求要求公众号自动抓取 | 一期改为管理员录入原文链接，保留 source_url |
| 原始需求要求 PDF 成绩单解析 | 一期先支持 Excel 标准成绩单，PDF 解析后续扩展 |
| 原始需求要求多渠道通知 | 一期先做小程序消息中心，邮件/短信作为扩展 |
| 原始需求要求电子证明自动生成 | 一期先跑通审批闭环，PDF 生成作为增强 |

---

## 15. 最终交付目标

一期最终应能演示完整路径：

```text
管理员导入学生
→ 学生登录并绑定身份
→ 管理员发布通知
→ 学生查看通知并标记已读
→ 管理员查看已读统计
→ 管理员维护党团流程
→ 学生查看个人党团进度
→ 学生提交证明/请假申请
→ 管理员审批
→ 学生查看审批结果
→ 系统保留日志和记录
```

这条路径是项目答辩和验收的主线。后续所有功能都应围绕这条主线逐步扩展。
