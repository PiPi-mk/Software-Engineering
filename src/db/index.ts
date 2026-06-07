import { Pool } from 'pg';

export const pool = new Pool({
    user: 'system',
    host: 'localhost',
    database: 'test',
    password: '2608760170wanG',
    port: 54321,
});

// 修正通知标题、正文中文乱码 —— 每次获取新连接时强制设置为 UTF-8 编码
pool.on('connect', async (client) => {
    try {
        await client.query("SET client_encoding = 'UTF8'");
    } catch (e) {
        // 编码设置失败不阻断连接，但打印日志方便排查
        console.warn('设置数据库编码为 UTF-8 失败:', e);
    }
});

pool.on('error', (err) => {
    console.error('金仓数据库连接异常:', err);
});