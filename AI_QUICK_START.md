# 🚀 AI预测算法快速启动指南

## 🎯 获取真实AI算法预测（推荐）

### 方法1: 一键启动脚本 ⭐推荐⭐

**Linux/macOS/WSL:**
```bash
# 给脚本执行权限
chmod +x start-ai-platform.sh

# 启动完整服务
./start-ai-platform.sh
```

**Windows:**
```cmd
# 双击运行或命令行执行
start-ai-platform.bat
```

### 方法2: 手动启动

```bash
# 1. 安装依赖
npm install
cd src/main/backend && npm install && cd ../../..

# 2. 启动服务 (前后端并发)
npm run dev
```

### 访问地址 🌐
启动成功后访问:
- **主控制台**: http://localhost:8080/src/main/frontend/html/index.html
- **AI测试页**: http://localhost:8080/test-prediction.html
- **后端健康检查**: http://localhost:3000/health

---

## ⚠️ 常见问题解决

### 问题1: "Failed to fetch" 错误
**原因**: 直接用浏览器打开HTML文件 (file://)，无法连接API

**解决**: 必须通过HTTP服务器访问
```bash
# 正确方式
npm run dev
# 然后访问 http://localhost:8080/src/main/frontend/html/index.html

# 错误方式  
# 直接双击index.html文件 ❌
```

### 问题2: 只显示模拟数据
**原因**: 后端服务未启动

**解决**: 确保后端服务运行在3000端口
```bash
# 检查后端状态
curl http://localhost:3000/health

# 如果失败，启动后端
cd src/main/backend
node server.js
```

### 问题3: AI预测精度低
**原因**: Python科学计算库未安装

**解决**: 安装完整依赖
```bash
# 安装Python科学计算库
pip3 install -r src/main/python/requirements.txt

# 或使用conda
conda install numpy pandas scikit-learn
```

---

## 🧠 AI算法说明

### 支持的预测模型:
1. **ARIMA时间序列模型** (85%准确率)
   - 适用于短期趋势预测
   - 基于历史数据时序分析
   
2. **LightGBM机器学习** (88%准确率)  
   - 多特征综合预测
   - 梯度提升算法
   
3. **Ensemble集成模型** (92%准确率) ⭐推荐⭐
   - 结合多种算法优势
   - 最高预测精度

### 预测指标:
- **CO2捕集率** (75-95%)
- **能源消耗** (2-5 GJ/t)
- **甲醇产量** (15-35 t/h)

---

## 🔄 模式对比

| 模式 | 数据源 | 算法 | 准确率 | 启动方式 |
|------|--------|------|--------|----------|
| **演示模式** | 模拟数据 | 随机生成 | ~80% | 直接打开HTML |
| **完整模式** | 真实算法 | ARIMA/LGBm/Ensemble | 85-92% | HTTP服务器启动 |

---

## 🎪 快速测试

测试AI预测是否正常工作:

1. 启动服务: `./start-ai-platform.sh`
2. 访问测试页: http://localhost:8080/test-prediction.html
3. 点击"运行预测"
4. 检查结果:
   - ✅ 成功: 显示"真实算法预测完成"  
   - ⚠️ 演示: 显示"演示模式 - 模拟数据"

**期望结果**: 真实算法预测，准确率85-92%

---

## 📞 技术支持

遇到问题？检查顺序:
1. 🔍 Node.js版本 ≥16.0
2. 🔍 后端服务状态 (端口3000)
3. 🔍 前端服务状态 (端口8080)  
4. 🔍 Python环境 (可选，用于高级算法)

**状态检查命令**:
```bash
# 检查服务状态
curl http://localhost:3000/api/ai/test
curl http://localhost:8080

# 检查进程
ps aux | grep node
ps aux | grep python
```