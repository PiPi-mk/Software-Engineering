import { pool } from '../db';
import fs from 'fs';
import path from 'path';

export class JobService {
    static async createJob(jobType: string, userId: string) {
        const id = `job_${Date.now()}`;
        const now = Date.now();
        const sql = `INSERT INTO import_export_job (id, job_type, status, created_by, created_at) VALUES ($1, $2, '处理中', $3, $4) RETURNING *`;
        const result = await pool.query(sql, [id, jobType, userId, now]);
        return result.rows[0];
    }

    static async getJobStatus(id: string) {
        const sql = `SELECT * FROM import_export_job WHERE id = $1`;
        const result = await pool.query(sql, [id]);
        return result.rows[0] || null;
    }

    // 【终版真实导出】从金仓捞出真实审批单，格式化为标准 CSV 文件写入磁盘
    static async executeApprovalExport(jobId: string) {
        try {
            const resApps = await pool.query('SELECT * FROM application ORDER BY created_at DESC');
            const apps = resApps.rows;

            const dirPath = path.join(__dirname, '../../data/exports');
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            const fileName = `export_approvals_${Date.now()}.csv`;
            const filePath = path.join(dirPath, fileName);

            // 写入带 UTF-8 BOM 头的内容，保证导出的 CSV 哪怕用 Windows Excel 双击打开也绝不乱码
            let csvContent = '\uFEFF申请单号,申请类型,学生ID,当前状态,申请时间\n';
            for (const app of apps) {
                const dateStr = new Date(Number(app.created_at)).toLocaleString('zh-CN');
                csvContent += `${app.id},${app.type},${app.applicant_student_id},${app.status},${dateStr}\n`;
            }

            // 真实物理写入
            fs.writeFileSync(filePath, csvContent);

            // 更新任务单据为成功，并留存物理路径
            await pool.query(`UPDATE import_export_job SET status = '成功', file_path = $1 WHERE id = $2`, [filePath, jobId]);
        } catch (error) {
            await pool.query(`UPDATE import_export_job SET status = '失败' WHERE id = $1`, [jobId]);
        }
    }

    // 【终版真实导入】逐行切分解析前端传来的真实文本流，利用数据库事务进行批量 Insert 插入
    static async executeNoticeImport(jobId: string, publisherId: string, rawCsvData: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // 开启事务，保证批量导入要么全成功，要么全失败
            
            const lines = rawCsvData.split('\n');
            const now = Date.now();
            let successCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]?.trim();
                if (!line) continue;

                // 拆分每一列（CSV 标准逗号分隔符）
                const parts = line.split(',');
                const title = parts[0]?.trim();
                const content = parts[1]?.trim();

                if (title && content) {
                    const id = `n_imp_${Date.now()}_${i}`;
                    await client.query(
                        `INSERT INTO notice (id, title, content, status, publisher_id, published_at, created_at) VALUES ($1, $2, $3, '已发布', $4, $5, $6)`,
                        [id, title, content, publisherId, now, now]
                    );
                    successCount++;
                }
            }

            await client.query('COMMIT'); // 提交
            await pool.query(`UPDATE import_export_job SET status = '成功' WHERE id = $1`, [jobId]);
            return successCount;
        } catch (error) {
            await client.query('ROLLBACK'); // 回滚
            await pool.query(`UPDATE import_export_job SET status = '失败' WHERE id = $1`, [jobId]);
            throw error;
        } finally {
            client.release();
        }
    }
}