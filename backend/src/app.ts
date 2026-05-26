//主入口文件
import express from 'express';
import cors from 'cors';
import noticeRoutes from './routes/notice';
import authRoutes from './routes/auth';
import processRoutes from './routes/process';
import applicationRoutes from './routes/application';
import knowledgeRoutes from './routes/knowledge';

const app = express();

app.use(cors());
app.use(express.json());

// 挂载路由
app.use('/api/notices', noticeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/process', processRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/knowledge', knowledgeRoutes);

app.listen(3000, () => {
    console.log('TS 后端服务器已启动，监听地址: http://localhost:3000');
});