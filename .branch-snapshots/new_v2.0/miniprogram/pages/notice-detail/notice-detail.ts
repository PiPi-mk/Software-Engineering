import { get, post } from '../../utils/request'

Page({
  data: { notice: null as Notice | null, error: false },

  onLoad(options: { id?: string }) {
    if (!getApp<IAppOption>().checkLogin()) return
    if (options.id) this.loadNotice(options.id)
  },

  async loadNotice(id: string) {
    wx.showLoading({ title: '加载中...' })
    try {
      // 获取详情
      const res = await get<Notice>(`/notices/${id}`)
      this.setData({ notice: res.data, error: false })
      wx.hideLoading()

      // 标记已读（幂等，重复调用不报错）
      try { await post(`/notices/${id}/read`) } catch { /* 静默失败 */ }
    } catch {
      wx.hideLoading()
      this.setData({ error: true })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 重新加载
  retry() {
    const { notice } = this.data
    if (notice) this.loadNotice(notice.id)
  },
})
