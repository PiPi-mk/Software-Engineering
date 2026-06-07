/**
 * 统一隐私脱敏工具 — 保证 API 返回和 CSV 导出的敏感字段遮蔽一致
 */

// 手机号：中间4位打星号  13812341234 → 138****1234
export function maskPhone(phone: string | null | undefined): string {
    if (!phone) return '';
    if (phone.length < 7) return phone.replace(/./g, '*');
    return phone.substring(0, 3) + '****' + phone.substring(7);
}

// 邮箱：首字符保留，其余用户名部分打星号  test@example.com → t***@example.com
export function maskEmail(email: string | null | undefined): string {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    if (atIndex <= 1) return email;
    return email[0] + '***' + email.substring(atIndex);
}

// 对学生数据中的敏感字段统一脱敏
export function maskStudentFields(row: Record<string, any>): Record<string, any> {
    return {
        ...row,
        phone: maskPhone(row.phone),
        email: maskEmail(row.email),
    };
}
