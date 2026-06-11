import { config } from '../../utils/config'
import { get } from '../../utils/request'

Page({
  data: {
    keyword: '', activeTag: '', isSearchMode: false, searched: false,
    tags: config.knowledgeTags,
    items: [] as PolicyKnowledge[],
    loading: false,
  },

  onLoad() {
    if (!getApp<IAppOption>().checkLogin()) return
    this.loadItems()
  },

  async loadItems() {
    this.setData({ loading: true })
    try {
      const res = await get<{ list: PolicyKnowledge[] }>('/knowledge')
      let items = res.data.list || []
      if (this.data.activeTag) {
        items = items.filter((i: PolicyKnowledge) => i.tags && i.tags.includes(this.data.activeTag))
      }
      if (this.data.keyword) {
        const kw = this.data.keyword.toLowerCase()
        items = items.filter((i: PolicyKnowledge) => i.title.includes(kw) || i.content.includes(kw))
      }
      this.setData({ items, loading: false })
    } catch {
      this.setData({ loading: false })
    }
  },

  onSearchInput(e: WechatMiniprogram.Input) { this.setData({ keyword: e.detail.value }) },
  onSearch() { this.setData({ isSearchMode: true, searched: true }); this.loadItems() },

  onTagChange(e: WechatMiniprogram.TouchEvent) {
    const t = e.currentTarget.dataset.tag
    this.setData({ activeTag: this.data.activeTag === t ? '' : t, isSearchMode: false, searched: false, keyword: '' })
    this.loadItems()
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    wx.navigateTo({ url: `/pages/knowledge-detail/knowledge-detail?id=${e.currentTarget.dataset.id}` })
  },
})
