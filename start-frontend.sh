#!/bin/bash

echo "=== 启动沪碳智脑前端开发服务器 ==="

# 检查Python版本
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "错误：未找到Python解释器"
    exit 1
fi

# 获取当前脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "工作目录: $PWD"
echo "使用 $PYTHON_CMD 启动HTTP服务器..."
echo ""
echo "🌐 访问地址:"
echo "   主页导航: http://localhost:8081"
echo "   主控制台: http://localhost:8081/src/main/frontend/html/index.html"
echo "   地图测试: http://localhost:8081/test-map.html"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "================================================"

# 启动HTTP服务器
$PYTHON_CMD -m http.server 8081