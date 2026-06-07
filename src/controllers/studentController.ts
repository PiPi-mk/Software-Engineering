import { Request, Response } from 'express';
import { StudentService } from '../services/studentService';

export class StudentController {

    // 1. 获取学生列表 / 个人信息 (GET /api/students)
    static async list(req: Request, res: Response) {
        const user = (req as any).user;
        const { grade, major } = req.query as { grade?: string; major?: string };

        try {
            if (user.role === 'admin') {
                const list = await StudentService.getAllStudents(grade, major);
                return res.json({ code: 0, message: 'ok', data: { list } });
            } else {
                // 学生只能看自己的信息
                const info = await StudentService.getStudentById(user.id);
                return res.json({
                    code: 0,
                    message: 'ok',
                    data: { list: info ? [info] : [] }
                });
            }
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 2. 获取单个学生详情 (GET /api/students/:id)
    static async getById(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = (req as any).user;

        try {
            const student = await StudentService.getStudentById(id);
            if (!student) {
                return res.json({ code: 40401, message: '学生不存在', data: null });
            }

            // 学生只能看自己，管理员可看所有人
            if (user.role === 'student' && user.id !== id) {
                return res.json({ code: 40301, message: '无权查看其他学生信息', data: null });
            }

            res.json({ code: 0, message: 'ok', data: student });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 3. 管理员创建学生 (POST /api/students)
    static async create(req: Request, res: Response) {
        const { studentNo, name, password, grade, major, className, politicalStatus, phone, email } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可创建学生', data: null });
        }
        if (!studentNo || !name || !password) {
            return res.json({ code: 40001, message: '缺少必要字段(studentNo, name, password)', data: null });
        }

        try {
            const student = await StudentService.createStudent(
                user.id, studentNo, name, password,
                grade, major, className, politicalStatus, phone, email
            );
            res.json({ code: 0, message: '学生创建成功', data: student });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 4. 管理员编辑学生信息 (PUT /api/students/:id)
    static async update(req: Request, res: Response) {
        const id = req.params.id as string;
        const body = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可修改学生信息', data: null });
        }

        try {
            const rowCount = await StudentService.updateStudent(user.id, id, body);
            if (rowCount === 0) {
                return res.json({ code: 40401, message: '学生不存在，修改失败', data: null });
            }
            res.json({ code: 0, message: '学生信息修改成功', data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 5. 管理员重置学生密码 (PUT /api/students/:id/reset-password)
    static async resetPassword(req: Request, res: Response) {
        const id = req.params.id as string;
        const { newPassword } = req.body;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可重置密码', data: null });
        }

        const password = newPassword || '123456';

        try {
            const rowCount = await StudentService.resetStudentPassword(user.id, id, password);
            if (rowCount === 0) {
                return res.json({ code: 40401, message: '学生不存在或非学生账号，重置失败', data: null });
            }
            res.json({ code: 0, message: `密码已重置为 ${password}`, data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }

    // 6. 管理员删除学生 (DELETE /api/students/:id)
    static async remove(req: Request, res: Response) {
        const id = req.params.id as string;
        const user = (req as any).user;

        if (user.role !== 'admin') {
            return res.json({ code: 40301, message: '权限不足，仅管理员可删除学生', data: null });
        }

        try {
            await StudentService.deleteStudent(user.id, id);
            res.json({ code: 0, message: '学生删除成功', data: null });
        } catch (error: any) {
            res.json({ code: 50001, message: '内部错误', data: error.message });
        }
    }
}
