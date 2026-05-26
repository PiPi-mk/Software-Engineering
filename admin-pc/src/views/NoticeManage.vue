<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getNoticeList,
  createNotice,
  getNoticeDetail,
  getNoticeStats,
  type NoticeSummary,
  type Notice,
  type NoticeStats,
} from '../api/notice'

// ========== 通知列表 ==========
const noticeList = ref<NoticeSummary[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await getNoticeList(page.value, pageSize.value)
    noticeList.value = res.data.list
    total.value = res.data.total
  } catch {
    // 错误已在拦截器中统一提示
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchList()
})

// ========== 时间格式化 ==========
function formatTime(ts: number): string {
  if (!ts) return '-'
  const date = new Date(ts)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

// ========== 新建通知弹窗 ==========
const dialogVisible = ref(false)
const form = ref({ title: '', content: '' })
const submitting = ref(false)

function handleCreate() {
  form.value = { title: '', content: '' }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入通知标题')
    return
  }
  if (!form.value.content.trim()) {
    ElMessage.warning('请输入通知正文')
    return
  }

  submitting.value = true
  try {
    await createNotice({ title: form.value.title, content: form.value.content })
    ElMessage.success('通知发布成功')
    dialogVisible.value = false
    fetchList()
  } catch {
    // 错误已在拦截器中统一提示
  } finally {
    submitting.value = false
  }
}

// ========== 查看详情 ==========
const detailVisible = ref(false)
const currentDetail = ref<Notice | null>(null)

async function handleViewDetail(row: NoticeSummary) {
  try {
    const res = await getNoticeDetail(row.id)
    currentDetail.value = res.data
    detailVisible.value = true
  } catch {
    // 错误已在拦截器中统一提示
  }
}

// ========== 查看统计 ==========
const statsVisible = ref(false)
const currentStats = ref<NoticeStats | null>(null)

async function handleViewStats(row: NoticeSummary) {
  try {
    const res = await getNoticeStats(row.id)
    currentStats.value = res.data
    statsVisible.value = true
  } catch {
    // 错误已在拦截器中统一提示
  }
}
</script>

<template>
  <div class="notice-page">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <h2>通知管理</h2>
      <el-button type="primary" @click="handleCreate">新建通知</el-button>
    </div>

    <!-- 通知列表表格 -->
    <el-table v-loading="loading" :data="noticeList" stripe style="width: 100%">
      <el-table-column prop="title" label="标题" min-width="280" show-overflow-tooltip />
      <el-table-column label="发布时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.publishedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
          <el-button size="small" type="success" @click="handleViewStats(row)">统计</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchList"
      />
    </div>

    <!-- 新建通知弹窗 -->
    <el-dialog v-model="dialogVisible" title="新建通知" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入通知标题" />
        </el-form-item>
        <el-form-item label="正文">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入通知正文"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">发布</el-button>
      </template>
    </el-dialog>

    <!-- 通知详情弹窗 -->
    <el-dialog v-model="detailVisible" title="通知详情" width="600px">
      <template v-if="currentDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ currentDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="发布者">{{ currentDetail.publisherId }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ formatTime(currentDetail.publishedAt) }}</el-descriptions-item>
          <el-descriptions-item label="正文">{{ currentDetail.content }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- 通知统计弹窗 -->
    <el-dialog v-model="statsVisible" title="通知统计" width="400px">
      <template v-if="currentStats">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="通知 ID">{{ currentStats.noticeId }}</el-descriptions-item>
          <el-descriptions-item label="总人数">{{ currentStats.total }}</el-descriptions-item>
          <el-descriptions-item label="已读人数">{{ currentStats.readCount }}</el-descriptions-item>
          <el-descriptions-item label="未读人数">{{ currentStats.unreadCount }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.notice-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar h2 {
  margin: 0;
  font-size: 20px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
