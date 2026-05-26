import { Request, Response } from 'express';
import { KnowledgeService } from '../services/knowledgeService';

export class KnowledgeController {
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