import { pool } from '../db';

/**
 * 通用操作审计日志写入
 * @param operatorId  操作人 ID
 * @param action      动作描述（如 '创建学生'、'修改政策'）
 * @param targetType  操作对象类型（如 'student'、'policy'）
 * @param targetId    操作对象 ID
 * @param detail      变更详情（JSON 或文字描述）
 */
export async function writeAuditLog(
    operatorId: string,
    action: string,
    targetType: string,
    targetId: string,
    detail: string = '',
    operatorRole: string = '',
    ip: string = ''
) {
    try {
        // id 为 integer 自增序列，不传值让数据库自动生成
        const now = Date.now();
        const sql = `
            INSERT INTO audit_log (operator_id, operator_role, action, target_type, target_id, detail, ip, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        await pool.query(sql, [operatorId, operatorRole, action, targetType, targetId, detail, ip, now]);
    } catch (e) {
        // 审计写入失败不应阻断主业务
        console.warn('审计日志写入失败:', e);
    }
}
