// 环境配置
// dev: 开发者工具连本地 localhost
// server: 连部署服务器 10.10.0.22（nginx :80 → API :3000）
// prod: 线上部署后用真实域名
const ENV = {
  dev:    { baseURL: 'http://localhost:3000/api',  fileURL: 'http://localhost:3000/files' },
  server: { baseURL: 'http://10.10.0.22/api',      fileURL: 'http://10.10.0.22/files' },
  prod:   { baseURL: 'https://api.example.com/api', fileURL: 'https://api.example.com/files' },
}

const currentEnv = 'server'  // dev=本地开发 / server=服务器 / prod=线上

export const config = {
  baseURL: ENV[currentEnv].baseURL,
  fileURL: ENV[currentEnv].fileURL,
  appName: '学院综合服务平台',
  version: '1.0.0',

  // 申请类型（对齐 application.type 后端值）
  applicationTypes: [
    { value: '在读证明', label: '在读证明' },
    { value: '党团关系转出', label: '党团关系转出' },
    { value: '特殊证明', label: '特殊证明' },
    { value: '请假', label: '请假申请' },
  ],

  // 申请状态映射（对齐 application.status 后端值）
  applicationStatusMap: {
    '待审批': '待审批',
    '通过': '已通过',
    '驳回': '已驳回',
    '补交': '待补充',
  } as Record<string, string>,

  // 流程类型（对齐 process_def.type 后端值）
  processTypes: [
    { value: '入党', label: '入党流程' },
    { value: '入团', label: '入团流程' },
  ],

  // 知识标签（对齐 policy_knowledge.tags）
  knowledgeTags: [
    '奖助学金', '学籍异动', '休学复学', '宿舍调整',
    '查档调档', '请假流程', '证明材料', '就业实习',
    '党团事务', '节假日安排', '常用表格', '培养方案',
  ],

  // 审批动作（对齐 approval_log.action 后端值）
  approvalActions: ['通过', '驳回', '要求补交'],

  // 导入导出任务类型（对齐 import_export_job.job_type）
  jobTypes: ['STUDENT_IMPORT', 'APPROVAL_EXPORT', 'NOTICE_IMPORT'],

  // 通知状态（对齐 notice.status）
  noticeStatuses: ['已发布', '未发布'] as const,
}
