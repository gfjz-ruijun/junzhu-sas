# JunZhu-SAS 完整部署指南

本指南将帮助你在服务器上完整部署JunZhu-SAS应用，包括所有必要的配置和环境设置。

## 目录

1. [前置要求](#前置要求)
2. [第一步：准备GitHub OAuth应用](#第一步准备github-oauth应用)
3. [第二步：准备服务器](#第二步准备服务器)
4. [第三步：安装依赖](#第三步安装依赖)
5. [第四步：配置数据库](#第四步配置数据库)
6. [第五步：配置应用](#第五步配置应用)
7. [第六步：部署应用](#第六步部署应用)
8. [第七步：配置Nginx反向代理](#第七步配置nginx反向代理)
9. [第八步：配置SSL证书](#第八步配置ssl证书)
10. [部署后维护](#部署后维护)
11. [常见问题](#常见问题)

---

## 前置要求

- **服务器**：Linux系统（Ubuntu 20.04+推荐）
- **SSH访问**：能够通过SSH连接到服务器
- **域名**：用于配置GitHub OAuth回调URL
- **GitHub账户**：用于创建OAuth应用

---

## 第一步：准备GitHub OAuth应用

### 1.1 创建GitHub OAuth应用

1. 访问 https://github.com/settings/developers
2. 点击左侧菜单的 "OAuth Apps"
3. 点击 "New OAuth App"
4. 填写以下信息：

| 字段 | 值 |
|------|-----|
| Application name | JunZhu-SAS |
| Homepage URL | `https://your-domain.com` |
| Application description | Personal Academic Analysis System |
| Authorization callback URL | `https://your-domain.com/api/github/callback` |

5. 点击 "Register application"

### 1.2 获取凭证

创建应用后，你会看到：
- **Client ID** - 复制保存
- **Client Secret** - 点击"Generate a new client secret"并复制保存

⚠️ **重要**：Client Secret只显示一次，请妥善保管！

---

## 第二步：准备服务器

### 2.1 连接到服务器

```bash
ssh root@156.226.181.246
```

### 2.2 更新系统

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.3 创建应用目录

```bash
mkdir -p /var/www/junzhu-sas
cd /var/www/junzhu-sas
```

---

## 第三步：安装依赖

### 3.1 安装Node.js和npm

```bash
# 安装Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 3.2 安装pnpm

```bash
npm install -g pnpm

# 验证安装
pnpm --version
```

### 3.3 安装MySQL

```bash
sudo apt install -y mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 验证安装
mysql --version
```

### 3.4 安装PM2（进程管理）

```bash
npm install -g pm2

# 验证安装
pm2 --version
```

### 3.5 安装Nginx（反向代理）

```bash
sudo apt install -y nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
nginx -v
```

### 3.6 安装Certbot（SSL证书）

```bash
sudo apt install -y certbot python3-certbot-nginx

# 验证安装
certbot --version
```

---

## 第四步：配置数据库

### 4.1 创建数据库和用户

```bash
# 登录MySQL
sudo mysql -u root

# 在MySQL命令行中执行：
CREATE DATABASE junzhu_sas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'junzhu_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON junzhu_sas.* TO 'junzhu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4.2 验证数据库连接

```bash
mysql -u junzhu_user -p -h localhost junzhu_sas

# 输入密码后，如果成功进入MySQL命令行，说明连接正常
# 输入 EXIT; 退出
```

---

## 第五步：配置应用

### 5.1 克隆项目代码

```bash
cd /var/www/junzhu-sas

# 使用git克隆
git clone https://github.com/gfjz-ruijun/junzhu-sas.git .

# 或者如果已经有代码，更新代码
git pull origin main
```

### 5.2 创建.env文件

```bash
cd /var/www/junzhu-sas
nano .env
```

复制以下内容，并填入你的实际值：

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=https://your-domain.com/api/github/callback

# Database Configuration
DATABASE_URL=mysql://junzhu_user:your_secure_password@localhost:3306/junzhu_sas

# JWT Secret (生成随机字符串，例如使用: openssl rand -hex 32)
JWT_SECRET=your_random_jwt_secret_here

# Application Configuration
VITE_APP_TITLE="JunZhu-SAS 个人学业分析系统"
VITE_APP_LOGO="https://your-logo-url.png"

# Server Configuration
PORT=30002
NODE_ENV=production
```

### 5.3 生成JWT密钥

```bash
openssl rand -hex 32
```

复制输出的字符串，粘贴到.env文件的JWT_SECRET中。

### 5.4 保护.env文件

```bash
chmod 600 .env
```

---

## 第六步：部署应用

### 6.1 安装项目依赖

```bash
cd /var/www/junzhu-sas
pnpm install
```

这可能需要几分钟，请耐心等待。

### 6.2 执行数据库迁移

```bash
pnpm db:push
```

这会创建所有必要的数据库表。

### 6.3 构建应用

```bash
pnpm build
```

构建过程可能需要几分钟。

### 6.4 启动应用

```bash
# 使用PM2启动应用
pm2 start "npm run start" --name "junzhu-sas" --env NODE_ENV=production

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup
```

### 6.5 验证应用运行

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs junzhu-sas

# 检查端口是否监听
ss -tlnp | grep 30002
```

---

## 第七步：配置Nginx反向代理

### 7.1 创建Nginx配置文件

```bash
sudo nano /etc/nginx/sites-available/junzhu-sas
```

复制以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向HTTP到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置（在配置SSL后自动生成）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志文件
    access_log /var/log/nginx/junzhu-sas-access.log;
    error_log /var/log/nginx/junzhu-sas-error.log;

    # 反向代理配置
    location / {
        proxy_pass http://127.0.0.1:30002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 增加超时时间
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.2 启用Nginx配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/junzhu-sas /etc/nginx/sites-enabled/

# 测试Nginx配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx
```

---

## 第八步：配置SSL证书

### 8.1 使用Certbot申请证书

```bash
sudo certbot certonly --nginx -d your-domain.com
```

按照提示输入邮箱地址和其他信息。

### 8.2 验证证书

```bash
sudo certbot certificates
```

### 8.3 自动续期

Certbot会自动配置续期任务，你可以验证：

```bash
sudo systemctl status certbot.timer
```

---

## 部署后维护

### 应用管理

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs junzhu-sas

# 实时监控应用
pm2 monit

# 重启应用
pm2 restart junzhu-sas

# 停止应用
pm2 stop junzhu-sas

# 启动应用
pm2 start junzhu-sas

# 删除应用
pm2 delete junzhu-sas
```

### 数据库备份

```bash
# 备份数据库
mysqldump -u junzhu_user -p junzhu_sas > junzhu_sas_backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u junzhu_user -p junzhu_sas < junzhu_sas_backup_20240101.sql
```

### 更新应用

```bash
cd /var/www/junzhu-sas

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install

# 数据库迁移
pnpm db:push

# 构建应用
pnpm build

# 重启应用
pm2 restart junzhu-sas
```

### 查看日志

```bash
# 查看应用日志
tail -f /home/ubuntu/.pm2/logs/junzhu-sas-error.log

# 查看Nginx日志
sudo tail -f /var/log/nginx/junzhu-sas-error.log
```

---

## 常见问题

### 1. GitHub OAuth登录失败

**问题**：用户点击登录后无法重定向到GitHub

**解决方案**：
- 检查GitHub应用的Client ID和Secret是否正确
- 确保GITHUB_REDIRECT_URI与GitHub应用设置中的回调URL完全匹配
- 检查.env文件是否正确加载

```bash
# 检查环境变量
echo $GITHUB_CLIENT_ID
echo $GITHUB_REDIRECT_URI
```

### 2. 数据库连接失败

**问题**：应用启动时报"Cannot connect to database"

**解决方案**：
- 检查MySQL服务是否运行：`sudo systemctl status mysql`
- 验证数据库连接字符串：`mysql -u junzhu_user -p -h localhost junzhu_sas`
- 检查数据库用户权限

```bash
# 重新授权
sudo mysql -u root
GRANT ALL PRIVILEGES ON junzhu_sas.* TO 'junzhu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 应用无法启动

**问题**：PM2显示应用已停止

**解决方案**：
- 查看应用日志：`pm2 logs junzhu-sas`
- 检查Node.js版本：`node --version`
- 检查端口是否被占用：`ss -tlnp | grep 30002`
- 检查.env文件是否存在：`ls -la .env`

### 4. Nginx反向代理不工作

**问题**：访问域名显示502 Bad Gateway

**解决方案**：
- 检查应用是否运行：`pm2 status`
- 检查Nginx配置：`sudo nginx -t`
- 查看Nginx错误日志：`sudo tail -f /var/log/nginx/junzhu-sas-error.log`
- 确保防火墙允许30002端口

```bash
# 检查防火墙
sudo ufw status

# 允许30002端口
sudo ufw allow 30002
```

### 5. SSL证书过期

**问题**：浏览器显示SSL证书过期

**解决方案**：
- 手动续期：`sudo certbot renew`
- 检查自动续期：`sudo systemctl status certbot.timer`
- 查看证书信息：`sudo certbot certificates`

### 6. 内存不足

**问题**：应用经常崩溃，PM2日志显示内存溢出

**解决方案**：
- 增加Node.js堆内存：
```bash
pm2 delete junzhu-sas
pm2 start "node --max-old-space-size=2048 dist/index.js" --name "junzhu-sas"
pm2 save
```

### 7. 性能缓慢

**问题**：应用响应速度慢

**解决方案**：
- 检查数据库查询：`mysql -u junzhu_user -p -e "SHOW PROCESSLIST;"`
- 启用查询日志：在MySQL配置中启用slow query log
- 优化Nginx缓存配置
- 考虑使用Redis缓存

---

## 监控和告警

### 使用PM2 Plus监控

```bash
# 连接PM2 Plus账户
pm2 link your_secret_key your_public_key

# 启用监控
pm2 monitor
```

### 使用Prometheus和Grafana

```bash
# 安装Prometheus
sudo apt install -y prometheus

# 安装Grafana
sudo apt install -y grafana-server

# 启动服务
sudo systemctl start prometheus
sudo systemctl start grafana-server
```

---

## 安全建议

1. **定期更新系统**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **配置防火墙**
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. **定期备份数据库**
```bash
# 创建定时任务
crontab -e

# 添加每天凌晨2点备份
0 2 * * * mysqldump -u junzhu_user -p'password' junzhu_sas > /backup/junzhu_sas_$(date +\%Y\%m\%d).sql
```

4. **监控日志**
```bash
# 查看系统日志
sudo journalctl -xe

# 查看应用日志
pm2 logs
```

5. **保护敏感信息**
```bash
# 确保.env文件权限正确
chmod 600 .env

# 不要将.env提交到版本控制
echo ".env" >> .gitignore
```

---

## 获取帮助

如有问题，请联系：

- **邮件**：gfjz.0326@qq.com
- **GitHub**：https://github.com/gfjz-ruijun/junzhu-sas
- **网站**：https://gfjzz.cn

---

## 部署检查清单

- [ ] GitHub OAuth应用已创建
- [ ] 服务器已更新和配置
- [ ] Node.js、pnpm、MySQL、Nginx已安装
- [ ] 数据库已创建和配置
- [ ] .env文件已创建和配置
- [ ] 项目依赖已安装
- [ ] 数据库迁移已执行
- [ ] 应用已构建
- [ ] PM2已启动应用
- [ ] Nginx反向代理已配置
- [ ] SSL证书已申请
- [ ] 应用可以通过域名访问
- [ ] GitHub登录功能正常
- [ ] 定期备份已配置

---

**祝部署顺利！** 🚀

