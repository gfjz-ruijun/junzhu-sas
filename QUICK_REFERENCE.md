# JunZhu-SAS 快速参考指南

## 📋 部署前检查清单

- [ ] GitHub OAuth应用已创建（获得Client ID和Secret）
- [ ] 服务器IP地址：156.226.181.246
- [ ] 域名已解析到服务器IP
- [ ] SSH访问已配置
- [ ] 已备份重要数据

---

## 🚀 5分钟快速部署

### 步骤1：连接到服务器

```bash
ssh root@156.226.181.246
```

### 步骤2：准备部署目录

```bash
mkdir -p /var/www/junzhu-sas
cd /var/www/junzhu-sas
git clone https://github.com/gfjz-ruijun/junzhu-sas.git .
```

### 步骤3：创建.env文件

```bash
cat > .env << 'EOF'
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://your-domain.com/api/github/callback
DATABASE_URL=mysql://junzhu_user:your_password@localhost:3306/junzhu_sas
JWT_SECRET=$(openssl rand -hex 32)
VITE_APP_TITLE="JunZhu-SAS 个人学业分析系统"
PORT=30002
NODE_ENV=production
EOF
```

### 步骤4：运行部署脚本

```bash
chmod +x deploy-production.sh
sudo bash deploy-production.sh
```

### 步骤5：配置Nginx和SSL

```bash
# 复制Nginx配置
sudo cp nginx-config.example /etc/nginx/sites-available/junzhu-sas
sudo nano /etc/nginx/sites-available/junzhu-sas  # 编辑域名

# 启用Nginx配置
sudo ln -s /etc/nginx/sites-available/junzhu-sas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 申请SSL证书
sudo certbot certonly --nginx -d your-domain.com
```

### 步骤6：验证部署

访问 `https://your-domain.com`，应该能看到登录页面。

---

## 📚 文档导航

| 文档 | 用途 |
|------|------|
| **DEPLOYMENT_COMPLETE_GUIDE.md** | 完整部署指南（推荐首先阅读） |
| **GITHUB_OAUTH_SETUP.md** | GitHub OAuth配置说明 |
| **deploy-production.sh** | 自动部署脚本 |
| **nginx-config.example** | Nginx配置模板 |
| **README.md** | 项目介绍 |

---

## 🔧 常用命令

### 应用管理

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs junzhu-sas

# 实时监控
pm2 monit

# 重启应用
pm2 restart junzhu-sas

# 停止应用
pm2 stop junzhu-sas

# 启动应用
pm2 start junzhu-sas
```

### 数据库管理

```bash
# 登录MySQL
mysql -u junzhu_user -p -h localhost junzhu_sas

# 备份数据库
mysqldump -u junzhu_user -p junzhu_sas > backup.sql

# 恢复数据库
mysql -u junzhu_user -p junzhu_sas < backup.sql
```

### 日志查看

```bash
# 应用错误日志
pm2 logs junzhu-sas --err

# Nginx错误日志
sudo tail -f /var/log/nginx/junzhu-sas-error.log

# 系统日志
sudo journalctl -xe
```

### 更新应用

```bash
cd /var/www/junzhu-sas
git pull origin main
pnpm install
pnpm db:push
pnpm build
pm2 restart junzhu-sas
```

---

## 🔑 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth应用ID | `abc123def456` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth应用密钥 | `ghp_xxxxxxxxxxxx` |
| `GITHUB_REDIRECT_URI` | GitHub回调URL | `https://example.com/api/github/callback` |
| `DATABASE_URL` | 数据库连接字符串 | `mysql://user:pass@localhost/db` |
| `JWT_SECRET` | JWT签名密钥 | `随机字符串` |
| `VITE_APP_TITLE` | 应用标题 | `JunZhu-SAS` |
| `PORT` | 应用端口 | `30002` |
| `NODE_ENV` | 运行环境 | `production` |

---

## 🆘 故障排查

### 问题：应用无法启动

```bash
# 查看详细错误
pm2 logs junzhu-sas

# 检查端口占用
ss -tlnp | grep 30002

# 检查.env文件
cat .env

# 检查数据库连接
mysql -u junzhu_user -p -h localhost junzhu_sas
```

### 问题：GitHub登录失败

```bash
# 检查环境变量
echo $GITHUB_CLIENT_ID
echo $GITHUB_REDIRECT_URI

# 检查GitHub应用设置
# 访问 https://github.com/settings/developers
# 验证回调URL是否正确
```

### 问题：Nginx显示502错误

```bash
# 检查应用是否运行
pm2 status

# 检查Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/junzhu-sas-error.log

# 重启Nginx
sudo systemctl restart nginx
```

### 问题：数据库连接失败

```bash
# 检查MySQL服务
sudo systemctl status mysql

# 验证数据库存在
mysql -u root -p -e "SHOW DATABASES;"

# 验证用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'junzhu_user'@'localhost';"
```

---

## 📊 性能优化

### 启用Gzip压缩

Nginx配置中已包含Gzip配置，自动启用。

### 启用缓存

```bash
# 静态文件缓存已在Nginx配置中启用
# 缓存时间：1年
```

### 数据库优化

```bash
# 查看慢查询日志
mysql -u root -p -e "SHOW VARIABLES LIKE 'slow_query%';"

# 启用慢查询日志
mysql -u root -p -e "SET GLOBAL slow_query_log = 'ON';"
```

### 监控系统资源

```bash
# 查看内存使用
free -h

# 查看CPU使用
top

# 查看磁盘使用
df -h
```

---

## 🔒 安全建议

### 1. 定期更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. 配置防火墙

```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 3. 定期备份

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-junzhu.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/junzhu-sas"
mkdir -p $BACKUP_DIR
mysqldump -u junzhu_user -p'password' junzhu_sas > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql
tar -czf $BACKUP_DIR/app_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/junzhu-sas
EOF

chmod +x /usr/local/bin/backup-junzhu.sh

# 添加定时任务
crontab -e
# 添加: 0 2 * * * /usr/local/bin/backup-junzhu.sh
```

### 4. 监控日志

```bash
# 查看失败的登录尝试
sudo grep "Failed password" /var/log/auth.log

# 查看Nginx访问日志
sudo tail -f /var/log/nginx/junzhu-sas-access.log
```

### 5. 保护敏感文件

```bash
# 限制.env文件权限
chmod 600 /var/www/junzhu-sas/.env

# 限制目录权限
chmod 755 /var/www/junzhu-sas
```

---

## 📞 获取帮助

- **邮件**：gfjz.0326@qq.com
- **GitHub Issues**：https://github.com/gfjz-ruijun/junzhu-sas/issues
- **网站**：https://gfjzz.cn

---

## 📝 更新日志

### v1.0.0（当前版本）

- ✅ 完整的学科管理系统
- ✅ 考试成绩记录和分析
- ✅ 成绩趋势可视化
- ✅ 排名记录和分析
- ✅ GitHub OAuth认证
- ✅ 响应式设计

---

**祝你部署顺利！** 🚀

