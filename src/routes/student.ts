import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 全局安全机制：本模块所有接口必须登录才能访问
router.use(authenticate);

// 获取学生列表 (管理端：全部列表；学生端：自己的信息)
router.get('/', StudentController.list);

// 获取单个学生详情
router.get('/:id', StudentController.getById);

// 创建学生
router.post('/', StudentController.create);

// 编辑学生信息
router.put('/:id', StudentController.update);

// 重置学生密码
router.put('/:id/reset-password', StudentController.resetPassword);

// 删除学生
router.delete('/:id', StudentController.remove);

export default router;
