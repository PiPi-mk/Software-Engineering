<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

interface Stage { id: string; processType: string; stageOrder: number; name: string; description: string; materials: string[]; deadline: number; ownerRole: string }
const stages = ref<Stage[]>([])
const loading = ref(false)
const processType = ref('入党')
const dialogVisible = ref(false)
const form = ref<Stage>({ id: '', processType: '入党', stageOrder: 1, name: '', description: '', materials: [], deadline: 0, ownerRole: 'admin' })
const editing = ref(false)

const processOptions = [{ label: '入党流程', value: '入党' }, { label: '入团流程', value: '入团' }]
const roleOptions = [{ label: '管理员', value: 'admin' }, { label: '学生', value: 'student' }]

async function fetchStages() {
  loading.value = true
  try {
    const res = await request.get(`/process/${encodeURIComponent(processType.value)}/stages`)
    stages.value = (res.data.list || []).map((s: any) => ({
      ...s, materials: Array.isArray(s.materials) ? s.materials : [],
    }))
  } catch {}
  loading.value = false
}

onMounted(fetchStages)

function onTypeChange() { fetchStages() }

function handleAdd() {
  editing.value = false
  form.value = { id: '', processType: processType.value, stageOrder: stages.value.length + 1, name: '', description: '', materials: [], deadline: 0, ownerRole: 'admin' }
  dialogVisible.value = true
}

function handleEdit(row: Stage) {
  editing.value = true
  form.value = { ...row, materials: [...row.materials] }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) { ElMessage.warning('请输入阶段名称'); return }
  const payload = { ...form.value, id: form.value.id || 'stage_' + Date.now() }
  try {
    await request.post(`/process/${encodeURIComponent(processType.value)}/stages`, payload)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchStages()
  } catch {}
}

// Student progress update
const studentId = ref('u_s1')
const stageId = ref('')
const progressComment = ref('')

async function handleUpdateProgress() {
  if (!studentId.value || !stageId.value) { ElMessage.warning('请填写学生ID和选择阶段'); return }
  try {
    await request.put(`/process/students/${studentId.value}/progress`, {
      processType: processType.value,
      newStageId: stageId.value,
      comment: progressComment.value,
    })
    ElMessage.success('进度更新成功')
  } catch {}
}
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2>党团流程配置</h2>
      <div style="display:flex;gap:12px">
        <el-select v-model="processType" style="width:120px" @change="onTypeChange">
          <el-option v-for="o in processOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-button type="primary" @click="handleAdd">添加阶段</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="stages" stripe>
      <el-table-column prop="stageOrder" label="顺序" width="60" />
      <el-table-column prop="name" label="阶段名称" width="160" />
      <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column label="材料清单" width="200">
        <template #default="{ row }">{{ (row.materials || []).join('、') || '-' }}</template>
      </el-table-column>
      <el-table-column label="负责人" width="80">
        <template #default="{ row }">{{ row.ownerRole === 'admin' ? '管理员' : '学生' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Student progress section -->
    <div style="margin-top:24px;padding:16px;background:#f5f7fa;border-radius:8px">
      <h4 style="margin:0 0 12px">更新学生进度</h4>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <el-input v-model="studentId" placeholder="学生ID (如 u_s1)" style="width:160px" />
        <el-select v-model="stageId" placeholder="选择阶段" style="width:180px">
          <el-option v-for="s in stages" :key="s.id" :label="s.stageOrder + '. ' + s.name" :value="s.id" />
        </el-select>
        <el-input v-model="progressComment" placeholder="备注（选填）" style="width:200px" />
        <el-button type="primary" @click="handleUpdateProgress">更新进度</el-button>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑阶段' : '添加阶段'" width="550px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="顺序"><el-input-number v-model="form.stageOrder" :min="1" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" placeholder="阶段名称" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="材料清单"><el-input v-model="form.materials" placeholder="逗号分隔，如: 入党申请书,个人自传" /></el-form-item>
        <el-form-item label="时限(天)"><el-input-number v-model="form.deadline" :min="0" /></el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="form.ownerRole">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
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
</style>
