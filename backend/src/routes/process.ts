import { Router } from 'express';
import { ProcessController } from '../controllers/processController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 全局安全防线：整个流程模块必须登录
router.use(authenticate);

// --- 流程配置相关接口 ---
// 获取流程节点 (例: GET /api/process/入党/stages)
router.get('/:type/stages', ProcessController.getStages);
// 保存/修改流程节点 (例: POST /api/process/入党/stages)
router.post('/:type/stages', ProcessController.saveStage);

// --- 学生进度相关接口 ---
// 学生查看个人进度 (例: GET /api/process/入党/my-progress)
router.get('/:type/my-progress', ProcessController.getMyProgress);

// 管理员修改某学生的进度 (例: PUT /api/process/students/u_student1/progress)
router.put('/students/:studentId/progress', ProcessController.updateProgress);

export default router;