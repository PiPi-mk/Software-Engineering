import { isLoggedIn, getUserInfo } from './utils/auth'

App<IAppOption>({
  globalData: { token: '', userInfo: null },

  onLaunch() {
    if (isLoggedIn()) {
      try {
        this.globalData.token = wx.getStorageSync('token')
        this.globalData.userInfo = wx.getStorageSync('userInfo') || null
      } catch {}
    }
  },

  checkLogin(): boolean {
    if (!isLoggedIn()) { wx.reLaunch({ url: '/pages/login/login' }); return false }
    return true
  },
})
