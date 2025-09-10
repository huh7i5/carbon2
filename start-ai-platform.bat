@echo off
:: 沪碳智脑平台完整启动脚本 (Windows版本)
:: 使用方法: start-ai-platform.bat

echo ==================================================
echo   沪碳智脑——AI预测平台完整启动脚本 (Windows)
echo ==================================================

:: 检查当前目录
if not exist "package.json" (
    echo [错误] 请在项目根目录下运行此脚本
    pause
    exit /b 1
)

:: 检查Node.js
echo [1/5] 检查环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 16+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo [√] Node.js: %NODE_VERSION%

:: 检查Python3
python --version >nul 2>&1
if errorlevel 1 (
    echo [警告] 未找到 Python，AI算法功能可能受限
) else (
    for /f "tokens=*" %%v in ('python --version') do set PYTHON_VERSION=%%v
    echo [√] Python: %PYTHON_VERSION%
)

:: 安装依赖
echo [2/5] 安装项目依赖...
if not exist "node_modules" (
    echo 正在安装根目录依赖...
    npm install
)

if not exist "src\main\backend\node_modules" (
    echo 正在安装后端依赖...
    cd src\main\backend
    npm install
    cd ..\..\..
)

:: 检查Python依赖
echo [3/5] 检查Python依赖...
python -c "import json, datetime, math" >nul 2>&1
if errorlevel 1 (
    echo [提示] Python基础库检查完成
) else (
    echo [√] Python依赖检查通过
)

:: 生成初始数据
echo [4/5] 生成初始数据...
if exist "src\main\python\data_generation\generate_mock_data.py" (
    python src\main\python\data_generation\generate_mock_data.py >nul 2>&1
)

:: 启动服务
echo [5/5] 启动服务...
echo.
echo [√] 正在启动沪碳智脑平台...
echo.
echo 访问地址:
echo   ^> 主控制台: http://localhost:8080/src/main/frontend/html/index.html  
echo   ^> 后端API: http://localhost:3000/health
echo   ^> AI测试: http://localhost:8080/test-prediction.html
echo.
echo 功能说明:
echo   [√] 真实AI算法: 支持ARIMA/LightGBM/Ensemble预测
echo   [√] 实时数据: WebSocket推送  
echo   [√] 地图分析: 高德地图集成
echo   [√] LLM解读: 智谱AI接口
echo.
echo 按 Ctrl+C 停止服务
echo.

:: 启动并发服务
npm run dev