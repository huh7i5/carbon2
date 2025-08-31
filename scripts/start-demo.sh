#!/bin/bash

# 沪碳智脑平台Demo启动脚本
echo "🚀 启动沪碳智脑——上海化工园区CCU技术智能决策与分析平台"
echo "================================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+ 版本"
    exit 1
fi

# 检查Python是否安装
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python 未安装，请先安装 Python 3.x 版本"
    exit 1
fi

# 获取项目根目录
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )"
cd "$PROJECT_DIR"

echo "📁 项目目录: $PROJECT_DIR"

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装Node.js依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接"
        exit 1
    fi
fi

# 创建日志目录
mkdir -p logs

# 启动前端静态服务器
echo "🌐 启动前端服务器..."
cd src/main/frontend

# 使用Python启动简单HTTP服务器
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

# 后台启动HTTP服务器
$PYTHON_CMD -m http.server 8080 > ../../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待服务器启动
sleep 2

# 检查服务器是否成功启动
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ 前端服务器已启动: http://localhost:8080"
    echo "📱 访问Demo: http://localhost:8080/html/index.html"
else
    echo "❌ 前端服务器启动失败"
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "================================================"
echo "🎯 沪碳智脑平台Demo已启动"
echo "📊 主要功能模块:"
echo "   • 核心KPI仪表盘 - 实时监控关键指标"
echo "   • 地理空间分析 - 上海化工园区地图展示"
echo "   • 技术性能监控 - CO2捕集率等性能曲线"
echo "   • 经济效益分析 - 成本构成和收益分析"
echo "   • AI预测模块 - 基于ARIMA模型的预测"
echo "   • LLM智能解读 - 图表数据自然语言分析"
echo ""
echo "🌐 访问地址: http://localhost:8080/html/index.html"
echo "📋 日志文件: logs/frontend.log"
echo ""
echo "⚠️  注意事项:"
echo "   • 地图功能需要配置高德地图API Key"
echo "   • 所有数据为模拟数据，用于演示目的"
echo "   • 按 Ctrl+C 停止服务"
echo "================================================"

# 保存PID到文件
echo $FRONTEND_PID > logs/frontend.pid

# 设置信号处理
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ -f logs/frontend.pid ]; then
        SAVED_PID=$(cat logs/frontend.pid)
        kill $SAVED_PID 2>/dev/null
        rm -f logs/frontend.pid
    fi
    echo "✅ 服务已停止"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 保持脚本运行
while true; do
    sleep 1
    # 检查服务器是否仍在运行
    if ! curl -s http://localhost:8080 > /dev/null; then
        echo "❌ 前端服务器异常停止"
        cleanup
    fi
done