#!/bin/bash
# 沪碳智脑平台完整启动脚本 (支持真实AI算法)
# 使用方法: ./start-ai-platform.sh

set -e  # 遇到错误退出

echo "=================================================="
echo "  沪碳智脑——AI预测平台完整启动脚本"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查当前目录
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}错误: 请在项目根目录下运行此脚本${NC}"
    exit 1
fi

# 检查Node.js
echo -e "${BLUE}[1/5] 检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js 16+${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"

# 检查Python3
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠ 警告: 未找到 Python3，AI算法功能可能受限${NC}"
else
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python3: $PYTHON_VERSION${NC}"
fi

# 安装依赖
echo -e "${BLUE}[2/5] 安装项目依赖...${NC}"
if [[ ! -d "node_modules" ]]; then
    echo "正在安装根目录依赖..."
    npm install
fi

if [[ ! -d "src/main/backend/node_modules" ]]; then
    echo "正在安装后端依赖..."
    cd src/main/backend && npm install && cd ../../..
fi

# 检查Python依赖（可选）
echo -e "${BLUE}[3/5] 检查Python依赖...${NC}"
if command -v python3 &> /dev/null; then
    if python3 -c "import numpy, json, datetime" &> /dev/null; then
        echo -e "${GREEN}✓ Python依赖检查通过${NC}"
    else
        echo -e "${YELLOW}⚠ Python科学计算库未完整安装，将使用基础预测算法${NC}"
        echo "  如需完整功能，请运行: pip3 install -r src/main/python/requirements.txt"
    fi
fi

# 生成初始数据
echo -e "${BLUE}[4/5] 生成初始数据...${NC}"
if [[ -f "src/main/python/data_generation/generate_mock_data.py" ]]; then
    python3 src/main/python/data_generation/generate_mock_data.py > /dev/null 2>&1 || echo -e "${YELLOW}数据生成警告：使用内置数据${NC}"
fi

# 启动服务
echo -e "${BLUE}[5/5] 启动服务...${NC}"
echo ""
echo -e "${GREEN}🚀 正在启动沪碳智脑平台...${NC}"
echo ""
echo -e "${YELLOW}访问地址:${NC}"
echo -e "  🌐 主控制台: http://localhost:8080/src/main/frontend/html/index.html"
echo -e "  📊 后端API: http://localhost:3000/health"
echo -e "  🧪 AI测试: http://localhost:8080/test-prediction.html"
echo ""
echo -e "${YELLOW}功能说明:${NC}"
echo -e "  ✅ 真实AI算法: 支持ARIMA/LightGBM/Ensemble预测"
echo -e "  ✅ 实时数据: WebSocket推送"
echo -e "  ✅ 地图分析: 高德地图集成"
echo -e "  ✅ LLM解读: 智谱AI接口"
echo ""
echo -e "${BLUE}按 Ctrl+C 停止服务${NC}"
echo ""

# 启动并发服务
trap 'echo -e "\n${YELLOW}正在停止服务...${NC}"; kill $(jobs -p) 2>/dev/null; exit' SIGINT

# 使用npm run dev启动并发服务
exec npm run dev