//入党团流程
import { pool } from '../db';

export class ProcessService {
    
    // 1. 获取某个流程（如 '入党'）的全部阶段节点
    static async getStages(processType: string) {
        const sql = `
            SELECT * FROM process_stage 
            WHERE process_type = $1 
            ORDER BY stage_order ASC
        `;
        const result = await pool.query(sql, [processType]);
        return result.rows;
    }

    // 2. 保存或更新流程阶段（管理端配置流程）
    static async saveStage(
        id: string, 
        processType: string, 
        stageOrder: number, 
        name: string, 
        description: string = '', 
        ownerRole: string = 'admin'
    ) {
        // 利用 ON CONFLICT 实现：如果有这个 ID 就更新，没有就插入
        const sql = `
            INSERT INTO process_stage (id, process_type, stage_order, name, description, owner_role)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
                process_type = $2,
                stage_order = $3,
                name = $4,
                description = $5,
                owner_role = $6
            RETURNING *
        `;
        const result = await pool.query(sql, [id, processType, stageOrder, name, description, ownerRole]);
        return result.rows[0];
    }

    // 3. 查询某个学生的当前进度
    static async getStudentProgress(studentId: string, processType: string) {
        // 使用 LEFT JOIN，顺便把阶段的具体名称和顺序查出来，方便前端直接展示
        const sql = `
            SELECT sp.*, ps.name as stage_name, ps.stage_order 
            FROM student_process sp
            LEFT JOIN process_stage ps ON sp.current_stage_id = ps.id
            WHERE sp.student_id = $1 AND sp.process_type = $2
        `;
        const result = await pool.query(sql, [studentId, processType]);
        return result.rows[0] || null;
    }

    // 4. 更新学生进度并写入操作日志 (核心：使用数据库事务保证数据强一致性)
    static async updateStudentProgress(
        studentId: string, 
        processType: string, 
        newStageId: string, 
        operatorId: string, 
        comment: string = ''
    ) {
        // 从连接池获取一个专属客户端来执行事务
        const client = await pool.connect();
        
        try {
            // 开启事务
            await client.query('BEGIN');
            const now = Date.now();

            // 第一步：更新或插入学生的当前进度表
            const progressSql = `
                INSERT INTO student_process (student_id, process_type, current_stage_id, updated_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (student_id, process_type) 
                DO UPDATE SET current_stage_id = $3, updated_at = $4
            `;
            await client.query(progressSql, [studentId, processType, newStageId, now]);

            // 第二步：写入操作日志留痕
            const logId = `log_${now}_${Math.floor(Math.random() * 1000)}`;
            const logSql = `
                INSERT INTO process_action_log (id, student_id, process_type, action_type, comment, operator_id, created_at)
                VALUES ($1, $2, $3, '更新进度', $4, $5, $6)
            `;
            await client.query(logSql, [logId, studentId, processType, comment, operatorId, now]);

            // 全部成功，提交事务
            await client.query('COMMIT');
            return true;
        } catch (error) {
            // 发生任何错误，回滚撤销所有操作，保证数据不被破坏
            await client.query('ROLLBACK');
            throw error; // 把错误抛给上一层 Controller 处理
        } finally {
            // 释放客户端连接回连接池
            client.release();
        }
    }
}