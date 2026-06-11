// ========== 申请单（application 表） ==========
export interface Application {
  id: string                          // 申请单号 (如 app_xxx)
  type: ApplicationType               // 申请类型
  applicantStudentId: string          // 申请人(学生) ID
  formData: Record<string, unknown>   // 表单内容 (JSON)
  attachments: string[]               // 附件清单 (JSON 数组)
  status: ApplicationStatus           // 状态
  createdAt: number                   // 提交时间戳 (毫秒)
  updatedAt: number                   // 最后状态变更时间戳 (毫秒)
}

/** 申请类型 */
export type ApplicationType = '在读证明' | '党团关系转出' | '特殊证明'

/** 申请状态 — 严格对齐 DB: '待审批' | '通过' | '驳回' | '补交' */
export type ApplicationStatus = '待审批' | '通过' | '驳回' | '补交'

// ========== 审批日志（approval_log 表） ==========
export interface ApprovalLog {
  id: string
  applicationId: string
  approvalLevel: number        // 审批层级 (一期默认 1)
  approverId: string           // 审批人 ID
  action: ApprovalAction       // 审批动作
  comment: string              // 审批意见
  createdAt: number            // 审批时间戳 (毫秒)
}

/** 审批动作 — 严格对齐后端: '通过' | '驳回' | '补交' */
export type ApprovalAction = '通过' | '驳回' | '补交'
