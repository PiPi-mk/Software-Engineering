<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

interface KnowledgeItem {
  id: string; title: string; content: string; tags: string
}

const items = ref<KnowledgeItem[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const dialogVisible = ref(false)
const editing = ref(false)
const form = ref({ id: '', title: '', content: '', tags: '' })
const uploading = ref(false)
const uploadFile = ref<HTMLInputElement | null>(null)

async function handleUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', input.files[0])
    await request.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    ElMessage.success('模板上传成功，可在 /files/ 下载')
  } catch {}
  uploading.value = false
}

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/knowledge', { params: { page: page.value, pageSize: pageSize.value } })
    items.value = res.data.list || []
    total.value = res.data.total || res.data.list?.length || 0
  } catch {}
  loading.value = false
}

function onPageChange(p: number) { page.value = p; fetchList() }

onMounted(fetchList)

function handleCreate() {
  editing.value = false
  form.value = { id: '', title: '', content: '', tags: '' }
  dialogVisible.value = true
}

function handleEdit(row: KnowledgeItem) {
  editing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.title.trim()) { ElMessage.warning('请输入标题'); return }
  if (!form.value.content.trim()) { ElMessage.warning('请输入内容'); return }
  try {
    if (editing.value) {
      await request.put(`/knowledge/${form.value.id}`, form.value)
      ElMessage.success('修改成功')
    } else {
      await request.post('/knowledge', form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch {}
}

async function handleDelete(row: KnowledgeItem) {
  try {
    await ElMessageBox.confirm('确定删除该知识条目？', '确认', { type: 'warning' })
    await request.delete(`/knowledge/${row.id}`)
    ElMessage.success('已删除')
    fetchList()
  } catch {}
}
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2>知识库管理</h2>
      <el-button type="primary" @click="handleCreate">新建条目</el-button>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="file" ref="uploadFile" @change="handleUpload" style="display:none" />
        <el-button :loading="uploading" size="small" @click="(uploadFile as any).click()">上传模板文件</el-button>
        <span style="font-size:12px;color:#999">上传到 /files/ 目录</span>
      </div>
    </div>

    <el-table v-loading="loading" :data="items" stripe>
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="tags" label="标签" width="120" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="onPageChange" />
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑条目' : '新建条目'" width="600px">
      <el-form :model="form" label-width="60px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="知识条目标题" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="例如：奖助学金,党团事务" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="知识条目正文" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
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
