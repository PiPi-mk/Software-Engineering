<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../utils/request'

interface AuditEntry {
  id: number
  operatorId: string
  operatorRole: string
  action: string
  targetType: string
  targetId: string
  ip: string
  createdAt: number
}

const logs = ref<AuditEntry[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

async function fetchLogs() {
  loading.value = true
  try {
    const res = await request.get('/audit-logs', { params: { page: page.value, pageSize: pageSize.value } })
    logs.value = res.data.list
    total.value = res.data.total
  } catch {}
  loading.value = false
}

onMounted(fetchLogs)

function formatTime(ts: number) {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toISOString().replace('T', ' ').substring(0, 19)
}

const roleMap: Record<string, string> = { admin: '管理员', student: '学生' }
</script>

<template>
  <div class="log-page">
    <h2>操作日志</h2>
    <el-table v-loading="loading" :data="logs" stripe>
      <el-table-column prop="id" label="#" width="60" />
      <el-table-column label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作人" width="120">
        <template #default="{ row }">{{ row.operatorId }} ({{ roleMap[row.operatorRole] || row.operatorRole }})</template>
      </el-table-column>
      <el-table-column prop="action" label="动作" width="100" />
      <el-table-column prop="targetType" label="对象类型" width="100" />
      <el-table-column prop="targetId" label="对象 ID" width="200" />
      <el-table-column prop="ip" label="IP" width="140" />
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchLogs"
      />
    </div>
  </div>
</template>

<style scoped>
.log-page { background: #fff; padding: 20px; border-radius: 4px; }
h2 { margin: 0 0 16px 0; font-size: 20px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
