//接收前端的请求，校验身份（管理员还是学生），并调用 入党团的Service 事务。
import { Request, Response } from 'express';
import { ProcessService } from '../services/processService';

export class ProcessController {
    // 1. 获取某个流程的所有阶段（学生和管理员都能看）
    static async getStages(req: Request, res: Response) {
        const type = req.params.type as string; // 例如: '入党' 或 '入团'
        try {
            const stages = await ProcessService.getStages(type);
            res.json({ code: 0, message: 'ok', data: { list: stages } });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 2. 配置流程阶段（仅限管理员配置）
    static async saveStage(req: Request, res: Response) {
        const type = req.params.type as string;
        const { id, stageOrder, name, description, ownerRole } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足', data: null });
        }
        if (!id || !stageOrder || !name) {
            return res.json({ code: 40001, message: '缺少必要参数(id, stageOrder, name)', data: null });
        }

        try {
            const stage = await ProcessService.saveStage(id, type, stageOrder, name, description, ownerRole);
            res.json({ code: 0, message: 'ok', data: stage });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 3. 查看我的进度（仅限学生）
    static async getMyProgress(req: Request, res: Response) {
        const type = req.params.type as string;
        const user = (req as any).user;

        if (user.role !== 'student') {
            return res.json({ code: 40301, message: '非学生账号，无法查看进度', data: null });
        }

        try {
            const progress = await ProcessService.getStudentProgress(user.id, type);
            // 如果 progress 为 null，说明该学生还没开始这个流程
            res.json({ code: 0, message: 'ok', data: progress });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 4. 手动更新学生进度（仅限管理员，用于快速演示闭环）
    static async updateProgress(req: Request, res: Response) {
        const studentId = req.params.studentId as string;
        const { processType, newStageId, comment } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足', data: null });
        }
        if (!processType || !newStageId) {
            return res.json({ code: 40001, message: '缺少 processType 或 newStageId', data: null });
        }

        try {
            // 调用带有事务的 Service
            await ProcessService.updateStudentProgress(studentId, processType, newStageId, user.id, comment);
            res.json({ code: 0, message: '进度更新成功并已留痕', data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }
}