import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middlewares/auth';

// 内存里写死的测试账号（模拟数据库查询）
const USERS = [
    { id: 'u_admin', username: 'admin', password: 'admin123', role: 'admin' },
    { id: 'u_student1', username: 'student1', password: 'student123', role: 'student' },
    { id: 'u_student2', username: 'student2', password: 'student123', role: 'student' }
];

export class AuthController {
    // 登录接口
    static async login(req: Request, res: Response) {
        const { username, password } = req.body;
        
        // 查找用户
        const user = USERS.find(u => u.username === username && u.password === password);

        if (!user) {
            res.json({ code: 40101, message: '用户名或密码错误', data: null });
            return;
        }

        // 签发 Token，包含用户基础信息，有效期设为 24 小时
        const payload = { id: user.id, username: user.username, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        // 返回 API v1 规范的格式
        res.json({
            code: 0,
            message: 'ok',
            data: { 
                token: token, 
                user: payload 
            }
        });
    }

    // 获取当前用户信息接口
    static async me(req: Request, res: Response) {
        // 这里的 user 是刚才在中间件里 jwt.verify 解析出来塞进 req 的
        const user = (req as any).user;
        
        res.json({
            code: 0,
            message: 'ok',
            data: user
        });
    }
}