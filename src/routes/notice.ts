//返回路由
import { Router } from 'express';
import { NoticeController } from '../controllers/noticeController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 核心安全防线：整个通知模块的所有路由都需要经过 Token 校验
router.use(authenticate);

// 基础增删改查与列表接口
router.get('/', NoticeController.getList);
router.post('/', NoticeController.create);
router.get('/:id', NoticeController.getById);
router.put('/:id', NoticeController.update);
router.delete('/:id', NoticeController.delete);

// 业务高级接口（已读与统计）
router.post('/:id/read', NoticeController.read);
router.get('/:id/stats', NoticeController.getStats);

export default router;