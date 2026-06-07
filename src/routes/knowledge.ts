import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledgeController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 全局登录拦截
router.use(authenticate);

// --- 知识库管理 CRUD ---
router.get('/', KnowledgeController.list);
router.post('/', KnowledgeController.create);
router.put('/:id', KnowledgeController.update);
router.delete('/:id', KnowledgeController.remove);

// --- 学生政策提问 ---
router.post('/ask', KnowledgeController.ask);

export default router;