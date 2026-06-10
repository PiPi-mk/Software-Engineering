// ========== 导入导出任务（import_export_job 表） ==========
export interface ImportExportJob {
  id: string
  jobType: JobType           // 任务类型
  filePath: string           // 文件路径
  status: JobStatus          // 任务状态
  resultPath: string         // 错误报告路径
  createdBy: string          // 创建人 ID
  createdAt: number          // 创建时间戳 (毫秒)
}

/** 任务类型 */
export type JobType = 'STUDENT_IMPORT' | 'APPROVAL_EXPORT' | 'NOTICE_IMPORT'

/** 任务状态 — 严格对齐 DB: '处理中' | '成功' | '失败' */
export type JobStatus = '处理中' | '成功' | '失败'

/** 任务类型的中文映射 */
export const JobTypeLabel: Record<JobType, string> = {
  STUDENT_IMPORT: '学生数据导入',
  APPROVAL_EXPORT: '审批记录导出',
  NOTICE_IMPORT: '通知数据导入',
}
