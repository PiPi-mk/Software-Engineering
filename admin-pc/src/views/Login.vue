<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value.trim() || !password.value.trim()) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const res = await login(username.value.trim(), password.value.trim())
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.user))
    ElMessage.success('登录成功')
    router.replace('/notice')
  } catch {
    // 错误已在拦截器中统一提示
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌区 -->
      <div class="brand-panel">
        <div class="brand-logo">&#9906;</div>
        <div class="brand-title">学院管理平台</div>
        <div class="brand-desc">学生综合服务与党团管理系统</div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-panel">
        <div class="form-title">管理员登录</div>
        <el-form
          @submit.prevent="handleLogin"
          label-position="top"
          size="large"
        >
          <el-form-item label="用户名">
            <el-input
              v-model="username"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>
        <div class="form-hint">测试账号：admin / admin123</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f2f5 0%, #e8eaed 100%);
}

.login-container {
  display: flex;
  width: 780px;
  min-height: 440px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
}

/* 左侧品牌区 — 复用侧边栏配色 */
.brand-panel {
  width: 320px;
  background: #304156;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  color: #ffffff;
}

.brand-logo {
  font-size: 56px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.brand-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.brand-desc {
  font-size: 13px;
  opacity: 0.6;
  text-align: center;
  line-height: 1.6;
}

/* 右侧表单区 */
.form-panel {
  flex: 1;
  background: #ffffff;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 32px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 4px;
}

.form-hint {
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 8px;
}
</style>
