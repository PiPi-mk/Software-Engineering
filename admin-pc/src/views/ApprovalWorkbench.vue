<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Application, ApplicationStatus, ApplicationType, ApprovalAction } from '../types/application'

// ========== Mock 数据（对齐 application 表） ==========
const allList = ref<Application[]>([
  {
    id: 'app_001',
    type: '党团关系转出',
    applicantStudentId: 'u_student1',
    formData: { reason: '毕业转出', targetOrg: 'XX街道团支部' },
    attachments: ['身份证复印件.pdf', '转出申请表.docx'],
    status: '待审批',
    createdAt: 1716630000000,
    updatedAt: 1716630000000,
  },
  {
    id: 'app_002',
    type: '在读证明',
    applicantStudentId: 'u_student2',
    formData: { purpose: '实习入职', copies: 2 },
    attachments: ['学生证复印件.pdf'],
    status: '待审批',
    createdAt: 1716635000000,
    updatedAt: 1716635000000,
  },
  {
    id: 'app_003',
    type: '特殊证明',
    applicantStudentId: 'u_student3',
    formData: { description: '申请奖学金所用综合表现证明' },
    attachments: ['获奖证书.pdf', '成绩单.pdf'],
    status: '待审批',
    createdAt: 1716640000000,
    updatedAt: 1716640000000,
  },
  {
    id: 'app_004',
    type: '在读证明',
    applicantStudentId: 'u_student4',
    formData: { purpose: '考研复试', copies: 1 },
    attachments: [],
    status: '通过',
    createdAt: 1716600000000,
    updatedAt: 1716610000000,
  },
  {
    id: 'app_005',
    type: '党团关系转出',
    applicantStudentId: 'u_student5',
    formData: { reason: '升学转出', targetOrg: 'YY大学团委' },
    attachments: ['录取通知书.pdf'],
    status: '驳回',
    createdAt: 1716590000000,
    updatedAt: 1716595000000,
  },
])

// ========== 计算属性：按状态分类 ==========
const pendingList = computed(() =>
  allList.value.filter((item) => item.status === '待审批')
)

const doneList = computed(() =>
  allList.value.filter((item) => item.status !== '待审批')
)

// ========== 状态 Tag 映射 ==========
const statusTagType: Record<ApplicationStatus, string> = {
  '待审批': 'warning',
  '通过': 'success',
  '驳回': 'danger',
  '补交': 'info',
}

const typeOptions: ApplicationType[] = ['在读证明', '党团关系转出', '特殊证明']

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

// ========== 审核弹窗 ==========
const dialogVisible = ref(false)
const currentItem = ref<Application | null>(null)
const approveForm = ref({ action: '通过' as ApprovalAction, comment: '' })

function handleOpenApprove(row: Application) {
  currentItem.value = row
  approveForm.value = { action: '通过', comment: '' }
  dialogVisible.value = true
}

function handleSubmitApproval() {
  if (!currentItem.value) return
  if (!approveForm.value.comment.trim()) {
    ElMessage.warning('请填写审批意见')
    return
  }

  const action = approveForm.value.action
  currentItem.value.status = action === '要求补交' ? '补交' : action
  currentItem.value.updatedAt = Date.now()

  const actionLabel: Record<string, string> = {
    '通过': '已通过',
    '驳回': '已驳回',
    '要求补交': '已要求补交',
  }

  dialogVisible.value = false
  ElMessage.success(actionLabel[action] || '操作完成')
}
</script>

<template>
  <div class="approval-page">
    <h2>审批工作台</h2>

    <el-tabs type="border-card">
      <!-- ========== 待审批 ========== -->
      <el-tab-pane>
        <template #label>
          <span>
            待审批
            <el-badge :value="pendingList.length" class="tab-badge" />
          </span>
        </template>

        <el-table v-if="pendingList.length > 0" :data="pendingList" stripe>
          <el-table-column label="申请单号" width="140">
            <template #default="{ row }">
              <span style="font-family: monospace; font-size: 13px">{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请类型" width="140">
            <template #default="{ row }">
              <el-tag>{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="申请人 ID" width="130" prop="applicantStudentId" />
          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="当前状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status]">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="handleOpenApprove(row)">审核</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暂无待审批申请" />
      </el-tab-pane>

      <!-- ========== 已处理 ========== -->
      <el-tab-pane>
        <template #label>
          <span>
            已处理
            <el-badge :value="doneList.length" class="tab-badge" />
          </span>
        </template>

        <el-table v-if="doneList.length > 0" :data="doneList" stripe>
          <el-table-column label="申请单号" width="140">
            <template #default="{ row }">
              <span style="font-family: monospace; font-size: 13px">{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请类型" width="140">
            <template #default="{ row }">
              <el-tag>{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="申请人 ID" width="130" prop="applicantStudentId" />
          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="当前状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status]">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="处理时间" width="180">
            <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暂无已处理记录" />
      </el-tab-pane>
    </el-tabs>

    <!-- ========== 审核弹窗 ========== -->
    <el-dialog v-model="dialogVisible" title="审核申请" width="600px">
      <template v-if="currentItem">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="申请单号">{{ currentItem.id }}</el-descriptions-item>
          <el-descriptions-item label="申请类型">{{ currentItem.type }}</el-descriptions-item>
          <el-descriptions-item label="申请人 ID">{{ currentItem.applicantStudentId }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatTime(currentItem.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="表单数据" :span="2">
            <code style="font-size: 12px">{{ JSON.stringify(currentItem.formData) }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="附件" :span="2">
            <span v-if="currentItem.attachments.length === 0" style="color: #c0c4cc">无</span>
            <ul v-else style="margin: 0; padding-left: 16px">
              <li v-for="att in currentItem.attachments" :key="att">{{ att }}</li>
            </ul>
          </el-descriptions-item>
        </el-descriptions>

        <el-form style="margin-top: 20px">
          <el-form-item label="审批动作">
            <el-radio-group v-model="approveForm.action">
              <el-radio value="通过">通过</el-radio>
              <el-radio value="驳回">驳回</el-radio>
              <el-radio value="要求补交">要求补交</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审批意见">
            <el-input
              v-model="approveForm.comment"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见"
            />
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApproval">提交审批</el-button>
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
