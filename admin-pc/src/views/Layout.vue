<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userName = ref('')

onMounted(() => {
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const u = JSON.parse(raw)
      userName.value = u.username || ''
    }
  } catch {}
})

const menuItems = [
  { path: '/notice', title: '通知管理' },
  { path: '/students', title: '学生管理' },
  { path: '/approval', title: '审批工作台' },
  { path: '/process', title: '党团流程配置' },
  { path: '/import-export', title: '数据导入导出' },
  { path: '/knowledge', title: '知识库管理' },
  { path: '/audit-log', title: '操作日志' },
]

function onMenuClick(path: string) {
  router.push(path)
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.replace('/login')
}
</script>

<template>
  <div class="layout">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="logo">学院管理平台</div>
      <div class="user-info" v-if="userName">
        <span class="user-name">{{ userName }}</span>
      </div>
      <ul class="menu">
        <li
          v-for="item in menuItems"
          :key="item.path"
          :class="['menu-item', { active: route.path === item.path }]"
          @click="onMenuClick(item.path)"
        >
          {{ item.title }}
        </li>
      </ul>
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 220px;
  background: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  height: 48px;
  line-height: 48px;
  padding-left: 24px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background: #409eff;
}

.main {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow-y: auto;
}

.user-info {
  padding: 12px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  opacity: 0.7;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  height: 36px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
