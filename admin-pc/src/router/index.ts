import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
      ],
    },
  ],
})

export default router
