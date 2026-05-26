import { pool } from '../db';

export class ApplicationService {
    
    // 1. 学生提交申请
    static async createApplication(type: string, studentId: string, formData: any, attachments: any[] = []) {
        const id = `app_${Date.now()}`;
        const now = Date.now();
        
        // 将对象/数组转换为 JSON 字符串存入 Kingbase
        const formDataJson = JSON.stringify(formData);
        const attachmentsJson = JSON.stringify(attachments);

        const sql = `
            INSERT INTO application (id, type, applicant_student_id, form_data, attachments, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, '待审批', $6, $7)
            RETURNING *
        `;
        const result = await pool.query(sql, [id, type, studentId, formDataJson, attachmentsJson, now, now]);
        return result.rows[0];
    }

    // 2. 学生查看“我的申请列表”
    static async getStudentApplications(studentId: string) {
        const sql = `
            SELECT * FROM application 
            WHERE applicant_student_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(sql, [studentId]);
        return result.rows;
    }

    // 3. 管理端获取“审批工作台”列表（支持按状态和类型筛选）
    static async getAdminApplications(status?: string, type?: string) {
        let sql = `SELECT * FROM application WHERE 1=1`;
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            sql += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        if (type) {
            sql += ` AND type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        sql += ` ORDER BY created_at DESC`;
        const result = await pool.query(sql, params);
        return result.rows;
    }

    // 4. 根据 ID 获取申请详情及审批历史记录
    static async getApplicationDetails(id: string) {
        // 查询主表
        const appSql = `SELECT * FROM application WHERE id = $1`;
        const appResult = await pool.query(appSql, [id]);
        const application = appResult.rows[0];

        if (!application) return null;

        // 查询该申请单关联的审批历史日志
        const logSql = `SELECT * FROM approval_log WHERE application_id = $1 ORDER BY created_at ASC`;
        const logResult = await pool.query(logSql, [id]);

        return {
            ...application,
            logs: logResult.rows
        };
    }

    // 5. 管理员进行审批操作（核心：使用数据库事务保证一致性）
    static async handleApproval(applicationId: string, approverId: string, action: string, comment: string) {
        const client = await pool.connect();
        
        try {
            // 开启事务
            await client.query('BEGIN');
            const now = Date.now();

            // 第一步：更新申请主表状态与更新时间
            const updateAppSql = `
                UPDATE application 
                SET status = $1, updated_at = $2 
                WHERE id = $3
            `;
            const appResult = await client.query(updateAppSql, [action, now, applicationId]);
            
            if (appResult.rowCount === 0) {
                throw new Error('APPLICATION_NOT_FOUND');
            }

            // 第二步：向刚才修改了字段名的 approval_log 表中写入审批历史记录
            const logId = `ap_log_${now}`;
            const insertLogSql = `
                INSERT INTO approval_log (id, application_id, approval_level, approver_id, action, comment, created_at)
                VALUES ($1, $2, 1, $3, $4, $5, $6)
            `;
            await client.query(insertLogSql, [logId, applicationId, approverId, action, comment, now]);

            // 第三步：一期 MVP 降级处理：若审批通过，直接往结果文件表里塞一个模拟生成的 PDF 路径，完成闭环
            if (action === '通过') {
                const fileId = `file_${now}`;
                const mockPath = `/data/files/res_${applicationId}.pdf`;
                const insertFileSql = `
                    INSERT INTO result_file (id, application_id, file_path, file_type, generated_at)
                    VALUES ($1, $2, $3, 'PDF', $4)
                    ON CONFLICT (application_id) DO NOTHING
                `;
                await client.query(insertFileSql, [fileId, applicationId, mockPath, now]);
            }

            // 顺利完成，提交事务
            await client.query('COMMIT');
            return true;
        } catch (error) {
            // 失败，回滚所有操作
            await client.query('ROLLBACK');
            throw error;
        } finally {
            // 释放数据库连接
            client.release();
        }
    }
}