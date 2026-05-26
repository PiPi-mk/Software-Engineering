//挂载 Auth 路由
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// 登录接口：不需要校验 token
router.post('/login', AuthController.login);

// 获取用户信息：需要校验 token，所以加上 authenticate 中间件
router.get('/me', authenticate, AuthController.me);

export default router;