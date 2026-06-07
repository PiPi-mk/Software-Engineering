// ========== 流程定义（process_def 表） ==========
export interface ProcessDef {
  id: string
  type: ProcessType      // 流程类型
  version: string        // 版本号
  status: ProcessStatus  // 流程状态
}

/** 流程类型 */
export type ProcessType = '入党' | '入团'

/** 流程状态 */
export type ProcessStatus = '启用' | '停用'

// ========== 流程阶段（process_stage 表） ==========
export interface ProcessStage {
  id: string
  processType: ProcessType        // 关联 process_def.type
  stageOrder: number              // 阶段顺序 (1, 2, 3...)
  name: string                    // 阶段名称
  description: string             // 阶段说明
  materials: string[]             // 材料清单 (JSON 字符串数组)
  deadline: number                // 时限要求 (天数)
  ownerRole: SystemRole           // 负责人角色
}

// ========== 系统角色标识 ==========
export type SystemRole = 'admin' | 'student'

// ========== 审批动作 ==========
export type ApprovalAction = '通过' | '驳回' | '补交'
