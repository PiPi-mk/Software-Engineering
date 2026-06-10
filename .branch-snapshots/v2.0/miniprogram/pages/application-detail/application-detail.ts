import { get, post } from '../../utils/request'

Page({
  data: {
    app: null as Application | null, statusType: 'gray' as string, statusDesc: '',
    approvalComment: '', resultFilePath: '', resultFileName: '',
  },

  onLoad(options: { id?: string }) {
    if (!getApp<IAppOption>().checkLogin()) return
    if (options.id) this.loadApplication(options.id)
  },

  async loadApplication(id: string) {
    wx.showLoading({ title: '加载中...' })
    try {
      const res = await get<Application>(`/applications/${id}`)
      const app: Application = {
        ...res.data,
        typeLabel: res.data.type,
        statusLabel: res.data.status,
      }
      this.setData({ app })

      // 审批意见和结果文件来自 approval_log / result_file（详情接口已附带 logs）
      if (app.logs && app.logs.length > 0) {
        const lastLog = app.logs[app.logs.length - 1]
        this.setData({ approvalComment: lastLog.comment || '' })
      }

      const sm: Record<string, { type: string; desc: string }> = {
        '待审批': { type: 'warning', desc: '申请已提交，等待管理员审核' },
        '通过': { type: 'success', desc: '您的申请已通过审批' },
        '驳回': { type: 'danger', desc: '您的申请已被驳回' },
        '补交': { type: 'warning', desc: '管理员要求补充材料，请尽快处理' },
      }
      const info = sm[app.status] || { type: 'gray', desc: '' }
      this.setData({ statusType: info.type, statusDesc: info.desc })
    } catch {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
    wx.hideLoading()
  },

  downloadFile(e: WechatMiniprogram.TouchEvent) {
    wx.showToast({ title: '文件：' + e.currentTarget.dataset.file, icon: 'none' })
  },

  cancelApplication() {
    wx.showModal({
      title: '确认撤销', content: '确定要撤销此申请吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await post(`/applications/${this.data.app?.id}/cancel`)
            wx.showToast({ title: '已撤销', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
          } catch {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      },
    })
  },
})
