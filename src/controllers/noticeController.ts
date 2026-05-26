import { Request, Response } from 'express';
import { NoticeService } from '../services/noticeService';

export class NoticeController {
    // 1. 获取分页列表
    static async getList(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const user = (req as any).user;

        try {
            const { total, rows } = await NoticeService.getNoticesPaged(page, pageSize, user.id, user.role);
            
            const list = rows.map(row => ({
                id: row.id,
                title: row.title,
                publishedAt: row.published_at ? Number(row.published_at) : null,
                read: row.is_read
            }));

            res.json({
                code: 0,
                message: 'ok',
                data: { page, pageSize, total, list }
            });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 2. 获取单条详情
    static async getById(req: Request, res: Response) {
        const id = req.params.id as string;
        try {
            const notice = await NoticeService.getNoticeById(id);
            if (!notice) {
                return res.json({ code: 40401, message: '通知不存在', data: null });
            }

            res.json({
                code: 0,
                message: 'ok',
                data: {
                    id: notice.id,
                    title: notice.title,
                    content: notice.content,
                    publisherId: notice.publisher_id,
                    publishedAt: notice.published_at ? Number(notice.published_at) : null,
                    createdAt: Number(notice.created_at)
                }
            });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 3. 发布通知（仅限管理员）
    static async create(req: Request, res: Response) {
        const { title, content } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足', data: null });
        }
        if (!title || !content) {
            return res.json({ code: 40001, message: '缺少标题或正文', data: null });
        }

        try {
            const notice = await NoticeService.createNotice(title, content, user.id);
            res.json({ code: 0, message: 'ok', data: { id: notice.id } });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 4. 修改通知（仅限管理员）
    static async update(req: Request, res: Response) {
        const id = req.params.id as string;
        const { title, content } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足', data: null });
        }

        try {
            const rowCount = await NoticeService.updateNotice(id, title, content);
            if (rowCount === 0) {
                return res.json({ code: 40401, message: '通知不存在，修改失败', data: null });
            }
            res.json({ code: 0, message: 'ok', data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 5. 删除通知（仅限管理员）
    static async delete(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足', data: null });
        }

        try {
            const rowCount = await NoticeService.deleteNotice(id);
            if (rowCount === 0) {
                return res.json({ code: 40401, message: '通知不存在，删除失败', data: null });
            }
            res.json({ code: 0, message: 'ok', data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 6. 学生标记已读（仅限学生）
    static async read(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = (req as any).user;

        if (user.role !== 'student') {
            return res.json({ code: 40301, message: '非学生账号，无法标记已读', data: null });
        }

        try {
            // 校验通知是否存在
            const notice = await NoticeService.getNoticeById(id);
            if (!notice) {
                return res.json({ code: 40401, message: '通知不存在', data: null });
            }

            const readAt = await NoticeService.markAsRead(id, user.id);
            res.json({
                code: 0,
                message: 'ok',
                data: { readAt: Number(readAt) }
            });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 7. 管理员查看已读统计（仅限管理员）
    static async getStats(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足', data: null });
        }

        try {
            const notice = await NoticeService.getNoticeById(id);
            if (!notice) {
                return res.json({ code: 40401, message: '通知不存在', data: null });
            }

            const stats = await NoticeService.getNoticeStats(id);
            res.json({
                code: 0,
                message: 'ok',
                data: {
                    noticeId: id,
                    total: stats.total,
                    readCount: stats.readCount,
                    unreadCount: stats.unreadCount
                }
            });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }
}