<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../utils/request'
import type { Application, ApprovalAction } from '../types/application'

const list = ref<Application[]>([])
const loading = ref(false)
const filterStatus = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const detailVisible = ref(false)
const current = ref<Application | null>(null)
const comment = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/applications', { params: { status: filterStatus.value || undefined, page: page.value, pageSize: pageSize.value } })
    list.value = (res.data.list || []).map((a: any) => ({ ...a, typeLabel: a.type, statusLabel: a.status }))
    total.value = res.data.total || res.data.list?.length || 0
  } catch {}
  loading.value = false
}

function onPageChange(p: number) { page.value = p; fetchList() }

onMounted(fetchList)

function showDetail(row: Application) { current.value = row; comment.value = ''; detailVisible.value = true }

async function doApproval(action: ApprovalAction) {
  if (!current.value) return
  try {
    await request.put(`/applications/${current.value.id}/approval`, { action, comment: comment.value })
    ElMessage.success(action + '操作成功')
    detailVisible.value = false
    fetchList()
  } catch {}
}

function formatTime(ts: number) {
  if (!ts) return '-'
  return new Date(ts).toISOString().replace('T', ' ').substring(0, 19)
}
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2>审批工作台</h2>
      <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width:140px" @change="page=1;fetchList()">
        <el-option label="待审批" value="待审批" />
        <el-option label="已通过" value="通过" />
        <el-option label="已驳回" value="驳回" />
        <el-option label="待补充" value="补交" />
      </el-select>
    </div>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="申请人" width="100">
        <template #default="{ row }">{{ row.applicant_name || row.applicantStudentId }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column label="标题" min-width="180">
        <template #default="{ row }">{{ row.formData?.title || '-' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === '待审批' ? 'warning' : row.status === '通过' ? 'success' : row.status === '驳回' ? 'danger' : 'info'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="160">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="showDetail(row)">审批</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="onPageChange" />
    </div>

    <el-dialog v-model="detailVisible" title="审批申请" width="550px">
      <template v-if="current">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="申请人">{{ current.applicant_name || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ current.applicant_no || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ current.type }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ current.formData?.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ current.formData?.reason || current.formData?.purpose || '-' }}</el-descriptions-item>
          <el-descriptions-item label="附件">
            <template v-if="current.attachments?.length">
              <a v-for="f in current.attachments" :key="f" :href="'/files/' + f" target="_blank" style="margin-right:12px;color:#409eff">{{ f }}</a>
            </template>
            <span v-else>无</span>
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top:16px">
          <el-input v-model="comment" type="textarea" :rows="3" placeholder="审批意见（选填）" />
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          <el-button type="success" @click="doApproval('通过')">通过</el-button>
          <el-button type="danger" @click="doApproval('驳回')">驳回</el-button>
          <el-button type="warning" @click="doApproval('要求补交')">要求补交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { background: #fff; padding: 20px; border-radius: 4px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.toolbar h2 { margin: 0; font-size: 20px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
