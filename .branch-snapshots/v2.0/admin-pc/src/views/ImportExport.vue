<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const importResult = ref<any>(null)

async function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  uploading.value = true
  importResult.value = null
  try {
    const fd = new FormData()
    fd.append('file', input.files[0])
    const res = await request.post('/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    importResult.value = res.data
    if (res.data.success > 0) ElMessage.success('导入成功: ' + res.data.success + ' 条' + (res.data.skipped > 0 ? ', 跳过 ' + res.data.skipped + ' 条' : ''))
    else ElMessage.warning('无数据被导入')
  } catch {}
  uploading.value = false
}

function downloadTemplate() {
  const csv = '﻿学号,姓名,年级,专业,班级,政治面貌,手机号\n2024001,张三,2024,计算机科学与技术,计算机2024级1班,共青团员,138****1234\n2024002,李四,2024,软件工程,软件工程2024级2班,共青团员,139****5678\n2024003,王五,2024,人工智能,人工智能2024级1班,群众,150****9012\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = '学生信息导入模板.csv'
  a.click()
  ElMessage.success('模板已下载，按格式填写后上传即可')
}

function downloadApproval() {
  request.get('/audit-logs', { params: { pageSize: 1000 } }).then(res => {
    const rows = res.data.list || []
    const csv = '﻿时间,操作人,动作,对象,IP\n' + rows.map((r: any) =>
      `${new Date(r.createdAt).toISOString()},${r.operatorId},${r.action},${r.targetType},${r.ip}`
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '审批记录_' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
  })
}

function downloadFileList() {
  request.get('/files').then(res => {
    const text = (res.data.files || []).map((f: any) => `${f.name} (${f.size} bytes)`).join('\n')
    const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '文件清单.txt'
    a.click()
  })
}
</script>

<template>
  <div class="page">
    <h2>数据导入导出</h2>

    <!-- CSV Import -->
    <div class="section">
      <h3>导入学生信息</h3>
      <p class="desc">上传 CSV 文件，表头需包含：学号、姓名（必填），年级、专业、班级、政治面貌、手机号（选填，可留空）</p>
      <input type="file" ref="fileInput" @change="handleImport" accept=".csv" style="display:none" />
      <div style="display:flex;gap:8px;align-items:center">
        <el-button type="primary" :loading="uploading" @click="(fileInput as any).click()">选择 CSV 文件并导入</el-button>
        <el-button @click="downloadTemplate">下载 Excel 模板</el-button>
      </div>
      <div v-if="importResult" style="margin-top:12px;padding:12px;background:#f0f9eb;border-radius:4px">
        <p>总行数: {{ importResult.total }} | 成功: {{ importResult.success }} | 跳过: {{ importResult.skipped }}</p>
        <p v-if="importResult.errors?.length" style="color:#e6a23c">{{ importResult.errors[0] }}{{ importResult.errors.length > 1 ? ' ...等' + importResult.errors.length + '条错误' : '' }}</p>
      </div>
    </div>

    <!-- Download template details -->
    <div class="section">
      <h3>模板字段说明</h3>
      <el-table :data="[{field:'学号',required:'是',note:'学生的学号，作为唯一标识'},{field:'姓名',required:'是',note:'学生姓名'},{field:'年级',required:'否',note:'如 2024'},{field:'专业',required:'否',note:'如 计算机科学与技术'},{field:'班级',required:'否',note:'如 计算机2024级1班'},{field:'政治面貌',required:'否',note:'如 共青团员/中共党员/群众'},{field:'手机号',required:'否',note:'可脱敏存储，如 138****1234'}]" stripe size="small">
        <el-table-column prop="field" label="字段" width="120" />
        <el-table-column prop="required" label="必填" width="60">
          <template #default="{ row }"><el-tag :type="row.required==='是'?'danger':'info'" size="small">{{ row.required }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="note" label="说明" />
      </el-table>
    </div>

    <!-- Export -->
    <div class="section">
      <h3>导出数据</h3>
      <div style="display:flex;gap:8px">
        <el-button @click="downloadApproval">导出审批记录 (.csv)</el-button>
        <el-button @click="downloadFileList">导出文件清单 (.txt)</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { background: #fff; padding: 20px; border-radius: 4px; }
h2 { margin: 0 0 20px; font-size: 20px; }
.section { margin-bottom: 24px; padding: 16px; background: #f5f7fa; border-radius: 8px; }
.section h3 { margin: 0 0 8px; font-size: 16px; }
.desc { font-size: 13px; color: #909399; margin: 0 0 12px; }
</style>
