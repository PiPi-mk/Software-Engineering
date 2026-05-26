import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { login } from './api/auth'

async function bootstrap() {
  // 开发态自动登录
  try {
    const res = await login('admin', 'admin123')
    localStorage.setItem('token', res.data.token)
    console.log('[自动登录] 管理员 admin 已登录，token 已持久化')
  } catch {
    console.warn('[自动登录] 登录失败，请确认后端服务是否已启动')
  }

  const app = createApp(App)
  app.use(ElementPlus)
  app.use(router)
  app.mount('#app')
}

bootstrap()
