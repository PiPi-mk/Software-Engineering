<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// ========== 数据接口 ==========
interface ApprovalItem {
  id: number
  applicant: string
  applyType: string
  submitTime: string
  status: '待审核' | '已通过' | '已驳回'
  content: string
  approveOpinion: string
  approveTime: string
}

// ========== Mock 数据 ==========
const allList = ref<ApprovalItem[]>([
  {
    id: 1,
    applicant: '张三',
    applyType: '入党申请',
    submitTime: '2026-05-22 14:30',
    status: '待审核',
    content: '本人志愿加入中国共产党，拥护党的纲领，遵守党的章程，履行党员义务，执行党的决定，严守党的纪律，保守党的秘密，对党忠诚，积极工作，为共产主义奋斗终身，随时准备为党和人民牺牲一切，永不叛党。',
    approveOpinion: '',
    approveTime: '',
  },
  {
    id: 2,
    applicant: '李四',
    applyType: '评优评先',
    submitTime: '2026-05-23 09:15',
    status: '待审核',
    content: '申请参评2026年度优秀共青团员。本人自入团以来，积极参加团组织的各项活动，学习成绩名列前茅，曾获得校级优秀学生干部荣誉称号。',
    approveOpinion: '',
    approveTime: '',
  },
  {
    id: 3,
    applicant: '王五',
    applyType: '团员转正',
    submitTime: '2026-05-24 16:00',
    status: '待审核',
    content: '本人已完成团校培训全部课程，考核合格，现申请转为正式团员。',
    approveOpinion: '',
    approveTime: '',
  },
  {
    id: 4,
    applicant: '赵六',
    applyType: '入党申请',
    submitTime: '2026-05-18 10:20',
    status: '已通过',
    content: '本人志愿加入中国共产党...',
    approveOpinion: '材料齐全，符合发展条件，同意推荐。',
    approveTime: '2026-05-19 11:00',
  },
  {
    id: 5,
    applicant: '钱七',
    applyType: '评优评先',
    submitTime: '2026-05-17 08:45',
    status: '已驳回',
    content: '申请参评2026年度优秀学生干部...',
    approveOpinion: '材料不完整，缺少辅导员推荐信，请补充后重新提交。',
    approveTime: '2026-05-18 15:30',
  },
])

// ========== 计算属性：按状态分类 ==========
const pendingList = computed(() =>
  allList.value.filter((item) => item.status === '待审核')
)

const doneList = computed(() =>
  allList.value.filter((item) => item.status !== '待审核')
)

// ========== 审核弹窗 ==========
const dialogVisible = ref(false)
const currentItem = ref<ApprovalItem | null>(null)
const approveForm = ref({ opinion: '' })

function handleOpenApprove(row: ApprovalItem) {
  currentItem.value = row
  approveForm.value.opinion = ''
  dialogVisible.value = true
}

function handleApprove() {
  if (!currentItem.value) return
  if (!approveForm.value.opinion.trim()) {
    ElMessage.warning('请填写审批意见')
    return
  }
  currentItem.value.status = '已通过'
  currentItem.value.approveOpinion = approveForm.value.opinion
  currentItem.value.approveTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  dialogVisible.value = false
  ElMessage.success('已通过')
}

function handleReject() {
  if (!currentItem.value) return
  if (!approveForm.value.opinion.trim()) {
    ElMessage.warning('请填写审批意见')
    return
  }
  currentItem.value.status = '已驳回'
  currentItem.value.approveOpinion = approveForm.value.opinion
  currentItem.value.approveTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  dialogVisible.value = false
  ElMessage.success('已驳回')
}
</script>

<template>
  <div class="approval-page">
    <h2>审批工作台</h2>

    <el-tabs type="border-card">
      <!-- ========== 待办事项 ========== -->
      <el-tab-pane label="待办事项">
        <template #label>
          <span>
            待办事项
            <el-badge :value="pendingList.length" class="tab-badge" />
          </span>
        </template>

        <el-table v-if="pendingList.length > 0" :data="pendingList" stripe>
          <el-table-column prop="applicant" label="申请人" width="100" />
          <el-table-column prop="applyType" label="申请类型" width="130" />
          <el-table-column prop="content" label="申请内容" min-width="280" show-overflow-tooltip />
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column prop="status" label="当前状态" width="100">
            <template #default>
              <el-tag type="warning">待审核</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleOpenApprove(row)">
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暂无待办事项" />
      </el-tab-pane>

      <!-- ========== 已办记录 ========== -->
      <el-tab-pane label="已办记录">
        <template #label>
          <span>
            已办记录
            <el-badge :value="doneList.length" class="tab-badge" />
          </span>
        </template>

        <el-table v-if="doneList.length > 0" :data="doneList" stripe>
          <el-table-column prop="applicant" label="申请人" width="100" />
          <el-table-column prop="applyType" label="申请类型" width="130" />
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column prop="status" label="当前状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '已通过' ? 'success' : 'danger'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="approveOpinion" label="审批意见" min-width="200" show-overflow-tooltip />
          <el-table-column prop="approveTime" label="审批时间" width="180" />
        </el-table>

        <el-empty v-else description="暂无已办记录" />
      </el-tab-pane>
    </el-tabs>

    <!-- ========== 审核弹窗 ========== -->
    <el-dialog v-model="dialogVisible" title="审核申请" width="600px">
      <template v-if="currentItem">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="申请人">{{ currentItem.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请类型">{{ currentItem.applyType }}</el-descriptions-item>
          <el-descriptions-item label="提交时间" :span="2">
            {{ currentItem.submitTime }}
          </el-descriptions-item>
          <el-descriptions-item label="申请内容" :span="2">
            {{ currentItem.content }}
          </el-descriptions-item>
        </el-descriptions>

        <el-form style="margin-top: 20px">
          <el-form-item label="审批意见">
            <el-input
              v-model="approveForm.opinion"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见"
            />
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">驳回</el-button>
        <el-button type="success" @click="handleApprove">通过</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.approval-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.approval-page h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
}

.tab-badge {
  margin-left: 6px;
}
</style>
