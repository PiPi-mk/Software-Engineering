import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 全局安全机制：本模块所有接口必须登录才能访问
router.use(authenticate);

// 提交申请 (学生端)
router.post('/', ApplicationController.create);

// 获取申请列表 (通用：学生拉个人列表，管理员拉工作台审批列表)
router.get('/', ApplicationController.list);

// 查看申请详情与审批历史 (通用)
router.get('/:id', ApplicationController.getDetail);

// 审批处理 (管理端：通过/驳回/补交)
router.put('/:id/approval', ApplicationController.approve);

export default router;