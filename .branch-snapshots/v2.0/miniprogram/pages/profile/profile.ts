import { fetchMe, logout } from '../../utils/auth'
import { config } from '../../utils/config'

Page({
  data: {
    username: '', avatarText: 'U', roleLabel: '学生',
    studentNo: '', className: '',
  },

  onLoad() {
    if (!getApp<IAppOption>().checkLogin()) return
  },

  onShow() {
    const tabBar = this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 3 })
    this.loadProfile()
  },

  async loadProfile() {
    try {
      const res = await fetchMe()
      const u = res.data as any
      const roleLabels: Record<string, string> = { admin: '管理员', student: '学生' }
      this.setData({
        username: u.studentName || u.username,
        avatarText: (u.studentName || u.username).charAt(0).toUpperCase(),
        roleLabel: roleLabels[u.role] || '用户',
        studentNo: u.studentNo || '',
        className: u.className || '',
      })
    } catch { /* 失败保持旧值 */ }
  },

  goToApplications() { wx.navigateTo({ url: '/pages/application-list/application-list' }) },
  goToProcess() { wx.navigateTo({ url: '/pages/process/process' }) },
  goToKnowledge() { wx.navigateTo({ url: '/pages/knowledge/knowledge' }) },

  goToAbout() {
    wx.showModal({
      title: '关于',
      content: `${config.appName}\n版本：${config.version}\n\n学院学生综合服务与党团管理平台`,
      showCancel: false,
    })
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) { logout(); wx.reLaunch({ url: '/pages/login/login' }) }
      },
    })
  },
})
