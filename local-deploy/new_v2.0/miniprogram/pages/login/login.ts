import { login, saveLoginState, isLoggedIn } from '../../utils/auth'

Page({
  data: { username: '', password: '', loading: false },

  onLoad() {
    if (isLoggedIn()) wx.reLaunch({ url: '/pages/home/home' })
  },

  onUsernameInput(e: WechatMiniprogram.Input) { this.setData({ username: e.detail.value }) },
  onPasswordInput(e: WechatMiniprogram.Input) { this.setData({ password: e.detail.value }) },

  async handleLogin() {
    const { username, password, loading } = this.data
    if (loading) return
    if (!username.trim() || !password.trim()) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' }); return
    }

    this.setData({ loading: true })
    try {
      const res = await login(username.trim(), password.trim())
      saveLoginState(res.data.token, res.data.user)
      wx.showToast({ title: '登录成功', icon: 'success', duration: 1000 })
      setTimeout(() => wx.reLaunch({ url: '/pages/home/home' }), 1000)
    } catch (err: any) {
      const msg = err.message || err.errMsg || '请求失败'
      wx.showToast({ title: msg, icon: 'none', duration: 3000 })
      console.error('登录失败:', err)
    }
    this.setData({ loading: false })
  },
})
