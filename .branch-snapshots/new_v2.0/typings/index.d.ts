/// <reference path="./types/index.d.ts" />

// ===== 对齐后端 API 响应格式（camelCase） =====
// 后端 Controller 已将 DB snake_case 转为 API camelCase
// 参考：backend/src/controllers/* + admin-pc/src/types/*

// ===== 用户与认证 =====
interface SysUser {
  id: string
  username: string
  role: 'student' | 'admin'
}

// ===== 通知 =====
interface Notice {
  id: string
  title: string
  content: string
  publisherId: string
  publishedAt: number     // 毫秒时间戳
  createdAt: number
}

interface NoticeSummary {
  id: string
  title: string
  publishedAt: number
  read: boolean
}

interface NoticeStats {
  noticeId: string
  total: number
  readCount: number
  unreadCount: number
}

// ===== 政策知识库 =====
interface PolicyKnowledge {
  id: string
  title: string
  content: string
  tags: string
}

// ===== 流程定义 =====
interface ProcessStage {
  id: string
  processType: string     // '入党' | '入团'
  stageOrder: number
  name: string
  description: string
  materials: string[]
  deadline: number
  ownerRole: string
  // 前端运行时扩展
  isCompleted?: boolean
  isCurrent?: boolean
  completedAt?: string | null
}

interface ProcessActionLog {
  id: string
  studentId: string
  processType: string
  actionType: string      // '更新进度' | '驳回'
  comment: string
  attachments: string[]
  operatorId: string
  createdAt: number
}

// ===== 申请与审批（对齐 admin-pc/src/types/application.ts） =====
type ApplicationType = '在读证明' | '党团关系转出' | '特殊证明' | '请假'
type ApplicationStatus = '待审批' | '通过' | '驳回' | '补交'
type ApprovalAction = '通过' | '驳回' | '要求补交'

interface Application {
  id: string
  type: ApplicationType | string
  applicantStudentId: string
  formData: Record<string, unknown>
  attachments: string[]
  status: ApplicationStatus | string
  createdAt: number
  updatedAt: number
  // 详情接口可能附带
  logs?: ApprovalLog[]
  // 前端扩展
  typeLabel?: string
  statusLabel?: string
}

interface ApprovalLog {
  id: string
  applicationId: string
  approvalLevel: number
  approverId: string
  action: ApprovalAction | string
  comment: string
  createdAt: number
}

interface ResultFile {
  id: string
  applicationId: string
  filePath: string
  fileType: string
  generatedAt: number
}

// ===== 模板文件 =====
interface TemplateFile {
  id: string
  name: string
  description: string
  fileType: string
  fileSize: string
  downloadCount: number
  createdAt: string
}

// ===== 导入导出 =====
interface ImportExportJob {
  id: string
  jobType: string
  filePath: string
  status: string
  resultPath: string
  createdBy: string
  createdAt: number
}

// ===== API 通用 =====
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

interface PaginatedData<T> {
  page: number
  pageSize: number
  total: number
  list: T[]
}

// ===== App =====
interface IAppOption {
  globalData: {
    token: string
    userInfo: SysUser | null
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback
  checkLogin(): boolean
}
