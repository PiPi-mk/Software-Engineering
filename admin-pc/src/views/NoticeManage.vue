<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// ========== 数据接口 ==========
interface Notice {
  id: number
  title: string
  content: string
  status: '已发布' | '未发布'
  publishTime: string
}

// ========== Mock 数据 ==========
const noticeList = ref<Notice[]>([
  {
    id: 1,
    title: '关于2026年春季学期党员发展工作的通知',
    content: '各党支部：根据学院党委工作安排，现启动2026年春季学期党员发展工作...',
    status: '已发布',
    publishTime: '2026-05-20 14:30',
  },
  {
    id: 2,
    title: '五四青年节主题团日活动安排',
    content: '为弘扬五四精神，各团支部请于5月4日前完成主题团日活动策划并提交...',
    status: '已发布',
    publishTime: '2026-04-28 09:15',
  },
  {
    id: 3,
    title: '学院第12期入党积极分子培训通知',
    content: '定于6月1日至6月15日举办第12期入党积极分子培训班，请各支部推荐...',
    status: '未发布',
    publishTime: '2026-05-22 10:00',
  },
])

// ========== 弹窗控制 ==========
const dialogVisible = ref(false)
const dialogTitle = ref('新建通知')

// ========== 表单数据 ==========
const form = reactive({
  title: '',
  content: '',
})

// ========== 新建/编辑 ==========
function handleCreate() {
  dialogTitle.value = '新建通知'
  form.title = ''
  form.content = ''
  dialogVisible.value = true
}

function handleEdit(row: Notice) {
  dialogTitle.value = '编辑通知'
  form.title = row.title
  form.content = row.content
  dialogVisible.value = true
}

function handleSave() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入通知标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请输入通知正文')
    return
  }

  noticeList.value.unshift({
    id: Date.now(),
    title: form.title,
    content: form.content,
    status: '未发布',
    publishTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  })

  dialogVisible.value = false
  ElMessage.success('通知已保存')
}

function handleDelete(row: Notice) {
  const index = noticeList.value.findIndex((item) => item.id === row.id)
  if (index > -1) {
    noticeList.value.splice(index, 1)
    ElMessage.success('已删除')
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
    <el-table :data="noticeList" stripe style="width: 100%">
      <el-table-column prop="title" label="标题" min-width="250" />
      <el-table-column prop="status" label="发布状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '已发布' ? 'success' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publishTime" label="发布时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
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
        <el-button type="primary" @click="handleSave">保存</el-button>
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
</style>
