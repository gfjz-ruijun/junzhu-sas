# JunZhu-SAS 在 1Panel 上的部署教程

本教程将指导你在 1Panel 服务器面板上部署 JunZhu-SAS 个人学业分析系统。

## 前置要求

- 已安装 1Panel 服务器面板
- MySQL 数据库已安装并运行
- Node.js 环境（推荐 18.x 或更高版本）
- Git 已安装

## 第一步：在 1Panel 中创建 MySQL 数据库

### 1.1 打开 1Panel 面板

访问你的 1Panel 地址（通常是 `https://你的IP:9876`）

### 1.2 创建数据库

1. 在左侧菜单找到 **数据库** → **MySQL**
2. 点击 **创建数据库**
3. 填写以下信息：
   - **数据库名称**：`junzhu_sas`
   - **字符集**：`utf8mb4`
   - **排序规则**：`utf8mb4_unicode_ci`
4. 点击 **确认**

### 1.3 创建数据库用户

1. 在 MySQL 管理页面，点击 **用户管理**
2. 点击 **创建用户**
3. 填写以下信息：
   - **用户名**：`junzhu_user`
   - **密码**：设置一个强密码（记住这个密码！）
   - **主机**：`localhost` 或 `%`（允许远程连接）
4. 点击 **确认**

### 1.4 授予用户权限

1. 在用户列表中找到 `junzhu_user`
2. 点击 **权限管理**
3. 选择 `junzhu_sas` 数据库
4. 勾选所有权限（SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP 等）
5. 点击 **确认**

## 第二步：在 1Panel 中创建网站

### 2.1 创建网站

1. 在左侧菜单找到 **网站** → **网站列表**
2. 点击 **创建网站**
3. 选择 **Node.js** 应用
4. 填写以下信息：
   - **网站名称**：`junzhu-sas`
   - **域名**：输入你的域名或 IP 地址
   - **端口**：`3000`（或其他可用端口）
   - **Node.js 版本**：选择 18.x 或更高版本
5. 点击 **创建**

### 2.2 配置网站目录

1. 创建完成后，记下网站的根目录路径（通常是 `/www/wwwroot/junzhu-sas`）
2. 点击 **配置** → **目录**，确保根目录正确

## 第三步：上传项目代码

### 3.1 使用 Git 克隆项目

1. 在 1Panel 中打开 **终端**（或通过 SSH 连接到服务器）
2. 进入网站根目录：
   ```bash
   cd /www/wwwroot/junzhu-sas
   ```

3. 克隆项目代码：
   ```bash
   git clone https://github.com/gfjz-ruijun/junzhu-sas.git .
   ```

   或者如果已有代码，直接上传到该目录

### 3.2 安装依赖

```bash
# 进入项目目录
cd /www/wwwroot/junzhu-sas

# 使用 pnpm 安装依赖（推荐）
pnpm install

# 或使用 npm
npm install
```

## 第四步：配置环境变量

### 4.1 创建 .env 文件

在项目根目录创建 `.env` 文件，填写以下内容：

```env
# 数据库配置
DATABASE_URL="mysql://junzhu_user:你的密码@localhost:3306/junzhu_sas"

# JWT 密钥（生成一个随机字符串）
JWT_SECRET="生成一个随机的长字符串，例如：your-super-secret-jwt-key-12345"

# OAuth 配置（如果使用 Manus OAuth）
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"

# 应用配置
VITE_APP_TITLE="JunZhu-SAS 个人学业分析系统"
VITE_APP_LOGO="https://your-domain.com/logo.png"

# 可选：其他配置
OWNER_NAME="你的名字"
OWNER_OPEN_ID="your-open-id"
```

### 4.2 关键配置说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | MySQL 连接字符串 | `mysql://user:password@localhost:3306/dbname` |
| `JWT_SECRET` | JWT 签名密钥 | 任意长随机字符串 |
| `VITE_APP_TITLE` | 应用标题 | `JunZhu-SAS` |
| `VITE_APP_LOGO` | 应用Logo URL | `https://example.com/logo.png` |

## 第五步：数据库迁移

### 5.1 运行数据库迁移

```bash
# 进入项目目录
cd /www/wwwroot/junzhu-sas

# 推送数据库架构（创建表）
pnpm db:push

# 或使用 npm
npm run db:push
```

这个命令会根据 `drizzle/schema.ts` 自动创建所有必要的数据库表。

## 第六步：构建项目

### 6.1 构建前端和后端

```bash
# 进入项目目录
cd /www/wwwroot/junzhu-sas

# 构建项目
pnpm build

# 或使用 npm
npm run build
```

构建完成后，会生成 `dist` 文件夹。

## 第七步：在 1Panel 中配置启动脚本

### 7.1 配置 PM2 启动

1. 在 1Panel 中找到 **应用管理** → **Node.js**
2. 点击 **创建应用**
3. 填写以下信息：
   - **应用名称**：`junzhu-sas`
   - **启动脚本**：
     ```bash
     cd /www/wwwroot/junzhu-sas && npm run start
     ```
   - **监听端口**：`3000`
4. 点击 **创建**

### 7.2 或者手动使用 PM2

```bash
# 全局安装 PM2（如果还没安装）
npm install -g pm2

# 在项目目录启动应用
cd /www/wwwroot/junzhu-sas
pm2 start "npm run start" --name "junzhu-sas"

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

## 第八步：配置 Nginx 反向代理

### 8.1 在 1Panel 中配置反向代理

1. 在左侧菜单找到 **网站** → **网站列表**
2. 点击你创建的 `junzhu-sas` 网站
3. 点击 **配置** → **反向代理**
4. 添加反向代理规则：
   - **代理地址**：`http://127.0.0.1:3000`
   - **代理路径**：`/`
5. 点击 **保存**

### 8.2 配置 SSL 证书（HTTPS）

1. 在网站配置中找到 **HTTPS**
2. 点击 **申请证书**（选择 Let's Encrypt）
3. 填写域名信息
4. 点击 **申请**

## 第九步：启动应用

### 9.1 启动应用

```bash
# 使用 PM2 启动
pm2 start junzhu-sas

# 或在 1Panel 中点击网站的启动按钮
```

### 9.2 验证应用运行

1. 访问你的域名：`https://你的域名`
2. 应该能看到 JunZhu-SAS 的登录页面
3. 使用 Manus OAuth 登录

## 第十步：配置自动备份

### 10.1 在 1Panel 中设置备份

1. 找到 **系统设置** → **备份**
2. 创建备份计划：
   - **备份类型**：选择 MySQL 和网站文件
   - **备份周期**：每天或每周
   - **保留天数**：建议 30 天

## 常见问题解决

### 问题 1：数据库连接失败

**症状**：应用启动后无法连接数据库

**解决方案**：
1. 检查 `DATABASE_URL` 是否正确
2. 确认 MySQL 用户权限已授予
3. 检查防火墙是否开放 3306 端口（如果远程连接）

```bash
# 测试数据库连接
mysql -h localhost -u junzhu_user -p junzhu_sas
```

### 问题 2：应用无法启动

**症状**：PM2 显示应用已退出

**解决方案**：
1. 查看 PM2 日志：
   ```bash
   pm2 logs junzhu-sas
   ```
2. 检查 `.env` 文件是否存在且配置正确
3. 确认所有依赖已安装：
   ```bash
   pnpm install
   ```

### 问题 3：无法访问应用

**症状**：访问域名显示 502 或无法连接

**解决方案**：
1. 检查应用是否运行：
   ```bash
   pm2 status
   ```
2. 检查 Nginx 反向代理配置
3. 检查防火墙是否开放 80 和 443 端口

### 问题 4：数据库表未创建

**症状**：应用运行但数据库表不存在

**解决方案**：
```bash
# 重新运行迁移
pnpm db:push

# 或查看迁移状态
pnpm db:generate
```

## 监控和维护

### 查看应用日志

```bash
# 使用 PM2 查看实时日志
pm2 logs junzhu-sas

# 查看应用状态
pm2 status
```

### 重启应用

```bash
# 重启应用
pm2 restart junzhu-sas

# 停止应用
pm2 stop junzhu-sas

# 启动应用
pm2 start junzhu-sas
```

### 更新应用

```bash
# 进入项目目录
cd /www/wwwroot/junzhu-sas

# 拉取最新代码
git pull

# 安装依赖
pnpm install

# 运行迁移
pnpm db:push

# 构建项目
pnpm build

# 重启应用
pm2 restart junzhu-sas
```

## 性能优化建议

1. **启用 Gzip 压缩**：在 Nginx 配置中启用 gzip
2. **配置 CDN**：为静态资源配置 CDN
3. **数据库优化**：
   - 为常用查询字段添加索引
   - 定期清理过期数据
4. **缓存配置**：
   - 启用 Redis 缓存（可选）
   - 配置浏览器缓存策略

## 安全建议

1. **定期更新依赖**：
   ```bash
   pnpm update
   ```

2. **定期备份**：设置自动备份计划

3. **监控日志**：定期检查应用和系统日志

4. **限制访问**：配置防火墙规则，只允许必要的端口

5. **使用 HTTPS**：确保所有连接都使用 HTTPS

## 获取帮助

如遇到问题，可以：

1. 查看应用日志：`pm2 logs junzhu-sas`
2. 检查 1Panel 系统日志
3. 查看项目 GitHub 仓库的 Issues
4. 联系技术支持

---

**部署完成！** 🎉

现在你可以访问 `https://你的域名` 来使用 JunZhu-SAS 系统了。

