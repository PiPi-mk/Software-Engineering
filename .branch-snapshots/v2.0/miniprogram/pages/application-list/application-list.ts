import { get } from '../../utils/request'

Page({
  data: {
    applications: [] as Application[],
    activeStatus: '',
    loading: false,
    statusTabs: [
      { value: '', label: '全部' },
      { value: '待审批', label: '待审批' },
      { value: '通过', label: '已通过' },
      { value: '驳回', label: '已驳回' },
      { value: '补交', label: '待补充' },
    ],
  },

  onLoad() { if (!getApp<IAppOption>().checkLogin()) return },
  onShow() { this.loadApplications() },

  async loadApplications() {
    this.setData({ loading: true })
    try {
      const res = await get<{ list: Application[] }>('/applications')
      let apps = (res.data.list || []).map((a: Application) => ({
        ...a,
        typeLabel: a.type,
        statusLabel: a.status,
      }))
      if (this.data.activeStatus) {
        apps = apps.filter((a: Application) => a.status === this.data.activeStatus)
      }
      this.setData({ applications: apps, loading: false })
    } catch {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onStatusChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ activeStatus: e.currentTarget.dataset.status })
    this.loadApplications()
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/pages/application-detail/application-detail?id=${e.currentTarget.dataset.id}` })
  },

  goToCreate() { wx.navigateTo({ url: '/pages/application-create/application-create' }) },
})
