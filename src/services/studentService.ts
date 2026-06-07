import { pool } from '../db';
import { maskStudentFields } from '../utils/privacy';

export class StudentService {

    // 1. 获取学生列表（管理员看全部，支持按年级/专业筛选）
    static async getAllStudents(grade?: string, major?: string) {
        let sql = `
            SELECT st.id, st.student_no, st.name,
                   st.grade, st.major, st.phone, st.email,
                   su.username, su.role
            FROM student st
            LEFT JOIN syst_user su ON st.id = su.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let i = 1;

        if (grade) {
            sql += ` AND st.grade = $${i}`;
            params.push(grade);
            i++;
        }
        if (major) {
            sql += ` AND st.major = $${i}`;
            params.push(major);
            i++;
        }

        sql += ` ORDER BY st.student_no ASC`;
        const result = await pool.query(sql, params);
        return result.rows.map(maskStudentFields);
    }

    // 2. 获取单个学生详情
    static async getStudentById(id: string) {
        const sql = `
            SELECT st.id, st.student_no, st.name,
                   st.grade, st.major, st.phone, st.email,
                   su.username, su.role
            FROM student st
            LEFT JOIN syst_user su ON st.id = su.id
            WHERE st.id = $1
        `;
        const result = await pool.query(sql, [id]);
        const row = result.rows[0];
        return row ? maskStudentFields(row) : null;
    }

    // 3. 管理员创建学生（事务：同时创建 syst_user 登录账号 和 student 档案）
    static async createStudent(
        studentNo: string,
        name: string,
        password: string,
        grade?: string,
        major?: string,
        phone?: string,
        email?: string
    ) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const id = `u_${Date.now()}`;
            const now = Date.now();

            // 第一步：创建登录账号
            const userSql = `
                INSERT INTO syst_user (id, username, password, role)
                VALUES ($1, $2, $3, 'student')
            `;
            await client.query(userSql, [id, studentNo, password]);

            // 第二步：创建学生档案
            const studentSql = `
                INSERT INTO student (id, student_no, name, grade, major, phone, email)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const result = await client.query(studentSql, [
                id, studentNo, name,
                grade || null, major || null,
                phone || null, email || null
            ]);

            await client.query('COMMIT');
            return { ...result.rows[0], username: studentNo, role: 'student' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 4. 管理员编辑学生信息（动态更新：只修改前端传过来的字段）
    static async updateStudent(id: string, fields: Record<string, any>) {
        // 白名单：只允许更新这些字段
        const allowedFields = ['name', 'student_no', 'grade', 'major', 'phone', 'email'];
        const setClauses: string[] = [];
        const params: any[] = [];
        let i = 1;

        for (const key of allowedFields) {
            if (fields[key] !== undefined) {
                setClauses.push(`${key} = $${i}`);
                params.push(fields[key]);
                i++;
            }
        }

        if (setClauses.length === 0) {
            return 0; // 没有可更新字段
        }

        // 同时更新 syst_user 的 username（若 student_no 被修改）
        const newStudentNo = fields['student_no'];
        if (newStudentNo !== undefined) {
            const updateUserSql = `UPDATE syst_user SET username = $1 WHERE id = $2`;
            await pool.query(updateUserSql, [newStudentNo, id]);
        }

        params.push(id);
        const sql = `UPDATE student SET ${setClauses.join(', ')} WHERE id = $${i}`;
        const result = await pool.query(sql, params);
        return result.rowCount;
    }

    // 5. 管理员重置学生密码
    static async resetStudentPassword(id: string, newPassword: string) {
        const sql = `UPDATE syst_user SET password = $1 WHERE id = $2 AND role = 'student'`;
        const result = await pool.query(sql, [newPassword, id]);
        return result.rowCount;
    }

    // 6. 管理员删除学生（事务：清理关联数据）
    static async deleteStudent(id: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 按依赖顺序清理关联数据
            await client.query(`DELETE FROM notice_read WHERE student_id = $1`, [id]);
            await client.query(`DELETE FROM student_process WHERE student_id = $1`, [id]);
            await client.query(`DELETE FROM process_action_log WHERE student_id = $1`, [id]);
            await client.query(`DELETE FROM approval_log WHERE approver_id = $1`, [id]);
            await client.query(
                `DELETE FROM result_file WHERE application_id IN (SELECT id FROM application WHERE applicant_student_id = $1)`,
                [id]
            );
            await client.query(`DELETE FROM approval_log WHERE application_id IN (SELECT id FROM application WHERE applicant_student_id = $1)`, [id]);
            await client.query(`DELETE FROM application WHERE applicant_student_id = $1`, [id]);
            await client.query(`DELETE FROM student WHERE id = $1`, [id]);
            await client.query(`DELETE FROM syst_user WHERE id = $1`, [id]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
