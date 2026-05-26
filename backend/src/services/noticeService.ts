//处理SQL
import { pool } from '../db';

export class NoticeService {
    // 1. 分页获取通知列表（自动根据角色注入 read 状态）
    static async getNoticesPaged(page: number, pageSize: number, userId: string, role: string) {
        const offset = (page - 1) * pageSize;
        
        // 获取总条数
        const countRes = await pool.query('SELECT COUNT(*)::int as total FROM notice');
        const total = countRes.rows[0].total;

        let sql = '';
        let params: any[] = [];

        if (role === 'student') {
            // 学生视角：需要左联结已读表，判断该学生是否已读
            sql = `
                SELECT n.*, 
                       CASE WHEN nr.student_id IS NOT NULL THEN true ELSE false END as is_read
                FROM notice n
                LEFT JOIN notice_read nr ON n.id = nr.notice_id AND nr.student_id = $1
                ORDER BY n.created_at DESC
                LIMIT $2 OFFSET $3
            `;
            params = [userId, pageSize, offset];
        } else {
            // 管理员视角：列表中的 read 统一为 false 即可
            sql = `
                SELECT *, false as is_read 
                FROM notice 
                ORDER BY created_at DESC 
                LIMIT $1 OFFSET $2
            `;
            params = [pageSize, offset];
        }

        const result = await pool.query(sql, params);
        return { total, rows: result.rows };
    }

    // 2. 根据 ID 获取通知详情
    static async getNoticeById(id: string) {
        const sql = `SELECT * FROM notice WHERE id = $1`;
        const result = await pool.query(sql, [id]);
        return result.rows[0] || null;
    }

    // 3. 创建通知（默认发布时间等同于创建时间）
    static async createNotice(title: string, content: string, publisherId: string) {
        const id = `n_${Date.now()}`;
        const now = Date.now();
        const sql = `
            INSERT INTO notice (id, title, content, status, publisher_id, published_at, created_at) 
            VALUES ($1, $2, $3, '已发布', $4, $5, $6) 
            RETURNING *
        `;
        const result = await pool.query(sql, [id, title, content, publisherId, now, now]);
        return result.rows[0];
    }

    // 4. 修改通知
    static async updateNotice(id: string, title: string, content: string) {
        const sql = `UPDATE notice SET title = $1, content = $2 WHERE id = $3`;
        const result = await pool.query(sql, [title, content, id]);
        return result.rowCount;
    }

    // 5. 删除通知
    static async deleteNotice(id: string) {
        const sql = `DELETE FROM notice WHERE id = $1`;
        const result = await pool.query(sql, [id]);
        return result.rowCount;
    }

    // 6. 标记已读（利用唯一约束主键冲突，天然实现幂等）
    static async markAsRead(noticeId: string, studentId: string) {
        const now = Date.now();
        const sql = `
            INSERT INTO notice_read (notice_id, student_id, read_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (notice_id, student_id) 
            DO UPDATE SET read_at = notice_read.read_at -- 冲突时不做实质修改，保持原读时间
            RETURNING read_at
        `;
        const result = await pool.query(sql, [noticeId, studentId, now]);
        return result.rows[0].read_at;
    }

    // 7. 管理端获取已读未读统计
    static async getNoticeStats(noticeId: string) {
        const totalStudents = 2; // 一期根据规范，写死测试账号学生总数为 2 人 (student1, student2)
        
        const sql = `SELECT COUNT(*)::int as read_count FROM notice_read WHERE notice_id = $1`;
        const result = await pool.query(sql, [noticeId]);
        const readCount = result.rows[0].read_count;
        const unreadCount = Math.max(0, totalStudents - readCount);

        return {
            total: totalStudents,
            readCount,
            unreadCount
        };
    }
}