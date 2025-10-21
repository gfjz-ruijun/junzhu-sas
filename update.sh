#!/bin/bash

# JunZhu-SAS 自动更新脚本
# 使用方法: bash update.sh

set -e

echo "========================================="
echo "JunZhu-SAS 更新脚本"
echo "========================================="
echo ""

PROJECT_DIR=$(pwd)
echo "项目目录: $PROJECT_DIR"
echo ""

# 检查 Git 是否已安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未找到 git 命令"
    exit 1
fi

# 检查 PM2 是否已安装
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  警告: 未找到 pm2 命令"
    echo "请先安装 PM2: npm install -g pm2"
fi

echo "========================================="
echo "第一步：停止应用"
echo "========================================="
echo ""

if command -v pm2 &> /dev/null; then
    pm2 stop junzhu-sas || true
    echo "✅ 应用已停止"
else
    echo "⏭️  跳过停止应用（PM2 未安装）"
fi

echo ""

echo "========================================="
echo "第二步：拉取最新代码"
echo "========================================="
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改"
    read -p "是否保存这些更改? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash
        echo "✅ 更改已保存"
    else
        echo "❌ 取消更新"
        exit 1
    fi
fi

git pull origin main
echo "✅ 代码已更新"

echo ""

echo "========================================="
echo "第三步：安装依赖"
echo "========================================="
echo ""

if command -v pnpm &> /dev/null; then
    pnpm install
    echo "✅ 依赖已安装"
else
    echo "使用 npm 安装依赖..."
    npm install
    echo "✅ 依赖已安装"
fi

echo ""

echo "========================================="
echo "第四步：数据库迁移"
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

echo "========================================="
echo "第五步：构建项目"
echo "========================================="
echo ""

if command -v pnpm &> /dev/null; then
    pnpm build
else
    npm run build
fi

echo "✅ 项目构建完成"

echo ""

echo "========================================="
echo "第六步：启动应用"
echo "========================================="
echo ""

if command -v pm2 &> /dev/null; then
    pm2 start junzhu-sas || pm2 restart junzhu-sas
    echo "✅ 应用已启动"
else
    echo "⚠️  PM2 未安装，请手动启动应用"
fi

echo ""

echo "========================================="
echo "更新完成！"
echo "========================================="
echo ""

if command -v pm2 &> /dev/null; then
    echo "应用状态："
    pm2 status
    echo ""
    echo "应用日志（最后 10 行）："
    pm2 logs junzhu-sas --lines 10
fi

echo ""
echo "✅ 更新成功！"
