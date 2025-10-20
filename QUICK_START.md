# JunZhu-SAS 快速开始指南

## 快速部署（3 分钟）

### 前置条件
- 1Panel 已安装
- MySQL 已安装
- Node.js 18+ 已安装
- Git 已安装

### 步骤 1：创建数据库和用户

在 1Panel 中：
1. 数据库 → MySQL → 创建数据库
   - 名称：`junzhu_sas`
   - 字符集：`utf8mb4`
2. 用户管理 → 创建用户
   - 用户名：`junzhu_user`
   - 密码：设置一个强密码
3. 授予用户 `junzhu_sas` 数据库的所有权限

### 步骤 2：创建网站

在 1Panel 中：
1. 网站 → 创建网站
   - 选择 Node.js 应用
   - 名称：`junzhu-sas`
   - 域名：你的域名或 IP
   - 端口：`3000`
2. 记下网站根目录（通常是 `/www/wwwroot/junzhu-sas`）

### 步骤 3：上传代码

```bash
cd /www/wwwroot/junzhu-sas
git clone https://github.com/gfjz-ruijun/junzhu-sas.git .
pnpm install
```

### 步骤 4：配置环境变量

在项目根目录创建 `.env` 文件，包含以下内容：

```
DATABASE_URL=mysql://junzhu_user:密码@localhost:3306/junzhu_sas
JWT_SECRET=生成随机字符串
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_TITLE=JunZhu-SAS 个人学业分析系统
VITE_APP_LOGO=https://your-domain.com/logo.png
```

### 步骤 5：数据库迁移和构建

```bash
pnpm db:push
pnpm build
```

### 步骤 6：启动应用

```bash
pm2 start "npm run start" --name "junzhu-sas"
pm2 save
pm2 startup
```

### 步骤 7：配置反向代理

在 1Panel 中：
1. 网站 → 配置 → 反向代理
2. 代理地址：`http://127.0.0.1:3000`
3. 代理路径：`/`

### 步骤 8：访问应用

访问你的域名：`https://你的域名`

## 常用命令

```bash
pm2 status
pm2 logs junzhu-sas
pm2 restart junzhu-sas
pm2 stop junzhu-sas
pm2 start junzhu-sas
```

## 遇到问题？

### 数据库连接失败
- 检查 DATABASE_URL 是否正确
- 确认数据库用户权限已授予
- 测试连接：`mysql -h localhost -u junzhu_user -p`

### 应用无法启动
- 查看日志：`pm2 logs junzhu-sas`
- 检查 .env 文件是否存在
- 确认依赖已安装：`pnpm install`

### 无法访问应用
- 检查应用是否运行：`pm2 status`
- 检查反向代理配置
- 检查防火墙端口是否开放

## 详细部署教程

查看 `DEPLOYMENT_1PANEL.md` 获取完整的部署指南。

## 获取帮助

- GitHub: https://github.com/gfjz-ruijun/junzhu-sas
- 查看应用日志：`pm2 logs junzhu-sas`
- 检查 1Panel 系统日志

