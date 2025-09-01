#!/bin/bash

echo "=== 启动沪碳智脑后端服务器 ==="

# 获取当前脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/src/main/backend"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到npm，请先安装npm"
    exit 1
fi

# 进入后端目录
cd "$BACKEND_DIR"

echo "📍 工作目录: $PWD"

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 错误：未找到package.json文件"
    exit 1
fi

# 检查node_modules是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖包..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
fi

# 创建日志目录
mkdir -p logs

echo ""
echo "🚀 启动信息:"
echo "   Node.js版本: $(node --version)"
echo "   npm版本: $(npm --version)"
echo "   服务端口: 3000"
echo "   环境模式: development"
echo ""
echo "📡 访问地址:"
echo "   服务器主页: http://localhost:3000"
echo "   API健康检查: http://localhost:3000/health"
echo "   WebSocket: ws://localhost:3000/ws"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "========================================"

# 启动服务器
npm start