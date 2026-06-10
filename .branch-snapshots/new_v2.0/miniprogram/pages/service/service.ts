Page({
  data: {},

  onLoad() {
    if (!getApp<IAppOption>().checkLogin()) return
  },

  onShow() {
    const tabBar = this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 1 })
  },

  goToPolicySearch() { wx.navigateTo({ url: '/pages/knowledge/knowledge' }) },
  goToTemplate() { wx.navigateTo({ url: '/pages/template-download/template-download' }) },
  goToProcess() { wx.navigateTo({ url: '/pages/process/process' }) },
  goToCreateCertificate() { wx.navigateTo({ url: '/pages/application-create/application-create?type=在读证明' }) },
  goToCreateLeave() { wx.navigateTo({ url: '/pages/application-create/application-create?type=请假' }) },
  goToApplications() { wx.navigateTo({ url: '/pages/application-list/application-list' }) },
})
