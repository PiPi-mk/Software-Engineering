const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // 引入金仓数据库连接工具

const app = express();

// 允许前端跨域访问
app.use(cors());
// 允许服务器接收前端发来的 JSON 数据
app.use(express.json());

// 1. 配置 Kingbase（金仓）数据库连接
const pool = new Pool({
    user: 'system',          // 数据库用户名
    host: 'localhost',       // 数据库所在的 IP 地址
    database: 'test',        // 数据库名称
    password: '2608760170wanG',
    port: 54321,             // 端口
});

// 测试数据库是否能成功连通
pool.connect()
    .then(() => {
        console.log('Kingbase 数据库连接成功');
    })
    .catch(err => {
        console.error('数据库连接失败，请检查配置。错误原因:', err.message);
    });


// 2. 后端 API 接口

/**
 * 接口 1：获取通知列表 (GET)
 * 对应前端：页面加载时，自动调用拉取表格数据
 */
app.get('/api/notices', async (req, res) => {
    try {
        // 从数据库查询所有通知，按发布时间倒序排列（最新的在最上面）
        const result = await pool.query('SELECT * FROM notice ORDER BY publish_time DESC');
        
        // 将数据库的下划线字段格式，转换成前端需要的驼峰字段格式 (publishTime)
        const formatData = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            content: row.content,
            status: row.status,
            // 将数据库的时间转为前端习惯的本地时间字符串
            publishTime: new Date(row.publish_time).toLocaleString('zh-CN', { hour12: false })
        }));

        // 返回统一的格式给前端
        res.send({ 
            code: 200, 
            message: '获取成功', 
            data: formatData 
        });
    } catch (err) {
        res.send({ 
            code: 500, 
            message: '服务器内部错误：查询通知列表失败', 
            data: err.message 
        });
    }
});

/**
 * 接口 2：新建通知 (POST)
 * 对应前端：点击“新建通知”弹窗里的“保存”按钮
 */
app.post('/api/notices', async (req, res) => {
    const { title, content } = req.body;
    try {
        // 使用 $1, $2 安全占位符，将标题和正文插入 notice 表，状态默认为 '未发布'
        const sql = `INSERT INTO notice (title, content, status) VALUES ($1, $2, '未发布') RETURNING *`;
        await pool.query(sql, [title, content]);
        
        res.send({ 
            code: 200, 
            message: '新建成功', 
            data: null 
        });
    } catch (err) {
        res.send({ 
            code: 500, 
            message: '服务器内部错误：新建通知失败', 
            data: err.message 
        });
    }
});

/**
 * 接口 3：编辑/修改通知 (PUT)
 * 对应前端：点击某行通知的“编辑”按钮，修改内容后点击“保存”
 */
app.put('/api/notices/:id', async (req, res) => {
    const { id } = req.params; // 从网址中拿到要修改的通知 ID
    const { title, content } = req.body; // 从请求体里拿到新的标题和正文
    try {
        // 根据 ID 更新数据库中对应的数据
        const sql = `UPDATE notice SET title = $1, content = $2 WHERE id = $3`;
        const result = await pool.query(sql, [title, content, id]);
        
        // 如果影响的行数为0，说明数据库里根本没这条数据
        if (result.rowCount === 0) {
            return res.send({ code: 404, message: '找不到该通知，修改失败', data: null });
        }

        res.send({ 
            code: 200, 
            message: '修改成功', 
            data: null 
        });
    } catch (err) {
        res.send({ 
            code: 500, 
            message: '服务器内部错误：修改通知失败', 
            data: err.message 
        });
    }
});

/**
 * 接口 4：删除通知 (DELETE)
 * 对应前端：点击某行通知右侧红色的“删除”按钮
 */
app.delete('/api/notices/:id', async (req, res) => {
    const { id } = req.params; // 从网址中拿到要删除的通知 ID
    try {
        // 根据 ID 从数据库中彻底删除该条记录
        await pool.query('DELETE FROM notice WHERE id = $1', [id]);
        
        res.send({ 
            code: 200, 
            message: '删除成功', 
            data: null 
        });
    } catch (err) {
        res.send({ 
            code: 500, 
            message: '服务器内部错误：删除通知失败', 
            data: err.message 
        });
    }
});


// 3. 启动服务器并监听 3000 端口
app.listen(3000, () => {
    console.log('后端服务器已启动,准备接收前端请求...');
    console.log('监听地址: http://localhost:3000');
});