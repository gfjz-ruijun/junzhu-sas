#!/bin/bash

# JunZhu-SAS 1Panel 部署脚本
# 使用方法: bash deploy.sh

set -e

echo "========================================="
echo "JunZhu-SAS 部署脚本"
echo "========================================="
echo ""

# 检查必要的命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 错误: 未找到 $1 命令"
        echo "请先安装 $1"
        exit 1
    fi
}

echo "检查依赖..."
check_command "node"
check_command "npm"
check_command "git"
check_command "mysql"

echo "✅ 所有依赖已安装"
echo ""

# 获取项目目录
PROJECT_DIR=$(pwd)
echo "项目目录: $PROJECT_DIR"
echo ""

# 安装依赖
echo "========================================="
echo "第一步: 安装依赖"
echo "========================================="
echo ""

if [ -f "pnpm-lock.yaml" ]; then
    echo "检测到 pnpm-lock.yaml，使用 pnpm 安装..."
    if ! command -v pnpm &> /dev/null; then
        echo "安装 pnpm..."
        npm install -g pnpm
    fi
    pnpm install
else
    echo "使用 npm 安装..."
    npm install
fi

echo "✅ 依赖安装完成"
echo ""

# 检查 .env 文件
echo "========================================="
echo "第二步: 检查环境变量"
echo "========================================="
echo ""

if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件"
    echo "请创建 .env 文件，包含以下内容:"
    echo ""
    echo "DATABASE_URL=\"mysql://user:password@localhost:3306/junzhu_sas\""
    echo "JWT_SECRET=\"your-secret-key\""
    echo "VITE_APP_ID=\"your-app-id\""
    echo "OAUTH_SERVER_URL=\"https://api.manus.im\""
    echo "VITE_OAUTH_PORTAL_URL=\"https://oauth.manus.im\""
    echo "VITE_APP_TITLE=\"JunZhu-SAS\""
    echo ""
    read -p "按 Enter 继续..."
else
    echo "✅ .env 文件已存在"
fi

echo ""

# 数据库迁移
echo "========================================="
echo "第三步: 数据库迁移"
echo "========================================="
echo ""

read -p "是否运行数据库迁移? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v pnpm &> /dev/null; then
        pnpm db:push
    else
        npm run db:push
    fi
    echo "✅ 数据库迁移完成"
else
    echo "⏭️  跳过数据库迁移"
fi

echo ""

# 构建项目
echo "========================================="
echo "第四步: 构建项目"
echo "========================================="
echo ""

if command -v pnpm &> /dev/null; then
    pnpm build
else
    npm run build
fi

echo "✅ 项目构建完成"
echo ""

# 安装 PM2
echo "========================================="
echo "第五步: 配置 PM2"
echo "========================================="
echo ""

if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2
fi

echo "✅ PM2 已安装"
echo ""

# 启动应用
echo "========================================="
echo "第六步: 启动应用"
echo "========================================="
echo ""

# 停止已有的应用
pm2 delete junzhu-sas 2>/dev/null || true

# 启动应用
pm2 start "npm run start" --name "junzhu-sas" --cwd "$PROJECT_DIR"

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

echo "✅ 应用已启动"
echo ""

# 显示应用状态
echo "========================================="
echo "应用状态"
echo "========================================="
echo ""
pm2 status
echo ""

# 显示日志
echo "========================================="
echo "应用日志（最后 10 行）"
echo "========================================="
echo ""
pm2 logs junzhu-sas --lines 10
echo ""

echo "========================================="
echo "部署完成! 🎉"
echo "========================================="
echo ""
echo "应用已在 http://localhost:3000 启动"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs junzhu-sas"
echo "  重启应用: pm2 restart junzhu-sas"
echo "  停止应用: pm2 stop junzhu-sas"
echo "  启动应用: pm2 start junzhu-sas"
echo ""

