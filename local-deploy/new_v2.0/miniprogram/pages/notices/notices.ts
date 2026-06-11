import { get } from '../../utils/request'

Page({
  data: {
    notices: [] as NoticeSummary[],
    page: 1, pageSize: 20, total: 0,
    loading: false, noMore: false, error: false,
  },

  onLoad() { if (!getApp<IAppOption>().checkLogin()) return },

  onShow() {
    const tabBar = this.getTabBar(); if (tabBar) tabBar.setData({ selected: 2 })
    // 返回列表时刷新 read 状态
    this.loadNotices(true)
  },

  async loadNotices(refresh?: boolean): Promise<void> {
    if (this.data.loading || (!refresh && this.data.noMore)) return
    const isFirst = refresh || this.data.page === 1
    this.setData({ loading: true, error: false })

    try {
      const res = await get<PaginatedData<NoticeSummary>>('/notices', {
        page: isFirst ? 1 : this.data.page,
        pageSize: this.data.pageSize,
      })
      const { list, total } = res.data
      this.setData({
        notices: isFirst ? list : [...this.data.notices, ...list],
        total, page: isFirst ? 1 : this.data.page,
        loading: false,
        noMore: isFirst ? list.length >= total : this.data.notices.length + list.length >= total,
      })
    } catch {
      this.setData({ loading: false, error: true })
    }
  },

  onLoadMore() {
    if (this.data.notices.length >= this.data.total) { this.setData({ noMore: true }); return }
    this.setData({ page: this.data.page + 1 })
    this.loadNotices()
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/pages/notice-detail/notice-detail?id=${e.currentTarget.dataset.id}` })
  },

  async onPullDownRefresh() {
    await this.loadNotices(true)
    wx.stopPullDownRefresh()
  },
})
