# JunZhu-SAS 文档索引

本文档提供所有项目文档的快速导航。

## 📖 文档列表

### 入门文档

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| [README.md](README.md) | 项目介绍、功能说明、技术架构 | 所有人 |
| [QUICK_START.md](QUICK_START.md) | 3分钟快速部署指南 | 想快速上手的用户 |

### 部署文档

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| [DEPLOYMENT_1PANEL.md](DEPLOYMENT_1PANEL.md) | 完整的1Panel部署教程（10个步骤） | 使用1Panel的用户 |
| [deploy.sh](deploy.sh) | 自动部署脚本 | 想自动化部署的用户 |

### 配置文档

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| [ENV_SETUP.md](ENV_SETUP.md) | 环境变量配置指南 | 需要配置环境变量的用户 |

### 更新和维护文档

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| [UPDATE_GUIDE.md](UPDATE_GUIDE.md) | 应用更新指南 | 想更新应用的用户 |
| [update.sh](update.sh) | 自动更新脚本 | 想自动化更新的用户 |
| [MAINTENANCE.md](MAINTENANCE.md) | 应用维护指南 | 应用管理员 |

### 支持文档

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| [SUPPORT.md](SUPPORT.md) | 支持和联系方式 | 需要帮助的用户 |

## 🚀 快速导航

### 我想...

#### 快速开始
1. 阅读 [README.md](README.md) 了解项目
2. 按照 [QUICK_START.md](QUICK_START.md) 快速部署

#### 详细部署
1. 阅读 [DEPLOYMENT_1PANEL.md](DEPLOYMENT_1PANEL.md) 了解完整步骤
2. 参考 [ENV_SETUP.md](ENV_SETUP.md) 配置环境变量
3. 使用 [deploy.sh](deploy.sh) 自动部署

#### 更新应用
1. 阅读 [UPDATE_GUIDE.md](UPDATE_GUIDE.md) 了解更新方法
2. 使用 [update.sh](update.sh) 自动更新

#### 维护应用
1. 阅读 [MAINTENANCE.md](MAINTENANCE.md) 了解维护任务
2. 按照指南进行日常维护

#### 获取帮助
1. 查看 [SUPPORT.md](SUPPORT.md) 了解联系方式
2. 查看 [DEPLOYMENT_1PANEL.md](DEPLOYMENT_1PANEL.md) 中的常见问题
3. 查看 [UPDATE_GUIDE.md](UPDATE_GUIDE.md) 中的故障排查

## 📚 按场景选择文档

### 场景 1：首次部署

**步骤**：
1. 阅读 [README.md](README.md) - 了解项目（5分钟）
2. 按照 [QUICK_START.md](QUICK_START.md) - 快速部署（3分钟）
3. 参考 [DEPLOYMENT_1PANEL.md](DEPLOYMENT_1PANEL.md) - 详细配置（20分钟）
4. 查看 [ENV_SETUP.md](ENV_SETUP.md) - 环境变量配置（10分钟）

**总耗时**：约40分钟

### 场景 2：应用更新

**步骤**：
1. 阅读 [UPDATE_GUIDE.md](UPDATE_GUIDE.md) - 了解更新方法（5分钟）
2. 使用 [update.sh](update.sh) - 自动更新（5分钟）
3. 查看 [UPDATE_GUIDE.md](UPDATE_GUIDE.md) 中的故障排查 - 如遇问题（10分钟）

**总耗时**：5-20分钟

### 场景 3：日常维护

**步骤**：
1. 阅读 [MAINTENANCE.md](MAINTENANCE.md) - 了解维护任务（10分钟）
2. 按照维护清单进行日常检查（5分钟/天）
3. 遇到问题时参考故障排查部分（10分钟）

**总耗时**：每天5分钟

### 场景 4：遇到问题

**步骤**：
1. 查看相关文档中的常见问题部分
   - 部署问题：[DEPLOYMENT_1PANEL.md](DEPLOYMENT_1PANEL.md)
   - 更新问题：[UPDATE_GUIDE.md](UPDATE_GUIDE.md)
   - 维护问题：[MAINTENANCE.md](MAINTENANCE.md)
2. 如果问题未解决，查看 [SUPPORT.md](SUPPORT.md) 获取帮助

## 📋 文档内容速查

### 常见问题

| 问题 | 文档 | 位置 |
|------|------|------|
| 如何部署应用？ | DEPLOYMENT_1PANEL.md | 第一步-第十步 |
| 如何配置环境变量？ | ENV_SETUP.md | 环境变量说明 |
| 如何更新应用？ | UPDATE_GUIDE.md | 更新方式 |
| 如何维护应用？ | MAINTENANCE.md | 日常维护任务 |
| 数据库连接失败怎么办？ | DEPLOYMENT_1PANEL.md | 常见问题解决 |
| 应用无法启动怎么办？ | UPDATE_GUIDE.md | 更新中遇到问题 |
| 如何获取帮助？ | SUPPORT.md | 联系方式 |

### 常用命令

| 任务 | 命令 | 文档 |
|------|------|------|
| 查看应用状态 | `pm2 status` | MAINTENANCE.md |
| 查看应用日志 | `pm2 logs junzhu-sas` | MAINTENANCE.md |
| 重启应用 | `pm2 restart junzhu-sas` | MAINTENANCE.md |
| 更新应用 | `bash update.sh` | UPDATE_GUIDE.md |
| 备份数据库 | `mysqldump ...` | MAINTENANCE.md |
| 测试数据库连接 | `mysql -h localhost ...` | DEPLOYMENT_1PANEL.md |

## 🔗 外部链接

- **GitHub 仓库**：https://github.com/gfjz-ruijun/junzhu-sas
- **官方网站**：https://gfjzz.cn
- **邮件支持**：gfjz.0326@qq.com

## 📝 文档维护

### 最后更新时间

- README.md：2025-10-20
- QUICK_START.md：2025-10-20
- DEPLOYMENT_1PANEL.md：2025-10-20
- UPDATE_GUIDE.md：2025-10-20
- MAINTENANCE.md：2025-10-20
- SUPPORT.md：2025-10-20
- ENV_SETUP.md：2025-10-20

### 文档版本

所有文档对应应用版本 v1.1.0

### 如何提交文档改进

如果你发现文档中有错误或想改进文档，欢迎：

1. 提交 Issue：https://github.com/gfjz-ruijun/junzhu-sas/issues
2. 发送邮件：gfjz.0326@qq.com
3. 提交 Pull Request

## 🎯 文档使用建议

1. **首次使用**：按照"场景 1：首次部署"的步骤阅读文档
2. **日常使用**：收藏 [QUICK_START.md](QUICK_START.md) 和 [MAINTENANCE.md](MAINTENANCE.md)
3. **遇到问题**：先查看相关文档的常见问题部分，再查看 [SUPPORT.md](SUPPORT.md)
4. **定期更新**：每月检查一次 [UPDATE_GUIDE.md](UPDATE_GUIDE.md) 了解是否有新版本

## 📞 获取帮助

如果文档中没有找到答案：

1. **查看 GitHub Issues**：https://github.com/gfjz-ruijun/junzhu-sas/issues
2. **发送邮件**：gfjz.0326@qq.com
3. **访问官方网站**：https://gfjzz.cn

---

**感谢你使用 JunZhu-SAS！** 🙏

如有任何建议或问题，欢迎联系我们。

