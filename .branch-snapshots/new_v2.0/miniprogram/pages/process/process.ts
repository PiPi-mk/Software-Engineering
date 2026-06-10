import { get } from '../../utils/request'
import { config } from '../../utils/config'

Page({
  data: {
    processTypes: config.processTypes,
    activeType: '入党',
    currentStageName: '', currentStageDesc: '',
    completedCount: 0, totalCount: 0, progressPercent: 0,
    stages: [] as ProcessStage[],
    loading: false, error: false,
  },

  onLoad() { if (!getApp<IAppOption>().checkLogin()) return; this.loadProcessData() },

  onTypeChange(e: WechatMiniprogram.TouchEvent) {
    this.setData({ activeType: e.currentTarget.dataset.type })
    this.loadProcessData()
  },

  async loadProcessData() {
    this.setData({ loading: true, error: false })
    try {
      const type = this.data.activeType // '入党' or '入团'
      // 并行获取阶段列表和学生进度
      const [stagesRes, progressRes] = await Promise.all([
        get<{ list: ProcessStage[] }>(`/process/${encodeURIComponent(type)}/stages`),
        get<any>(`/process/${encodeURIComponent(type)}/my-progress`),
      ])

      const stages = (stagesRes.data.list || []).map((s: ProcessStage) => ({
        ...s,
        isCompleted: false,
        isCurrent: false,
        completedAt: null as string | null,
      }))

      // 根据学生进度标记已完成和当前阶段
      const progress = progressRes.data
      if (progress && progress.currentStageId) {
        const curIdx = stages.findIndex((s: ProcessStage) => s.id === progress.currentStageId)
        for (let i = 0; i < stages.length; i++) {
          if (i < curIdx) stages[i].isCompleted = true
          else if (i === curIdx) stages[i].isCurrent = true
          else break
        }
      }

      const cur = stages.find((s: ProcessStage) => s.isCurrent)
      const done = stages.filter((s: ProcessStage) => s.isCompleted).length

      this.setData({
        stages, loading: false,
        currentStageName: cur ? cur.name : '未开始',
        currentStageDesc: cur ? cur.description : '',
        completedCount: done, totalCount: stages.length,
        progressPercent: Math.round((done / stages.length) * 100),
      })
    } catch {
      this.setData({ loading: false, error: true })
    }
  },
})
