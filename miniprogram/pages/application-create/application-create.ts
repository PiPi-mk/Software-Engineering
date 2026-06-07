import { config } from '../../utils/config'
import { post } from '../../utils/request'

Page({
  data: {
    typeLabels: config.applicationTypes.map((t) => t.label),
    typeValues: config.applicationTypes.map((t) => t.value),
    typeIndex: -1,
    showDateFields: false,
    title: '', reason: '', startDate: '', endDate: '',
    attachments: [] as string[],
    submitting: false,
  },

  onLoad(options: { type?: string }) {
    if (!getApp<IAppOption>().checkLogin()) return
    if (options.type) {
      const idx = this.data.typeValues.indexOf(options.type)
      if (idx !== -1) this.setData({ typeIndex: idx, showDateFields: options.type === '请假' })
    }
  },

  onTypeChange(e: WechatMiniprogram.PickerChange) {
    const i = Number(e.detail.value)
    this.setData({ typeIndex: i, showDateFields: this.data.typeValues[i] === '请假' })
  },

  onTitleInput(e: WechatMiniprogram.Input) { this.setData({ title: e.detail.value }) },
  onReasonInput(e: WechatMiniprogram.Input) { this.setData({ reason: e.detail.value }) },
  onStartDateChange(e: WechatMiniprogram.PickerChange) { this.setData({ startDate: e.detail.value }) },
  onEndDateChange(e: WechatMiniprogram.PickerChange) { this.setData({ endDate: e.detail.value }) },

  async uploadAttachment() {
    const res = await new Promise<WechatMiniprogram.ChooseMessageFileSuccessCallbackResult>((resolve, reject) => {
      wx.chooseMessageFile({ count: 3, type: 'file', success: resolve, fail: reject })
    }).catch(() => null)
    if (!res) return

    const token = wx.getStorageSync('token')
    const total = res.tempFiles.length
    let uploaded = 0
    wx.showLoading({ title: '上传中 0/' + total })

    for (const f of res.tempFiles) {
      try {
        await new Promise<void>((resolve, reject) => {
          wx.uploadFile({
            url: config.baseURL + '/files/upload',
            filePath: (f as any).path || f.path,
            name: 'file',
            header: { Authorization: 'Bearer ' + token },
            success: (uploadRes: any) => {
              const d = JSON.parse(uploadRes.data)
              if (d.code === 0) {
                this.setData({ attachments: [...this.data.attachments, d.data.name] })
              }
              resolve()
            },
            fail: reject,
          })
        })
        uploaded++
        wx.showLoading({ title: '上传中 ' + uploaded + '/' + total })
      } catch { /* 单个文件失败继续 */ }
    }
    wx.hideLoading()
    wx.showToast({ title: '已上传 ' + uploaded + '/' + total, icon: 'success' })
  },
  removeFile(e: WechatMiniprogram.TouchEvent) {
    const idx = e.currentTarget.dataset.index
    const arr = [...this.data.attachments]; arr.splice(idx, 1); this.setData({ attachments: arr })
  },

  async handleSubmit() {
    const { typeIndex, title, reason, submitting } = this.data
    if (submitting) return
    if (typeIndex === -1) { wx.showToast({ title: '请选择申请类型', icon: 'none' }); return }
    if (!title.trim()) { wx.showToast({ title: '请输入申请标题', icon: 'none' }); return }
    if (!reason.trim()) { wx.showToast({ title: '请填写申请说明', icon: 'none' }); return }

    this.setData({ submitting: true })
    try {
      await post('/applications', {
        type: this.data.typeValues[typeIndex],
        formData: {
          title: title.trim(),
          reason: reason.trim(),
          startDate: this.data.startDate,
          endDate: this.data.endDate,
        },
        attachments: this.data.attachments,
      })
      wx.showToast({ title: '提交成功', icon: 'success', duration: 1500 })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch {
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
    this.setData({ submitting: false })
  },
})
