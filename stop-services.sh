#!/bin/bash
# 停止所有服务脚本

echo "正在停止服务..."

# 停止后端服务
if [[ -f backend.pid ]]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "后端服务已停止 (PID: $BACKEND_PID)"
    fi
    rm -f backend.pid
fi

# 停止前端服务
if [[ -f frontend.pid ]]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "前端服务已停止 (PID: $FRONTEND_PID)"
    fi
    rm -f frontend.pid
fi

# 清理其他可能的进程
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "python.*http.server" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

echo "所有服务已停止"