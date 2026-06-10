Page({
  data: {
    item: null as PolicyKnowledge | null,
  },

  onLoad(options: { id?: string }) {
    const app = getApp<IAppOption>()
    if (!app.checkLogin()) return
    if (options.id) this.loadItem(options.id)
  },

  loadItem(id: string) {
    const items: Record<string, PolicyKnowledge> = {
      'pk_1': { id: 'pk_1', title: '国家奖学金申请条件与流程', content: '国家奖学金每人每年8000元。申请条件：具有中华人民共和国国籍、热爱祖国、遵守校规校纪、成绩优异。评审程序：本人申请→班级评议→学院评审→学校审核→教育部审批。', tags: '奖助学金' },
      'pk_2': { id: 'pk_2', title: '休学与复学办理流程', content: '休学条件：因病需停课治疗占一学期总学时1/3以上、一学期请假缺课超1/3、特殊原因申请。程序：本人申请→附证明材料→辅导员签字→学院审批→教务处备案。复学：期满前一个月提交申请。', tags: '休学复学' },
      'pk_3': { id: 'pk_3', title: '宿舍调整申请说明', content: '申请条件：专业分流、班级调整、身体健康原因等。流程：学生提交调宿申请→辅导员审批→宿管中心审核→办理调宿。', tags: '宿舍调整' },
      'pk_4': { id: 'pk_4', title: '入党流程与条件说明', content: '流程：递交申请书→谈话→积极分子(≥1年)→发展对象→政审→培训→接收预备党员→预备期(1年)→转正。', tags: '党团事务' },
      'pk_5': { id: 'pk_5', title: '请假管理规定', content: '类型：事假、病假。权限：1天内辅导员审批；1-3天学院审批；3天以上教务处备案。请假结束后24小时内完成销假。', tags: '请假流程' },
    }
    const item = items[id]
    if (item) this.setData({ item })
  },
})
