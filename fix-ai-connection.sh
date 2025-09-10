#!/bin/bash
# AI预测算法连接修复脚本
set -e

echo "=============================================="
echo "  AI预测算法连接问题修复脚本"
echo "=============================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 步骤1: 清理可能的端口占用
echo -e "${BLUE}[1/6] 清理端口占用...${NC}"
pkill -f "node.*server.js" 2>/dev/null || echo "没有server.js进程需要停止"
pkill -f "python.*http.server" 2>/dev/null || echo "没有python http.server进程需要停止"
pkill -f "nodemon" 2>/dev/null || echo "没有nodemon进程需要停止"

# 等待端口释放
sleep 2

# 步骤2: 检查并安装依赖
echo -e "${BLUE}[2/6] 检查项目依赖...${NC}"
if [[ ! -d "node_modules" ]]; then
    echo "安装根目录依赖..."
    npm install
fi

if [[ ! -d "src/main/backend/node_modules" ]]; then
    echo "安装后端依赖..."
    cd src/main/backend && npm install && cd ../../..
fi

# 步骤3: 检查Python环境（可选）
echo -e "${BLUE}[3/6] 检查Python环境...${NC}"
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python3 可用${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    echo -e "${GREEN}✓ Python 可用${NC}"
    PYTHON_CMD="python"
else
    echo -e "${YELLOW}⚠ Python 不可用，将使用内置数据生成器${NC}"
    PYTHON_CMD=""
fi

# 步骤4: 启动后端服务（独立进程）
echo -e "${BLUE}[4/6] 启动后端服务...${NC}"
cd src/main/backend
nohup node server.js > ../../../backend.log 2>&1 &
BACKEND_PID=$!
cd ../../..

echo "后端服务PID: $BACKEND_PID"
echo $BACKEND_PID > backend.pid

# 等待后端启动
echo "等待后端服务启动..."
for i in {1..10}; do
    if curl -s http://localhost:3000/health &> /dev/null; then
        echo -e "${GREEN}✓ 后端服务启动成功${NC}"
        break
    fi
    sleep 1
    if [[ $i -eq 10 ]]; then
        echo -e "${RED}✗ 后端服务启动失败${NC}"
        cat backend.log
        exit 1
    fi
done

# 步骤5: 启动前端服务
echo -e "${BLUE}[5/6] 启动前端服务...${NC}"
if [[ -n "$PYTHON_CMD" ]]; then
    nohup $PYTHON_CMD -m http.server 8080 > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "前端服务PID: $FRONTEND_PID"
    echo $FRONTEND_PID > frontend.pid
else
    echo -e "${YELLOW}Python不可用，请手动启动前端服务${NC}"
fi

# 步骤6: 验证服务
echo -e "${BLUE}[6/6] 验证服务连接...${NC}"
sleep 3

# 检查前端
if curl -s http://localhost:8080 &> /dev/null; then
    echo -e "${GREEN}✓ 前端服务正常 (端口8080)${NC}"
else
    echo -e "${YELLOW}⚠ 前端服务可能未正常启动${NC}"
fi

# 检查后端
if curl -s http://localhost:3000/health &> /dev/null; then
    echo -e "${GREEN}✓ 后端服务正常 (端口3000)${NC}"
else
    echo -e "${RED}✗ 后端服务异常${NC}"
    cat backend.log
fi

# 检查AI API
if curl -s -X POST http://localhost:3000/api/ai/test &> /dev/null; then
    echo -e "${GREEN}✓ AI预测API正常${NC}"
else
    echo -e "${YELLOW}⚠ AI预测API可能需要POST数据${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}  服务启动完成！${NC}"
echo "=============================================="
echo ""
echo -e "${YELLOW}访问地址:${NC}"
echo "  🌐 主控制台: http://localhost:8080/src/main/frontend/html/index.html"
echo "  🧪 AI测试页: http://localhost:8080/test-prediction.html"
echo "  📊 后端健康: http://localhost:3000/health"
echo ""
echo -e "${YELLOW}服务管理:${NC}"
echo "  停止服务: ./stop-services.sh"
echo "  查看日志: tail -f backend.log frontend.log"
echo ""
echo -e "${GREEN}现在可以测试真实AI算法预测了！${NC}"