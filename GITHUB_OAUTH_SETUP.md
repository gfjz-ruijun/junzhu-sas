# GitHub OAuth 配置指南

JunZhu-SAS现在使用GitHub OAuth进行用户认证。

## 第一步：在GitHub上创建OAuth应用

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写以下信息：
   - **Application name**: JunZhu-SAS
   - **Homepage URL**: `http://your-domain.com` (或 `http://localhost:3000` 用于本地开发)
   - **Authorization callback URL**: `http://your-domain.com/api/github/callback` (或 `http://localhost:3000/api/github/callback` 用于本地开发)

4. 创建应用后，你会获得：
   - **Client ID**
   - **Client Secret** (保密！)

## 第二步：配置环境变量

在你的服务器上创建 `.env` 文件，包含以下内容：

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://your-domain.com/api/github/callback

# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/junzhu_sas

# JWT Secret (生成一个随机字符串)
JWT_SECRET=your-random-jwt-secret-here

# Application Configuration
VITE_APP_TITLE="JunZhu-SAS 个人学业分析系统"
VITE_APP_LOGO="https://your-logo-url.png"

# Server Configuration
PORT=30002
NODE_ENV=production
```

## 第三步：部署应用

1. 安装依赖：
```bash
pnpm install
```

2. 执行数据库迁移：
```bash
pnpm db:push
```

3. 构建应用：
```bash
pnpm build
```

4. 启动应用：
```bash
PORT=30002 npm run start
```

## 登录流程

1. 用户访问应用首页
2. 点击"使用GitHub登录"按钮
3. 重定向到GitHub登录页面
4. 用户授权应用访问其GitHub账户信息
5. GitHub重定向回应用的回调URL
6. 应用创建用户会话并重定向到首页

## 用户信息

通过GitHub OAuth登录的用户信息包括：
- GitHub用户ID
- GitHub用户名
- 用户名称（如果设置了）
- 用户邮箱

## 注意事项

1. **安全性**：
   - 保护好你的 `GITHUB_CLIENT_SECRET`
   - 不要将 `.env` 文件提交到版本控制系统
   - 在生产环境使用HTTPS

2. **本地开发**：
   - 使用 `http://localhost:3000` 作为回调URL
   - 在GitHub应用设置中添加本地开发的回调URL

3. **多环境**：
   - 为开发、测试和生产环境分别创建GitHub OAuth应用
   - 在部署时更新相应的环境变量

## 常见问题

### 1. "Invalid redirect URI"错误
- 确保 `GITHUB_REDIRECT_URI` 与GitHub应用设置中的回调URL完全匹配

### 2. "Invalid client ID"错误
- 检查 `GITHUB_CLIENT_ID` 是否正确
- 确保环境变量已正确加载

### 3. 用户无法登录
- 检查服务器日志
- 验证GitHub应用是否已激活
- 确保数据库连接正常

## 获取帮助

- 📧 邮件：gfjz.0326@qq.com
- 🐙 GitHub：https://github.com/gfjz-ruijun/junzhu-sas
- 🌐 网站：https://gfjzz.cn

