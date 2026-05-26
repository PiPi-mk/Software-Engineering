<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ProcessStage, ProcessType, ProcessStatus, SystemRole } from '../types/process'

// ========== 流程级配置 ==========
const processType = ref<ProcessType>('入党')
const processStatus = ref<ProcessStatus>('启用')

const processTypeOptions: { label: string; value: ProcessType }[] = [
  { label: '入党流程', value: '入党' },
  { label: '入团流程', value: '入团' },
]

const roleOptions: { label: string; value: SystemRole }[] = [
  { label: '管理员 (admin)', value: 'admin' },
  { label: '学生 (student)', value: 'student' },
]

// ========== 阶段列表 ==========
let nextId = 3
const stageList = ref<ProcessStage[]>([
  {
    id: 'stage_1',
    processType: '入党',
    stageOrder: 1,
    name: '递交入党申请书',
    description: '申请人向所在党支部递交手写入党申请书',
    materials: ['入党申请书', '个人自传'],
    deadline: 7,
    ownerRole: 'student',
  },
  {
    id: 'stage_2',
    processType: '入党',
    stageOrder: 2,
    name: '党支部初审',
    description: '党支部对申请材料进行初步审核',
    materials: [],
    deadline: 14,
    ownerRole: 'admin',
  },
])

// ========== 新增阶段 ==========
function handleAddStage() {
  stageList.value.push({
    id: `stage_${nextId++}`,
    processType: processType.value,
    stageOrder: stageList.value.length + 1,
    name: '',
    description: '',
    materials: [],
    deadline: 7,
    ownerRole: 'student',
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
      // 重排 stageOrder
      stageList.value.forEach((s, i) => (s.stageOrder = i + 1))
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

// ========== 材料输入辅助 ==========
function handleAddMaterial(index: number) {
  stageList.value[index].materials.push('')
}

function handleRemoveMaterial(stageIndex: number, matIndex: number) {
  stageList.value[stageIndex].materials.splice(matIndex, 1)
}

// ========== 保存流程 ==========
function handleSave() {
  for (let i = 0; i < stageList.value.length; i++) {
    const stage = stageList.value[i]
    if (!stage.name.trim()) {
      ElMessage.warning(`第 ${i + 1} 个阶段的名称不能为空`)
      return
    }
  }

  const output = {
    processType: processType.value,
    status: processStatus.value,
    version: 'v1.0',
    stages: stageList.value.map((s) => ({
      ...s,
      materials: s.materials.filter((m) => m.trim() !== ''),
    })),
  }

  console.log('========== 党团流程配置 JSON (对齐 process_def + process_stage) ==========')
  console.log(JSON.stringify(output, null, 2))
  console.log('========================================================================')

  ElMessage.success('流程已保存，请打开控制台查看完整 JSON 数据')
}
</script>

<template>
  <div class="process-page">
    <h2>党团流程配置</h2>
    <p class="page-desc">配置党团事务的审批流程阶段，数据结构对齐 process_def 与 process_stage 表。</p>

    <!-- 流程级配置 -->
    <el-card class="process-meta">
      <el-form label-width="100px" inline>
        <el-form-item label="流程类型">
          <el-select v-model="processType" style="width: 160px">
            <el-option v-for="opt in processTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="processStatus" style="width: 120px">
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

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
            <span>阶段 {{ stage.stageOrder || index + 1 }}</span>
            <el-button type="danger" size="small" text @click="handleDeleteStage(index)">删除</el-button>
          </div>
        </template>

        <el-form :model="stage" label-width="100px" label-position="left">
          <el-form-item label="阶段名称">
            <el-input v-model="stage.name" placeholder="例如：递交入党申请书" />
          </el-form-item>

          <el-form-item label="阶段说明">
            <el-input v-model="stage.description" type="textarea" :rows="2" placeholder="对该阶段的补充说明" />
          </el-form-item>

          <el-form-item label="负责人角色">
            <el-select v-model="stage.ownerRole" style="width: 100%">
              <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="时限(天)">
            <el-input-number v-model="stage.deadline" :min="1" :max="90" style="width: 100%" />
          </el-form-item>

          <!-- 材料清单 -->
          <el-form-item label="材料清单">
            <div class="materials-list">
              <div v-for="(mat, mi) in stage.materials" :key="mi" class="material-row">
                <el-input v-model="stage.materials[mi]" placeholder="材料名称" style="flex: 1" />
                <el-button type="danger" size="small" :icon="'X'" text @click="handleRemoveMaterial(index, mi)" />
              </div>
              <el-button size="small" @click="handleAddMaterial(index)">+ 添加材料</el-button>
            </div>
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

.process-meta {
  margin-bottom: 20px;
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

.materials-list {
  width: 100%;
}

.material-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
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
