# JunZhu-SAS 应用维护指南

本指南提供应用的日常维护、监控和故障排查方法。

## 日常维护任务

### 每日检查

```bash
# 检查应用状态
pm2 status

# 查看应用日志
pm2 logs junzhu-sas --lines 50

# 检查磁盘使用情况
df -h

# 检查内存使用情况
free -h
```

### 每周任务

```bash
# 检查是否有新的更新
cd /www/wwwroot/junzhu-sas
git fetch origin
git log --oneline main..origin/main

# 检查依赖是否有安全漏洞
pnpm audit

# 检查数据库大小
mysql -h localhost -u junzhu_user -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.tables WHERE table_schema = 'junzhu_sas';"
```

### 每月任务

```bash
# 备份数据库
mysqldump -h localhost -u junzhu_user -p junzhu_sas > /backup/junzhu_sas_$(date +%Y%m%d).sql

# 检查日志文件大小
ls -lh ~/.pm2/logs/

# 清理旧日志
pm2 flush

# 检查系统更新
apt update
apt list --upgradable
```

## 监控和告警

### 应用监控

```bash
# 实时监控应用
pm2 monit

# 查看应用详细信息
pm2 show junzhu-sas

# 查看应用重启次数
pm2 logs junzhu-sas | grep "restart"
```

### 数据库监控

```bash
# 连接到数据库
mysql -h localhost -u junzhu_user -p junzhu_sas

# 查看表的行数
SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'junzhu_sas';

# 查看数据库大小
SELECT SUM(data_length + index_length) / 1024 / 1024 / 1024 AS size_gb FROM information_schema.tables WHERE table_schema = 'junzhu_sas';

# 查看最近的查询
SHOW PROCESSLIST;
```

### 系统监控

```bash
# 查看 CPU 使用情况
top -b -n 1 | head -20

# 查看内存使用情况
free -h

# 查看磁盘 I/O
iostat -x 1 5

# 查看网络连接
netstat -an | grep ESTABLISHED | wc -l
```

## 性能优化

### 数据库优化

```bash
# 优化表
OPTIMIZE TABLE subjects;
OPTIMIZE TABLE examRecords;
OPTIMIZE TABLE examRankings;
OPTIMIZE TABLE users;

# 分析表
ANALYZE TABLE subjects;
ANALYZE TABLE examRecords;
ANALYZE TABLE examRankings;
ANALYZE TABLE users;

# 检查表
CHECK TABLE subjects;
CHECK TABLE examRecords;
CHECK TABLE examRankings;
CHECK TABLE users;
```

### 应用优化

```bash
# 查看应用内存使用
pm2 show junzhu-sas | grep memory

# 如果内存使用过高，重启应用
pm2 restart junzhu-sas

# 启用应用自动重启（内存超过阈值）
pm2 start junzhu-sas --max-memory-restart 500M
```

### Nginx 优化

在 1Panel 中配置 Nginx：

1. 启用 Gzip 压缩
2. 配置缓存策略
3. 启用 HTTP/2
4. 配置连接池

## 故障排查

### 应用无法启动

```bash
# 查看详细日志
pm2 logs junzhu-sas --lines 100

# 检查环境变量
cat .env

# 检查依赖
pnpm install

# 手动启动应用查看错误
npm run start
```

### 数据库连接失败

```bash
# 测试数据库连接
mysql -h localhost -u junzhu_user -p junzhu_sas

# 检查 MySQL 服务状态
systemctl status mysql

# 重启 MySQL 服务
systemctl restart mysql

# 查看 MySQL 日志
tail -f /var/log/mysql/error.log
```

### 应用响应缓慢

```bash
# 查看应用日志中的慢查询
pm2 logs junzhu-sas | grep "slow"

# 查看数据库慢查询日志
mysql -h localhost -u junzhu_user -p -e "SELECT * FROM mysql.slow_log LIMIT 10;"

# 检查数据库连接数
mysql -h localhost -u junzhu_user -p -e "SHOW PROCESSLIST;"

# 优化数据库查询
# 添加索引
ALTER TABLE examRecords ADD INDEX idx_subject_date (subjectId, examDate);
ALTER TABLE examRankings ADD INDEX idx_exam_record (examRecordId);
```

### 磁盘空间不足

```bash
# 查看磁盘使用情况
du -sh /www/wwwroot/junzhu-sas

# 清理日志文件
pm2 flush

# 清理 node_modules（如果需要重新安装）
rm -rf node_modules
pnpm install

# 清理数据库日志
mysql -h localhost -u junzhu_user -p -e "PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);"
```

## 安全维护

### 定期更新

```bash
# 更新系统
apt update
apt upgrade

# 更新应用依赖
cd /www/wwwroot/junzhu-sas
pnpm update

# 检查安全漏洞
pnpm audit
pnpm audit --fix
```

### 备份策略

```bash
# 每日备份数据库
0 2 * * * mysqldump -h localhost -u junzhu_user -p junzhu_sas > /backup/junzhu_sas_$(date +\%Y\%m\%d).sql

# 每周备份应用文件
0 3 * * 0 tar -czf /backup/junzhu_sas_$(date +\%Y\%m\%d).tar.gz /www/wwwroot/junzhu-sas

# 定期清理旧备份（保留 30 天）
0 4 * * * find /backup -name "junzhu_sas_*" -mtime +30 -delete
```

### 日志管理

```bash
# 查看应用日志
pm2 logs junzhu-sas

# 查看系统日志
journalctl -u junzhu-sas -n 100

# 清理旧日志
pm2 flush

# 定期清理日志（每月）
0 5 1 * * find ~/.pm2/logs -name "*.log" -mtime +30 -delete
```

## 常见问题

### Q: 应用占用内存过高怎么办？

A: 
```bash
# 查看内存使用
pm2 show junzhu-sas

# 重启应用
pm2 restart junzhu-sas

# 设置内存限制
pm2 start junzhu-sas --max-memory-restart 500M
```

### Q: 数据库变得很慢怎么办？

A:
```bash
# 优化表
OPTIMIZE TABLE examRecords;

# 添加索引
ALTER TABLE examRecords ADD INDEX idx_subject_date (subjectId, examDate);

# 清理旧数据（可选）
DELETE FROM examRecords WHERE examDate < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Q: 如何处理磁盘空间不足？

A:
```bash
# 查看占用空间最多的目录
du -sh /www/wwwroot/junzhu-sas/*

# 清理日志
pm2 flush

# 清理 node_modules
rm -rf node_modules && pnpm install --prod
```

### Q: 应用崩溃了怎么办？

A:
```bash
# 查看日志
pm2 logs junzhu-sas --lines 200

# 重启应用
pm2 restart junzhu-sas

# 如果问题持续，回滚到上一个版本
cd /www/wwwroot/junzhu-sas
git revert HEAD
pnpm build
pm2 restart junzhu-sas
```

## 定期维护清单

### 每日
- [ ] 检查应用状态
- [ ] 查看应用日志
- [ ] 检查磁盘使用情况

### 每周
- [ ] 检查更新
- [ ] 检查安全漏洞
- [ ] 备份数据库

### 每月
- [ ] 系统更新
- [ ] 数据库优化
- [ ] 清理日志文件
- [ ] 检查性能指标

### 每季度
- [ ] 完整备份
- [ ] 安全审计
- [ ] 性能评估
- [ ] 计划升级

## 获取帮助

遇到问题时：

1. 查看日志：`pm2 logs junzhu-sas`
2. 查看文档：阅读 DEPLOYMENT_1PANEL.md 和 UPDATE_GUIDE.md
3. 提交 Issue：https://github.com/gfjz-ruijun/junzhu-sas/issues
4. 发送邮件：gfjz.0326@qq.com

---

**定期维护是保证应用稳定运行的关键！** 🔧

