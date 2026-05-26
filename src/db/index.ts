import { Pool } from 'pg';

export const pool = new Pool({
    user: 'system',
    host: 'localhost',
    database: 'test',
    password: '2608760170wanG',
    port: 54321,
});

pool.on('error', (err) => {
    console.error('金仓数据库连接异常:', err);
});