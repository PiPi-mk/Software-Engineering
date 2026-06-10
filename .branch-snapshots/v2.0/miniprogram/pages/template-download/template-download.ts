import { config } from '../../utils/config'

Page({
  data: {
    templates: [
      { id: 'tpl_1', name: '党员证明模板', description: '党员身份证明标准模板', fileType: 'Word', fileSize: '12KB', downloadCount: 0, createdAt: '2025-05-25' },
      { id: 'tpl_2', name: '团员证明模板', description: '团员身份证明标准模板', fileType: 'Word', fileSize: '12KB', downloadCount: 0, createdAt: '2025-05-25' },
      { id: 'tpl_3', name: '请假申请表', description: '学生请假审批用表', fileType: 'Word', fileSize: '45KB', downloadCount: 230, createdAt: '2024-01-01' },
      { id: 'tpl_4', name: '休学申请表', description: '休学申请审批用表', fileType: 'Word', fileSize: '52KB', downloadCount: 45, createdAt: '2024-01-01' },
      { id: 'tpl_5', name: '在读证明申请表', description: '开具在读证明用表', fileType: 'Word', fileSize: '38KB', downloadCount: 189, createdAt: '2024-01-01' },
      { id: 'tpl_6', name: '学生信息导入模板', description: '批量导入学生信息', fileType: 'Excel', fileSize: '28KB', downloadCount: 67, createdAt: '2024-01-01' },
      { id: 'tpl_7', name: '奖学金申请表', description: '国家奖学金申请用表', fileType: 'Word', fileSize: '56KB', downloadCount: 312, createdAt: '2024-01-01' },
      { id: 'tpl_8', name: '入党申请书模板', description: '入党申请书格式参考', fileType: 'Word', fileSize: '24KB', downloadCount: 520, createdAt: '2024-01-01' },
    ] as TemplateFile[],
  },

  onLoad() {
    if (!getApp<IAppOption>().checkLogin()) return
  },

  download(e: WechatMiniprogram.TouchEvent) {
    const item = e.currentTarget.dataset.item as TemplateFile
    const fileMap: Record<string, string> = {
      '党员证明模板': '党员证明模板.docx', '团员证明模板': '团员证明.docx',
      '请假申请表': '请假申请表.docx', '休学申请表': '休学申请表.docx',
      '在读证明申请表': '在读证明申请表.docx', '奖学金申请表': '奖学金申请表.docx',
      '入党申请书模板': '入党申请书模板.docx', '学生信息导入模板': '学生信息导入模板.xlsx',
    }
    const fn = fileMap[item.name]
    if (!fn) { wx.showToast({ title: '文件暂不可用', icon: 'none' }); return }
    const url = config.fileURL + '/' + encodeURIComponent(fn)
    wx.showLoading({ title: '下载中...' })
    wx.downloadFile({
      url,
      success(res) {
        wx.hideLoading()
        if (res.statusCode === 200) wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
        else wx.showToast({ title: '下载失败', icon: 'none' })
      },
      fail(err) { wx.hideLoading(); wx.showModal({ title: '下载失败', content: err.errMsg, showCancel: false }) },
    })
  },
})
