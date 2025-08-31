@echo off
chcp 65001 > nul

REM 沪碳智脑平台Demo启动脚本 (Windows版本)
echo 🚀 启动沪碳智脑——上海化工园区CCU技术智能决策与分析平台
echo ================================================

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js 16+ 版本
    pause
    exit /b 1
)

REM 检查Python是否安装
where python >nul 2>nul
if %errorlevel% neq 0 (
    where python3 >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Python 未安装，请先安装 Python 3.x 版本
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)

REM 获取项目根目录
cd /d "%~dp0.."
set PROJECT_DIR=%CD%

echo 📁 项目目录: %PROJECT_DIR%

REM 检查是否安装了依赖
if not exist "node_modules" (
    echo 📦 安装Node.js依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

REM 创建日志目录
if not exist "logs" mkdir logs

REM 启动前端静态服务器
echo 🌐 启动前端服务器...
cd src\main\frontend

REM 使用Python启动简单HTTP服务器
start /b %PYTHON_CMD% -m http.server 8080 > ..\..\..\logs\frontend.log 2>&1

REM 等待服务器启动
timeout /t 3 /nobreak > nul

REM 检查服务器是否成功启动
curl -s http://localhost:8080 > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 前端服务器启动失败，正在重试...
    timeout /t 2 /nobreak > nul
    curl -s http://localhost:8080 > nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ 前端服务器启动失败，请手动检查端口8080是否被占用
        pause
        exit /b 1
    )
)

echo ✅ 前端服务器已启动: http://localhost:8080
echo 📱 访问Demo: http://localhost:8080/html/index.html

echo.
echo ================================================
echo 🎯 沪碳智脑平台Demo已启动
echo 📊 主要功能模块:
echo    • 核心KPI仪表盘 - 实时监控关键指标
echo    • 地理空间分析 - 上海化工园区地图展示
echo    • 技术性能监控 - CO2捕集率等性能曲线
echo    • 经济效益分析 - 成本构成和收益分析
echo    • AI预测模块 - 基于ARIMA模型的预测
echo    • LLM智能解读 - 图表数据自然语言分析
echo.
echo 🌐 访问地址: http://localhost:8080/html/index.html
echo 📋 日志文件: logs\frontend.log
echo.
echo ⚠️  注意事项:
echo    • 地图功能需要配置高德地图API Key
echo    • 所有数据为模拟数据，用于演示目的
echo    • 关闭此窗口将停止服务
echo ================================================

REM 自动打开浏览器
start http://localhost:8080/html/index.html

REM 保持窗口打开
echo 按任意键停止服务...
pause > nul

REM 停止Python HTTP服务器
taskkill /f /im python.exe > nul 2>&1
taskkill /f /im python3.exe > nul 2>&1

echo ✅ 服务已停止