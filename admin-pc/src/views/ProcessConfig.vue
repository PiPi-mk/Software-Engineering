<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ========== 数据接口 ==========
interface ProcessStage {
  id: number
  name: string
  approverRole: string
  remindRule: string
  remindEnabled: boolean
}

// ========== 审批角色选项 ==========
const roleOptions = ['党支部书记', '团委书记', '辅导员', '学院党委', '团委组织部', '学生会主席']

// ========== Mock 初始数据（2个默认阶段） ==========
let nextId = 3
const stageList = ref<ProcessStage[]>([
  {
    id: 1,
    name: '提交申请',
    approverRole: '辅导员',
    remindRule: '提交后24小时内处理',
    remindEnabled: true,
  },
  {
    id: 2,
    name: '支部审核',
    approverRole: '党支部书记',
    remindRule: '审核通过后通知下一阶段',
    remindEnabled: true,
  },
])

// ========== 新增阶段 ==========
function handleAddStage() {
  stageList.value.push({
    id: nextId++,
    name: '',
    approverRole: '',
    remindRule: '',
    remindEnabled: false,
  })
}

// ========== 删除阶段 ==========
function handleDeleteStage(index: number) {
  if (stageList.value.length <= 1) {
    ElMessage.warning('至少保留一个流程阶段')
    return
  }
  ElMessageBox.confirm('确定删除该阶段吗？', '提示', { type: 'warning' })
    .then(() => {
      stageList.value.splice(index, 1)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

// ========== 保存流程 ==========
function handleSave() {
  // 基本校验
  for (let i = 0; i < stageList.value.length; i++) {
    const stage = stageList.value[i]
    if (!stage.name.trim()) {
      ElMessage.warning(`第 ${i + 1} 个阶段的名称不能为空`)
      return
    }
    if (!stage.approverRole) {
      ElMessage.warning(`请为「${stage.name || `第 ${i + 1} 个阶段`}」选择审批角色`)
      return
    }
  }

  // 组装输出 JSON
  const output = stageList.value.map((stage, index) => ({
    order: index + 1,
    name: stage.name,
    approverRole: stage.approverRole,
    remindRule: stage.remindRule,
    remindEnabled: stage.remindEnabled,
  }))

  console.log('========== 党团流程配置 JSON ==========')
  console.log(JSON.stringify(output, null, 2))
  console.log('========================================')

  ElMessage.success('流程已保存，请打开控制台查看完整 JSON 数据')
}
</script>

<template>
  <div class="process-page">
    <h2>党团流程配置</h2>
    <p class="page-desc">配置党团事务（如入党申请、评优评先等）的审批流程阶段与提醒规则。</p>

    <!-- 流程阶段卡片列表 -->
    <div class="stage-list">
      <el-card
        v-for="(stage, index) in stageList"
        :key="stage.id"
        class="stage-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <span>阶段 {{ index + 1 }}</span>
            <el-button
              type="danger"
              size="small"
              text
              @click="handleDeleteStage(index)"
            >
              删除
            </el-button>
          </div>
        </template>

        <el-form :model="stage" label-width="100px" label-position="left">
          <el-form-item label="阶段名称">
            <el-input v-model="stage.name" placeholder="例如：提交申请、支部审核" />
          </el-form-item>

          <el-form-item label="审批角色">
            <el-select v-model="stage.approverRole" placeholder="请选择审批角色" style="width: 100%">
              <el-option
                v-for="role in roleOptions"
                :key="role"
                :label="role"
                :value="role"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="提醒规则">
            <el-input v-model="stage.remindRule" placeholder="例如：提交后24小时内处理" />
          </el-form-item>

          <el-form-item label="开启提醒">
            <el-switch v-model="stage.remindEnabled" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <el-button type="success" @click="handleAddStage">+ 新增阶段</el-button>
      <el-button type="primary" size="large" @click="handleSave">保存流程</el-button>
    </div>
  </div>
</template>

<style scoped>
.process-page {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.process-page h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.page-desc {
  color: #909399;
  margin: 0 0 20px 0;
  font-size: 14px;
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
