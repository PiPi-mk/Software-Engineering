<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

interface Student {
  id: string; studentNo: string; name: string
  grade: string; major: string; className: string
  politicalStatus: string; phone: string; hasAccount: boolean
}

const students = ref<Student[]>([])
const loading = ref(false)
const filterGrade = ref('')
const filterMajor = ref('')
const filterPolitical = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const filtered = computed(() => students.value)

// Extract unique values for filter options (from all data, not just current page)
const grades = computed(() => [...new Set(students.value.map(s => s.grade).filter(Boolean))])
const majors = computed(() => [...new Set(students.value.map(s => s.major).filter(Boolean))])
const politicals = computed(() => [...new Set(students.value.map(s => s.politicalStatus).filter(Boolean))])
const dialogVisible = ref(false)
const editing = ref(false)
const form = ref<Student>({ id: '', studentNo: '', name: '', grade: '', major: '', className: '', politicalStatus: '', phone: '', hasAccount: false })

async function fetchList() {
  loading.value = true
  try {
    const res = await request.get('/students-list', { params: {
      page: page.value, pageSize: pageSize.value,
      grade: filterGrade.value || undefined,
      major: filterMajor.value || undefined,
      political: filterPolitical.value || undefined,
    }})
    students.value = res.data.list || []
    total.value = res.data.total || 0
  } catch {}
  loading.value = false
}

function onPageChange(p: number) { page.value = p; fetchList() }
function onFilterChange() { page.value = 1; fetchList() }

onMounted(fetchList)

function handleCreate() {
  editing.value = false
  form.value = { id: '', studentNo: '', name: '', grade: '', major: '', className: '', politicalStatus: '', phone: '', hasAccount: false }
  dialogVisible.value = true
}

function handleEdit(row: Student) {
  editing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.studentNo.trim() || !form.value.name.trim()) {
    ElMessage.warning('学号和姓名必填'); return
  }
  try {
    if (editing.value) {
      await request.put('/students-list/' + form.value.id, form.value)
      ElMessage.success('修改成功')
    } else {
      // Create via import with single-row CSV (properly escaped)
      const esc = (s: string) => (s || '').includes(',') ? '\"' + (s || '') + '\"' : (s || '')
      const csv = '学号,姓名,年级,专业,班级,政治面貌,手机号\n' +
        [esc(form.value.studentNo), esc(form.value.name), esc(form.value.grade), esc(form.value.major), esc(form.value.className), esc(form.value.politicalStatus), esc(form.value.phone)].join(',')
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
      const fd = new FormData(); fd.append('file', blob, 'student.csv')
      await request.post('/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch {}
}

async function handleDelete(row: Student) {
  try {
    await ElMessageBox.confirm('确定删除学生「' + row.name + '」？', '确认', { type: 'warning' })
    await request.delete('/students-list/' + row.id)
    ElMessage.success('已删除')
    fetchList()
  } catch {}
}

async function handleResetPwd(row: Student) {
  try {
    await ElMessageBox.confirm('重置「' + row.name + '」的密码？', '确认', { type: 'warning' })
    const res = await request.post('/students-list/' + row.id + '/reset-password')
    ElMessage.success(res.data.password || '已重置')
  } catch {}
}
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h2>学生管理</h2>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <el-select v-model="filterGrade" placeholder="年级" clearable size="small" style="width:100px" @change="onFilterChange">
          <el-option v-for="g in grades" :key="g" :label="g + '级'" :value="g" />
        </el-select>
        <el-select v-model="filterMajor" placeholder="专业" clearable size="small" style="width:160px" @change="onFilterChange">
          <el-option v-for="m in majors" :key="m" :label="m" :value="m" />
        </el-select>
        <el-select v-model="filterPolitical" placeholder="政治面貌" clearable size="small" style="width:110px" @change="onFilterChange">
          <el-option v-for="p in politicals" :key="p" :label="p" :value="p" />
        </el-select>
        <el-button type="primary" @click="handleCreate">添加学生</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="filtered" stripe>
      <el-table-column prop="studentNo" label="学号" width="100" />
      <el-table-column prop="name" label="姓名" width="80" />
      <el-table-column prop="grade" label="年级" width="70" />
      <el-table-column prop="major" label="专业" width="160" show-overflow-tooltip />
      <el-table-column prop="className" label="班级" width="180" show-overflow-tooltip />
      <el-table-column prop="politicalStatus" label="政治面貌" width="90" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column label="账号" width="70">
        <template #default="{ row }">
          <el-tag :type="row.hasAccount ? 'success' : 'info'" size="small">{{ row.hasAccount ? '已激活' : '无' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" @click="handleResetPwd(row)">重置密码</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="onPageChange" />
    </div>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑学生' : '添加学生'" width="550px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="学号"><el-input v-model="form.studentNo" placeholder="必填" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.name" placeholder="必填" /></el-form-item>
        <el-form-item label="年级"><el-input v-model="form.grade" placeholder="如 2024" /></el-form-item>
        <el-form-item label="专业"><el-input v-model="form.major" placeholder="如 计算机科学与技术" /></el-form-item>
        <el-form-item label="班级"><el-input v-model="form.className" placeholder="如 计算机2024级1班" /></el-form-item>
        <el-form-item label="政治面貌"><el-input v-model="form.politicalStatus" placeholder="如 共青团员" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" placeholder="可脱敏" /></el-form-item>
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
