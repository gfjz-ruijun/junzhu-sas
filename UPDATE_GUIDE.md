# JunZhu-SAS 应用更新指南

本指南说明如何更新 JunZhu-SAS 应用到最新版本。

## 更新前的准备

### 1. 备份数据

在更新前，强烈建议备份数据库和应用文件：

```bash
# 在 1Panel 中备份数据库
# 进入 1Panel → 数据库 → MySQL → 数据库列表 → junzhu_sas → 备份

# 或使用命令行备份
mysqldump -h localhost -u junzhu_user -p junzhu_sas > junzhu_sas_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 停止应用

```bash
# 停止应用
pm2 stop junzhu-sas

# 或在 1Panel 中停止应用
```

## 更新方式

### 方式 1：使用 Git 更新（推荐）

这是最简单和最安全的更新方式。

```bash
# 进入项目目录
cd /www/wwwroot/junzhu-sas

# 拉取最新代码
git pull origin main

# 安装新的依赖（如果有）
pnpm install

# 运行数据库迁移（如果有新的表或字段）
pnpm db:push

# 构建项目
pnpm build

# 重启应用
pm2 restart junzhu-sas
```

### 方式 2：手动更新

如果不使用 Git，可以手动更新文件。

```bash
# 1. 下载最新代码（从 GitHub 下载 ZIP）
# https://github.com/gfjz-ruijun/junzhu-sas/archive/refs/heads/main.zip

# 2. 解压文件到项目目录
cd /www/wwwroot/junzhu-sas
# 将下载的文件解压到此目录

# 3. 安装依赖
pnpm install

# 4. 运行迁移
pnpm db:push

# 5. 构建项目
pnpm build

# 6. 重启应用
pm2 restart junzhu-sas
```

### 方式 3：使用自动化脚本

项目提供了更新脚本：

```bash
# 进入项目目录
cd /www/wwwroot/junzhu-sas

# 运行更新脚本
bash update.sh
```

## 更新步骤详解

### 步骤 1：检查当前版本

```bash
# 查看 package.json 中的版本号
cat package.json | grep version

# 或查看 Git 日志
git log --oneline -5
```

### 步骤 2：拉取最新代码

```bash
cd /www/wwwroot/junzhu-sas

# 查看远程更新
git fetch origin

# 查看有哪些更新
git log --oneline main..origin/main

# 拉取最新代码
git pull origin main
```

### 步骤 3：安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 检查是否有安全漏洞
pnpm audit
```

### 步骤 4：数据库迁移

```bash
# 运行迁移
pnpm db:push

# 如果出现错误，可以查看迁移状态
pnpm db:generate
```

### 步骤 5：构建项目

```bash
# 构建前端和后端
pnpm build

# 检查构建是否成功
ls -la dist/
```

### 步骤 6：重启应用

```bash
# 重启应用
pm2 restart junzhu-sas

# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs junzhu-sas
```

### 步骤 7：验证更新

```bash
# 访问应用
curl http://localhost:3000

# 在浏览器中访问
# https://你的域名

# 检查应用是否正常运行
# 1. 登录应用
# 2. 创建学科
# 3. 添加考试成绩
# 4. 检查成绩曲线是否显示正常
```

## 更新中遇到问题

### 问题 1：Git 拉取失败

**症状**：执行 `git pull` 时出现错误

**解决方案**：

```bash
# 查看 Git 状态
git status

# 如果有未提交的更改，先保存
git stash

# 然后拉取
git pull origin main

# 恢复之前的更改（如果需要）
git stash pop
```

### 问题 2：依赖安装失败

**症状**：`pnpm install` 出现错误

**解决方案**：

```bash
# 清除缓存
pnpm store prune

# 重新安装
pnpm install

# 或使用 npm
npm cache clean --force
npm install
```

### 问题 3：数据库迁移失败

**症状**：`pnpm db:push` 出现错误

**解决方案**：

```bash
# 查看迁移状态
pnpm db:generate

# 检查数据库连接
mysql -h localhost -u junzhu_user -p junzhu_sas

# 查看错误日志
pm2 logs junzhu-sas
```

### 问题 4：应用启动失败

**症状**：重启后应用无法启动

**解决方案**：

```bash
# 查看详细日志
pm2 logs junzhu-sas --lines 50

# 检查环境变量
cat .env

# 检查构建文件
ls -la dist/

# 如果问题严重，回滚到上一个版本
git revert HEAD
pnpm build
pm2 restart junzhu-sas
```

## 回滚到上一个版本

如果更新后出现问题，可以回滚到上一个版本：

```bash
# 查看提交历史
git log --oneline -10

# 回滚到上一个版本
git revert HEAD

# 或回滚到特定版本
git checkout <commit-hash>

# 重新构建和重启
pnpm build
pm2 restart junzhu-sas
```

## 自动更新脚本

创建一个自动更新脚本 `update.sh`：

```bash
#!/bin/bash

set -e

echo "========================================="
echo "JunZhu-SAS 更新脚本"
echo "========================================="
echo ""

PROJECT_DIR="/www/wwwroot/junzhu-sas"

# 进入项目目录
cd $PROJECT_DIR

echo "第一步：停止应用"
pm2 stop junzhu-sas || true

echo ""
echo "第二步：拉取最新代码"
git pull origin main

echo ""
echo "第三步：安装依赖"
pnpm install

echo ""
echo "第四步：数据库迁移"
pnpm db:push

echo ""
echo "第五步：构建项目"
pnpm build

echo ""
echo "第六步：启动应用"
pm2 start junzhu-sas

echo ""
echo "========================================="
echo "更新完成！"
echo "========================================="
echo ""
echo "应用状态："
pm2 status

echo ""
echo "应用日志（最后 10 行）："
pm2 logs junzhu-sas --lines 10
```

使用脚本：

```bash
# 给脚本添加执行权限
chmod +x update.sh

# 运行脚本
./update.sh
```

## 定期检查更新

### 手动检查

```bash
# 进入项目目录
cd /www/wwwroot/junzhu-sas

# 检查是否有新的提交
git fetch origin
git log --oneline main..origin/main

# 如果有新的提交，就可以更新
```

### 自动检查（可选）

可以设置定时任务每天检查更新：

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天早上 2 点检查更新）
0 2 * * * cd /www/wwwroot/junzhu-sas && git fetch origin && git log --oneline main..origin/main > /tmp/junzhu_updates.txt
```

## 更新日志

查看项目的更新日志了解新增功能和修复的问题：

- **GitHub Releases**：https://github.com/gfjz-ruijun/junzhu-sas/releases
- **README.md 中的更新日志**：查看项目根目录的 README.md 文件

## 获取帮助

如果更新过程中遇到问题：

1. **查看日志**：`pm2 logs junzhu-sas`
2. **查看文档**：阅读 DEPLOYMENT_1PANEL.md 中的常见问题
3. **提交 Issue**：https://github.com/gfjz-ruijun/junzhu-sas/issues
4. **发送邮件**：gfjz.0326@qq.com

## 最佳实践

1. **定期备份**：在更新前备份数据库
2. **测试环境**：如果可能，先在测试环境更新
3. **阅读更新日志**：了解新版本的变化
4. **逐步更新**：不要跳过版本，逐个更新
5. **监控应用**：更新后监控应用日志，确保一切正常
6. **记录更新**：记录更新时间和版本号

## 常见问题

**Q: 更新会丢失数据吗？**
A: 不会。更新只涉及代码和依赖，数据库中的数据不会被删除。但建议在更新前备份数据库。

**Q: 更新需要多长时间？**
A: 通常需要 5-15 分钟，取决于网络速度和依赖大小。

**Q: 可以跳过某个版本更新吗？**
A: 可以，但建议逐个更新以避免兼容性问题。

**Q: 更新后需要重新配置环境变量吗？**
A: 通常不需要，除非新版本添加了新的环境变量。查看更新日志了解详情。

**Q: 如何知道是否有新版本？**
A: 可以在 GitHub 上查看 Releases，或使用 `git fetch origin` 检查。

---

**祝更新顺利！** 🚀

