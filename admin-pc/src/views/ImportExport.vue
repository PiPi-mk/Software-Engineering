<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { JobType, JobStatus } from '../types/import-export'
import { JobTypeLabel } from '../types/import-export'

// ========== 上传相关状态 ==========
const uploadRef = ref()
const uploading = ref(false)
const importType = ref<JobType>('STUDENT_IMPORT')
const jobStatus = ref<JobStatus | null>(null)
const statusMessage = ref('')

const importTypeOptions: { label: string; value: JobType }[] = [
  { label: JobTypeLabel.STUDENT_IMPORT, value: 'STUDENT_IMPORT' },
  { label: JobTypeLabel.NOTICE_IMPORT, value: 'NOTICE_IMPORT' },
]

// ========== 模拟上传 ==========
function handleFileChange(file: any) {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  const isValid = validTypes.includes(file.raw.type) ||
    /\.(xlsx|xls)$/i.test(file.raw.name)

  if (!isValid) {
    ElMessage.warning('仅支持 .xlsx 或 .xls 格式的 Excel 文件')
    return
  }

  uploading.value = true
  jobStatus.value = '处理中'
  statusMessage.value = `正在处理 ${JobTypeLabel[importType.value]}...`

  // 模拟 2 秒上传+校验过程
  setTimeout(() => {
    uploading.value = false
    const success = Math.random() > 0.3

    if (success) {
      jobStatus.value = '成功'
      ElMessage.success(`「${file.name}」${JobTypeLabel[importType.value]}完成，共处理 128 条数据`)
    } else {
      jobStatus.value = '失败'
      ElMessage.error(`「${file.name}」导入失败：第 12 行「学号」字段格式错误、第 47 行「姓名」为空、第 89 行「班级」未在系统中匹配，请修正后重新上传`)
    }

    uploadRef.value?.clearFiles()
  }, 2000)
}

// ========== 下载模板 ==========
function handleDownloadTemplate() {
  const content = '学号,姓名,性别,院系,班级,政治面貌,手机号\n2024001,张三,男,计算机学院,计科2401,共青团员,13800138000\n2024002,李四,女,管理学院,工商2402,群众,13900139000'
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '学生数据导入模板.csv'
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('模板下载已开始')
}

// ========== 导出审批记录 ==========
function handleExportRecords() {
  // 导出头对齐 application 表字段
  const content = '申请单号,申请类型,申请人ID,状态,提交时间,处理时间\napp_001,党团关系转出,u_student1,通过,2026-05-20 14:30,2026-05-21 09:00\napp_002,在读证明,u_student2,驳回,2026-05-18 10:00,2026-05-19 16:20\napp_003,特殊证明,u_student3,通过,2026-05-22 08:15,2026-05-23 11:00'
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `审批记录_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('审批记录导出已开始')
}

// ========== 上传前校验 ==========
function beforeUpload(file: File) {
  const isValid = /\.(xlsx|xls)$/i.test(file.name)
  if (!isValid) {
    ElMessage.warning('仅支持 .xlsx 或 .xls 格式的 Excel 文件')
    return false
  }

  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.warning('文件大小不能超过 5MB')
    return false
  }

  return true
}
</script>

<template>
  <div class="import-export-page">
    <h2>数据导入导出</h2>

    <!-- ===== 导入区域 ===== -->
    <el-card class="section-card">
      <template #header>
        <span class="section-title">数据导入</span>
      </template>

      <p class="section-desc">
        请按照模板格式整理数据后上传 Excel 文件。系统将自动校验数据格式，如有错误会提示具体行号。
      </p>

      <el-form inline>
        <el-form-item label="导入类型">
          <el-select v-model="importType" style="width: 180px">
            <el-option v-for="opt in importTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :show-file-list="false"
      >
        <div class="upload-content">
          <el-icon class="upload-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 16V4m0 0L8 8m4-4l4 4M4 20h16"/>
            </svg>
          </el-icon>
          <p class="upload-text">将 Excel 文件拖拽到此处，或 <em>点击上传</em></p>
          <p class="upload-hint">支持 .xlsx、.xls 格式，单个文件不超过 5MB</p>
        </div>
      </el-upload>

      <!-- 上传状态提示 -->
      <div v-if="uploading || jobStatus" class="upload-status">
        <el-alert
          v-if="uploading"
          type="info"
          :closable="false"
          show-icon
          :title="statusMessage"
        />
        <el-alert
          v-else-if="jobStatus === '成功'"
          type="success"
          :closable="false"
          show-icon
          title="任务处理成功"
        />
        <el-alert
          v-else-if="jobStatus === '失败'"
          type="error"
          :closable="false"
          show-icon
          title="任务处理失败，请查看错误报告"
        />
      </div>

      <div class="section-actions">
        <el-button type="success" @click="handleDownloadTemplate">下载 Excel 模板</el-button>
      </div>
    </el-card>

    <!-- ===== 导出区域 ===== -->
    <el-card class="section-card">
      <template #header>
        <span class="section-title">数据导出</span>
      </template>

      <p class="section-desc">
        导出审批记录为 CSV 文件（字段对齐 application 表），可直接使用 Excel 打开查看或打印。
      </p>

      <div class="section-actions">
        <el-button type="primary" @click="handleExportRecords">导出审批记录</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.import-export-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.import-export-page h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
}

.section-desc {
  color: #909399;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.upload-area {
  width: 100%;
}

.upload-content {
  padding: 30px 0;
  text-align: center;
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin: 8px 0;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
  cursor: pointer;
}

.upload-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin: 4px 0 0 0;
}

.upload-status {
  margin-top: 12px;
}

.section-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
</style>
