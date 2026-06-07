import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      redirect: '/notice',
      children: [
        {
          path: '/notice',
          name: 'NoticeManage',
          component: () => import('../views/NoticeManage.vue'),
          meta: { title: '通知管理' },
        },
        {
          path: '/students',
          name: 'StudentManage',
          component: () => import('../views/StudentManage.vue'),
          meta: { title: '学生管理' },
        },
        {
          path: '/approval',
          name: 'ApprovalWorkbench',
          component: () => import('../views/ApprovalWorkbench.vue'),
          meta: { title: '审批工作台' },
        },
        {
          path: '/process',
          name: 'ProcessConfig',
          component: () => import('../views/ProcessConfig.vue'),
          meta: { title: '党团流程配置' },
        },
        {
          path: '/import-export',
          name: 'ImportExport',
          component: () => import('../views/ImportExport.vue'),
          meta: { title: '数据导入导出' },
        },
        {
          path: '/knowledge',
          name: 'KnowledgeManage',
          component: () => import('../views/KnowledgeManage.vue'),
          meta: { title: '知识库管理' },
        },
        {
          path: '/audit-log',
          name: 'AuditLog',
          component: () => import('../views/AuditLog.vue'),
          meta: { title: '操作日志' },
        },
      ],
    },
  ],
})

// 全局路由守卫：未登录跳转登录页
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    // 已登录则跳过登录页
    if (token) return next('/notice')
    return next()
  }

  // 未登录则强制跳转
  if (!token) return next('/login')
  next()
})

export default router
