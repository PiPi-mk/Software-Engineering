import { fetchMe } from '../../utils/auth'

Page({
  data: {
    studentName: '', avatarText: '', className: '', major: '',
    unreadNoticeCount: 0, pendingCount: 0,
    latestNotices: [] as NoticeSummary[],
    currentProcess: null as { processType: string; processLabel: string; currentStage: string } | null,
    processPercent: 0,
  },

  onLoad() {
    if (!getApp<IAppOption>().checkLogin()) return
  },

  onShow() {
    const tabBar = this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0 })
    this.loadHomeData()
  },

  async loadHomeData() {
    // 从 /auth/me 获取学生真实信息
    try {
      const res = await fetchMe()
      const u = res.data as any
      const name = u.studentName || u.username
      this.setData({
        studentName: name,
        avatarText: name.charAt(0).toUpperCase(),
        className: u.className || '',
        major: u.major || '',
      })
    } catch { /* 静默失败，保持旧值 */ }

    // Mock 通知和党团概览
    this.setData({
      unreadNoticeCount: 2, pendingCount: 1,
      latestNotices: [
        { id: 'n_1', title: '关于做好2024年度五四评优工作的通知', publishedAt: 1716163200000, read: false },
        { id: 'n_2', title: '2024年暑期社会实践报名通知', publishedAt: 1715990400000, read: false },
        { id: 'n_3', title: '计算机类专场招聘会通知', publishedAt: 1715731200000, read: true },
      ],
      currentProcess: { processType: '入党', processLabel: '入党流程', currentStage: '入党积极分子' },
      processPercent: 40,
    })
  },

  goToNotices() { wx.switchTab({ url: '/pages/notices/notices' }) },
  goToNoticeDetail(e: WechatMiniprogram.TouchEvent) { wx.navigateTo({ url: `/pages/notice-detail/notice-detail?id=${e.currentTarget.dataset.id}` }) },
  goToApplications() { wx.navigateTo({ url: '/pages/application-list/application-list' }) },
  goToProcess() { wx.navigateTo({ url: '/pages/process/process' }) },
  goToPolicySearch() { wx.navigateTo({ url: '/pages/knowledge/knowledge' }) },
  goToCreateCertificate() { wx.navigateTo({ url: '/pages/application-create/application-create?type=在读证明' }) },
  goToCreateLeave() { wx.navigateTo({ url: '/pages/application-create/application-create?type=请假' }) },
  goToTemplate() { wx.navigateTo({ url: '/pages/template-download/template-download' }) },
})
