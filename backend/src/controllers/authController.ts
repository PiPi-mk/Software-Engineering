import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { JWT_SECRET } from '../middlewares/auth';

export class AuthController {
    static async login(req: Request, res: Response) {
        const { username, password } = req.body;
        
        try {
            // 真实数据库鉴权查询
            const sql = `SELECT id, username, role FROM syst_user WHERE username = $1 AND password = $2`;
            const result = await pool.query(sql, [username, password]);
            const user = result.rows[0];

            if (!user) {
                res.json({ code: 40101, message: '用户名或密码错误', data: null });
                return;
            }

            const payload = { id: user.id, username: user.username, role: user.role };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

            res.json({
                code: 0,
                message: 'ok',
                data: { token, user: payload }
            });
        } catch (error: any) {
            res.json({ code: 50001, message: '数据库异常', data: error.message });
        }
    }

    static async me(req: Request, res: Response) {
        res.json({ code: 0, message: 'ok', data: (req as any).user });
    }
}