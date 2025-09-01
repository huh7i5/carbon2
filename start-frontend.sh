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

# 切换到前端目录
cd src/main/frontend

echo "使用 $PYTHON_CMD 启动HTTP服务器..."
echo "服务器地址: http://localhost:8080"
echo "按 Ctrl+C 停止服务器"
echo "=================================="

# 启动HTTP服务器
$PYTHON_CMD -m http.server 8080