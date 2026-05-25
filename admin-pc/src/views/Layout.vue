<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { path: '/notice', title: '通知管理' },
  { path: '/approval', title: '审批工作台' },
]

function onMenuClick(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="layout">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="logo">学院管理平台</div>
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
</style>
