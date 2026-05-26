//用来解析 Token，保护私密接口
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 我们的专属密钥（一期测试随便写，以后上线再改）
export const JWT_SECRET = 'sds_super_secret_key_2026';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // 从请求头获取 Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.json({ code: 40101, message: '未登录', data: null });
        return;
    }

    // 提取真正的 token 字符串
    const token = authHeader.split(' ')[1];

    try {
        // 校验 token 是否合法/过期
        const decoded = jwt.verify(token, JWT_SECRET);
        // 将解析出来的用户信息挂载到 req 上，方便后续的接口使用
        (req as any).user = decoded; 
        next(); // 校验通过，放行到下一个函数
    } catch (error) {
        res.json({ code: 40101, message: 'Token 无效或已过期', data: null });
    }
};