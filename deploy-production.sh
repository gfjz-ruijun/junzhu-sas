#!/bin/bash

# JunZhu-SAS 生产环境部署脚本
# 使用方法: bash deploy-production.sh

set -e

echo "=========================================="
echo "JunZhu-SAS 生产环境部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否以root身份运行
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误：此脚本必须以root身份运行${NC}"
  echo "请使用: sudo bash deploy-production.sh"
  exit 1
fi

# 检查必要的环境变量
check_env() {
  if [ ! -f ".env" ]; then
    echo -e "${RED}错误：.env文件不存在${NC}"
    echo "请先创建.env文件，参考.env.example"
    exit 1
  fi
  echo -e "${GREEN}✓ .env文件已找到${NC}"
}

# 检查依赖
check_dependencies() {
  echo ""
  echo "检查系统依赖..."
  
  # 检查Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js未安装，正在安装...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi
  echo -e "${GREEN}✓ Node.js已安装: $(node --version)${NC}"
  
  # 检查pnpm
  if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm未安装，正在安装...${NC}"
    npm install -g pnpm
  fi
  echo -e "${GREEN}✓ pnpm已安装: $(pnpm --version)${NC}"
  
  # 检查MySQL
  if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL未安装，正在安装...${NC}"
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
  fi
  echo -e "${GREEN}✓ MySQL已安装${NC}"
  
  # 检查PM2
  if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠ PM2未安装，正在安装...${NC}"
    npm install -g pm2
  fi
  echo -e "${GREEN}✓ PM2已安装: $(pm2 --version)${NC}"
  
  # 检查Nginx
  if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠ Nginx未安装，正在安装...${NC}"
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
  fi
  echo -e "${GREEN}✓ Nginx已安装: $(nginx -v 2>&1)${NC}"
}

# 安装项目依赖
install_dependencies() {
  echo ""
  echo "安装项目依赖..."
  pnpm install
  echo -e "${GREEN}✓ 项目依赖已安装${NC}"
}

# 数据库迁移
migrate_database() {
  echo ""
  echo "执行数据库迁移..."
  pnpm db:push
  echo -e "${GREEN}✓ 数据库迁移完成${NC}"
}

# 构建项目
build_project() {
  echo ""
  echo "构建项目..."
  pnpm build
  echo -e "${GREEN}✓ 项目构建完成${NC}"
}

# 启动应用
start_application() {
  echo ""
  echo "启动应用..."
  
  # 检查应用是否已在运行
  if pm2 list | grep -q "junzhu-sas"; then
    echo "应用已在运行，重启应用..."
    pm2 restart junzhu-sas
  else
    echo "启动新应用..."
    pm2 start "npm run start" --name "junzhu-sas" --env NODE_ENV=production
  fi
  
  # 保存PM2配置
  pm2 save
  
  # 设置开机自启
  pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
  
  echo -e "${GREEN}✓ 应用已启动${NC}"
}

# 验证部署
verify_deployment() {
  echo ""
  echo "验证部署..."
  
  sleep 2
  
  # 检查应用状态
  if pm2 list | grep -q "online"; then
    echo -e "${GREEN}✓ 应用运行正常${NC}"
  else
    echo -e "${RED}✗ 应用启动失败${NC}"
    pm2 logs junzhu-sas
    exit 1
  fi
  
  # 检查端口
  if ss -tlnp | grep -q ":30002"; then
    echo -e "${GREEN}✓ 端口30002已监听${NC}"
  else
    echo -e "${RED}✗ 端口30002未监听${NC}"
    exit 1
  fi
}

# 显示部署信息
show_deployment_info() {
  echo ""
  echo "=========================================="
  echo -e "${GREEN}部署完成！${NC}"
  echo "=========================================="
  echo ""
  echo "应用信息："
  echo "  名称: junzhu-sas"
  echo "  状态: $(pm2 list | grep junzhu-sas | awk '{print $10}')"
  echo "  端口: 30002"
  echo ""
  echo "常用命令："
  echo "  查看状态: pm2 status"
  echo "  查看日志: pm2 logs junzhu-sas"
  echo "  重启应用: pm2 restart junzhu-sas"
  echo "  停止应用: pm2 stop junzhu-sas"
  echo ""
  echo "下一步："
  echo "  1. 配置Nginx反向代理"
  echo "  2. 配置SSL证书"
  echo "  3. 配置GitHub OAuth回调URL"
  echo ""
  echo "详见: DEPLOYMENT_COMPLETE_GUIDE.md"
  echo "=========================================="
}

# 主函数
main() {
  check_env
  check_dependencies
  install_dependencies
  migrate_database
  build_project
  start_application
  verify_deployment
  show_deployment_info
}

# 运行主函数
main

