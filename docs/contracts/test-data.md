# 测试账号与样例数据（一期闭环1）

## 测试账号

建议后端在启动时内置以下用户，用于闭环1联调。

### 管理员

- username: `admin`
- password: `admin123`
- role: `admin`
- userId: `u_admin`

### 学生

- username: `student1`
- password: `student123`
- role: `student`
- userId: `u_student1`

- username: `student2`
- password: `student123`
- role: `student`
- userId: `u_student2`

## 样例通知

建议用于 UI 联调的通知样例：

- 标题：`关于 2026 年春季学期党团工作安排的通知`
- 正文：`请各位同学按通知要求完成相关事项。此通知为一期闭环1联调样例。`

## 统计口径（一期）

- total：系统内学生账号总数（不含管理员）
- readCount：已对该 noticeId 产生已读记录的学生数
- unreadCount = total - readCount

一期只做“全员通知”，因此 total 不依赖标签/人群规则。

