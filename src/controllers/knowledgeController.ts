import { Request, Response } from 'express';
import { KnowledgeService } from '../services/knowledgeService';

export class KnowledgeController {

    // --- 知识库管理 CRUD（仅管理员） ---

    // 1. 获取知识库列表
    static async list(_req: Request, res: Response) {
        try {
            const list = await KnowledgeService.getAllPolicies();
            res.json({ code: 0, message: 'ok', data: { list } });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 2. 新增政策
    static async create(req: Request, res: Response) {
        const { title, content, tags } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可操作知识库', data: null });
        }
        if (!title || !content) {
            return res.json({ code: 40001, message: '缺少必要字段(title, content)', data: null });
        }

        try {
            const policy = await KnowledgeService.createPolicy(user.id, title, content, tags);
            res.json({ code: 0, message: '政策添加成功', data: policy });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 3. 修改政策
    static async update(req: Request, res: Response) {
        const id = req.params.id as string;
        const { title, content, tags } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可操作知识库', data: null });
        }
        if (!title || !content) {
            return res.json({ code: 40001, message: '缺少必要字段(title, content)', data: null });
        }

        try {
            const rowCount = await KnowledgeService.updatePolicy(user.id, id, title, content, tags);
            if (rowCount === 0) {
                return res.json({ code: 40401, message: '政策不存在，修改失败', data: null });
            }
            res.json({ code: 0, message: '政策修改成功', data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 4. 删除政策
    static async remove(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可操作知识库', data: null });
        }

        try {
            const rowCount = await KnowledgeService.deletePolicy(user.id, id);
            if (rowCount === 0) {
                return res.json({ code: 40401, message: '政策不存在，删除失败', data: null });
            }
            res.json({ code: 0, message: '政策删除成功', data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // --- 学生提问 ---

    static async ask(req: Request, res: Response) {
        const { question } = req.body;

        if (!question || question.trim() === '') {
            return res.json({ code: 40001, message: '提问内容不能为空', data: null });
        }

        try {
            const result = await KnowledgeService.askQuestion(question);
            res.json({
                code: 0,
                message: 'ok',
                data: result
            });
        } catch (error: any) {
            res.json({ code: 50001, message: '知识库内部故障', data: error.message });
        }
    }
}