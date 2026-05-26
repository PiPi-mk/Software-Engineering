import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledgeController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 全局登录拦截
router.use(authenticate);

// 挂载政策提问接口
router.post('/ask', KnowledgeController.ask);

export default router;