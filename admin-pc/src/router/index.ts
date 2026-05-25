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
      ],
    },
  ],
})

export default router
