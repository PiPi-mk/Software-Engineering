import { Request, Response } from 'express';
import { ApplicationService } from '../services/applicationService';

export class ApplicationController {
    
    // 1. 学生提交申请 (POST /api/applications)
    static async create(req: Request, res: Response) {
        const { type, formData, attachments } = req.body;
        const user = (req as any).user;

        // 权限校验：只有学生能提交申请
        if (user.role !== 'student') {
            return res.json({ code: 40301, message: '权限不足，仅学生可提交申请', data: null });
        }
        
        // 参数校验
        if (!type || !formData) {
            return res.json({ code: 40001, message: '缺少必要字段(type 或 formData)', data: null });
        }

        try {
            const application = await ApplicationService.createApplication(type, user.id, formData, attachments || []);
            res.json({ code: 0, message: '申请提交成功', data: application });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 2. 获取申请列表 (GET /api/applications)
    // 学生调用返回“我的申请”；管理员调用返回“审批工作台”列表
    static async list(req: Request, res: Response) {
        const user = (req as any).user;
        const { status, type } = req.query as { status?: string, type?: string };

        try {
            if (user.role === 'admin') {
                // 管理员：获取审批工作台列表，支持按状态和类型筛选
                const list = await ApplicationService.getAdminApplications(status, type);
                return res.json({ code: 0, message: 'ok', data: { list } });
            } else {
                // 学生：只能看自己的申请
                const list = await ApplicationService.getStudentApplications(user.id);
                return res.json({ code: 0, message: 'ok', data: { list } });
            }
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 3. 获取申请单详情及审批历史 (GET /api/applications/:id)
    static async getDetail(req: Request, res: Response) {
        const id = req.params.id as string; // 加上 as string 修复类型报错
        const user = (req as any).user;

        try {
            const details = await ApplicationService.getApplicationDetails(id);
            if (!details) {
                return res.json({ code: 40401, message: '申请单不存在', data: null });
            }

            if (user.role === 'student' && details.applicant_student_id !== user.id) {
                return res.json({ code: 40301, message: '无权查看他人的申请详情', data: null });
            }

            res.json({ code: 0, message: 'ok', data: details });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 4. 管理员审批操作 (PUT /api/applications/:id/approval)
    static async approve(req: Request, res: Response) {
        const id = req.params.id as string; // 加上 as string 修复类型报错
        const { action, comment } = req.body;
        const user = (req as any).user;

        // 权限校验
        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可执行审批', data: null });
        }

        // 参数校验
        if (!action || !['通过', '驳回', '补交'].includes(action)) {
            return res.json({ code: 40001, message: '审批动作参数错误(必须为 通过/驳回/补交)', data: null });
        }

        try {
            // 调用带有事务的 Service，保证状态修改、审批日志写入、结果文件生成的一致性
            await ApplicationService.handleApproval(id, user.id, action, comment || '');
            res.json({ code: 0, message: `审批操作[${action}]成功并已留痕`, data: null });
        } catch (error: any) {
            if (error.message === 'APPLICATION_NOT_FOUND') {
                return res.json({ code: 40401, message: '无法处理，该申请单不存在', data: null });
            }
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }
}