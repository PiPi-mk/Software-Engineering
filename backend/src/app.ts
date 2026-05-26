//主入口文件
import express from 'express';
import cors from 'cors';
import noticeRoutes from './routes/notice';
import authRoutes from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

// 挂载路由，前缀统一为 /api/notices
app.use('/api/notices', noticeRoutes);
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
    console.log('TS 后端服务器已启动，监听地址: http://localhost:3000');
});