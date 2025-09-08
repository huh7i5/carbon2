# 沪碳智脑——上海化工园区CCU技术智能决策与分析平台

![项目状态](https://img.shields.io/badge/状态-开发中-blue.svg)
![版本](https://img.shields.io/badge/版本-v1.0.0-green.svg)
![许可证](https://img.shields.io/badge/许可证-MIT-orange.svg)

## 📋 当前开发进度

### ✅ 已完成功能
- **🎯 核心架构搭建** - 前后端分离架构设计完成
- **🔧 Node.js后端服务** - Express框架，WebSocket支持，SQLite数据库
- **🎨 前端界面框架** - HTML5/CSS3/JavaScript响应式界面
- **📊 数据可视化** - ECharts/Plotly.js图表集成
- **🗺️ 地理空间分析** - 高德地图API集成
- **🤖 AI集成准备** - ZhipuAI服务接口
- **📈 模拟数据生成** - CCU技术运行数据生成器
- **🔄 实时数据更新** - WebSocket实时数据推送
- **📱 6大核心模块界面** - KPI仪表盘、地图分析、性能监控、经济分析、AI预测、LLM解读

### 🚧 正在开发
- **🧠 AI预测模型** - ARIMA/LightGBM算法优化
- **💬 LLM智能解读** - 基于ZhipuAI的数据分析
- **📊 数据分析模块** - Python科学计算集成

### 📅 待开发功能
- **🔐 用户权限管理** - 多角色访问控制
- **📄 报告生成系统** - PDF/Word报告导出
- **⚙️ 系统配置管理** - 参数配置界面
- **🔔 告警系统** - 异常监控和通知

---

## 项目概述

本项目是一个基于化学吸收法CO2捕集与转化技术的智能决策分析平台，专注于上海化工园区的CCU（Carbon Capture and Utilization）技术应用场景。

### 核心技术路线
- **技术方向**: 化学吸收法捕集CO2并转化为高价值化学品（甲醇、聚碳酸酯等）
- **应用场景**: 上海化学工业区大型乙烯裂解装置烟道气处理
- **技术优势**: 化工产业链完整、产品消纳市场成熟、港口物流便利

## 🏗️ 技术架构

### 前端技术栈
- **HTML5 + CSS3 + JavaScript (ES6+)**: 现代化Web界面
- **ECharts + Plotly.js**: 交互式数据可视化
- **高德地图API**: 地理信息系统集成
- **WebSocket客户端**: 实时数据通信
- **响应式设计**: 多设备适配

### 后端技术栈
- **Node.js 16+ + Express**: RESTful API服务
- **WebSocket (ws)**: 实时数据推送
- **SQLite3**: 轻量级数据库
- **PM2**: 进程管理和监控
- **Compression + CORS**: 性能和跨域支持

### Python数据分析
- **标准库**: datetime, json, math, random
- **数据生成**: 模拟CCU技术运行数据
- **预测模型**: 时间序列分析

### AI/LLM集成
- **ZhipuAI API**: 智能数据解读
- **LangChain框架**: LLM应用开发
- **智能问答**: 基于图表数据的自然语言交互

## 项目结构

```
carbon2/
├── src/main/
│   ├── frontend/          # 前端代码
│   │   ├── html/         # HTML页面
│   │   ├── css/          # 样式文件  
│   │   ├── js/           # JavaScript逻辑
│   │   └── assets/       # 静态资源
│   ├── backend/          # Node.js后端
│   │   ├── routes/       # API路由
│   │   ├── models/       # 数据模型
│   │   ├── services/     # 业务逻辑
│   │   └── utils/        # 工具函数
│   ├── python/           # Python分析模块
│   │   ├── data_generation/  # 模拟数据生成
│   │   ├── ml_models/        # 机器学习模型
│   │   └── analysis/         # 数据分析
│   └── resources/        # 配置和数据
│       ├── config/       # 配置文件
│       ├── data/         # 数据存储
│       └── maps/         # 地图资源
├── docs/                 # 项目文档
├── scripts/              # 自动化脚本
└── output/              # 输出文件
```

## 核心功能模块

### 1. 核心KPI仪表盘
- 项目总投资监控
- 实时CO2捕集量
- 甲醇产量统计
- 运行利润分析

### 2. 地理空间分析
- 上海化工区CO2捕集源标记
- 产品运输路径规划
- CO2封存点位分布
- 交互式地图操作

### 3. 技术性能监控
- CO2捕集率实时曲线
- 再生能耗监控
- 溶剂流量分析
- 24小时性能趋势

### 4. 经济效益分析
- 成本构成分析（饼图）
- 收入-成本-利润对比（柱状图）
- 30天经济趋势分析

### 5. AI预测模块
- 基于ARIMA/LGBM的CO2捕集率预测
- 24小时前瞻性分析
- 模型准确性评估

### 6. LLM智能解读
- 图表数据自然语言解析
- 基于RAG的上下文分析
- 智能问答和建议生成

## 🚀 环境安装与启动指南

### 📋 环境要求

#### 必需软件
- **Node.js**: 16.0+ (推荐 18.x LTS)
- **npm**: 8.0+ (随Node.js安装)
- **Python**: 3.8+ (仅用于数据生成和前端服务器)
- **Git**: 用于代码管理

#### 支持的操作系统
- ✅ Windows 10/11 (推荐)
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+
- ✅ WSL2 (Windows Subsystem for Linux)

#### 浏览器支持
- ✅ Chrome 90+ (推荐)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

### 📦 快速安装

```bash
# 1. 克隆项目
git clone https://github.com/huh7i5/carbon2.git
cd carbon2

# 2. 安装所有依赖
npm install
cd src/main/backend && npm install && cd ../../..

# 3. 一键启动(前后端同时启动)
npm run dev
```

✨ **就这么简单！打开浏览器访问**: http://localhost:8080/src/main/frontend/html/index.html

---

### 🚀 超简单启动

🎆 **推荐方式 - 一键启动**
```bash
# 在项目根目录执行
npm run dev
```
✨ 这个命令会同时启动前端和后端服务，等待几秒后会显示访问地址。

---

#### 其他启动方式 (可选)

**分别启动前后端**
```bash
# 仅启动后端
npm run backend

# 仅启动前端  
npm run frontend
```

**使用脚本启动**
```bash
# Linux/macOS/Git Bash
./start-frontend.sh  # 前端服务（端口 8081）
./start-backend.sh   # 后端服务（端口 3000）
```

#### 方法2: 使用npm脚本

```bash
# 启动前端开发服务器
npm run serve
# 主控制台: http://localhost:8080/html/index.html

# 启动后端服务 (另一个终端)
npm run dev
# API地址: http://localhost:3000

# 生成模拟数据
python src/main/python/data_generation/generate_mock_data.py
```

#### 方法3: 手动启动

```bash
# 前端服务器
python -m http.server 8081
# 或: python3 -m http.server 8081

# 后端服务器 (另一个终端)
cd src/main/backend
node server.js
```

---

### 🔗 访问地址

**🎆 主要入口** (使用 `npm run dev` 启动后)
- 📋 **主控制台**: http://localhost:8080/src/main/frontend/html/index.html
- 🌐 **项目导航**: http://localhost:8080/index.html

**🔧 开发调试**
- 📊 **后端API**: http://localhost:3000
- ❤️ **健康检查**: http://localhost:3000/health
- 🔌 **WebSocket**: ws://localhost:3000/ws

**🧪 测试页面**
- 🗺️ **地图测试**: http://localhost:8080/test-map.html
- 🤖 **AI测试**: http://localhost:8080/test-zhipu-ai.html

## 💡 故障排除

### 常见问题

#### 🔧 后端启动失败
```bash
# 检查Node.js版本
node --version
# 应该显示 v16.0.0 或更高

# 重新安装依赖
cd src/main/backend
rm -rf node_modules package-lock.json
npm install
```

#### 🌐 前端无法访问
```bash
# 确保从项目根目录启动
pwd  # 应该显示 .../carbon2
python -m http.server 8081

# 检查防火墙设置
# Windows: 允许Python通过防火墙
```

#### 🗺️ 地图不显示
- 检查网络连接
- 确认高德地图API密钥有效
- 查看浏览器开发者工具控制台

#### 📊 图表不显示  
- 等待ECharts/Plotly.js CDN加载
- 检查控制台JavaScript错误
- 确认数据生成正常

---

## 📚 开发指南

### 开发规范
1. **阅读CLAUDE.md** - 包含完整开发规范和重要规则
2. **遵循项目结构** - 代码放在对应的模块目录下
3. **单一数据源** - 避免重复实现相同功能
4. **提交规范** - 每完成一个任务立即提交代码
5. **GitHub备份** - 每次提交后推送到远程仓库

### 开发环境配置
```bash
# 开发模式启动后端
cd src/main/backend
npm run dev  # 使用nodemon自动重启

# 前端开发
# 直接修改HTML/CSS/JS文件，浏览器刷新即可看到变化

# 数据生成
python src/main/python/data_generation/generate_mock_data.py
```

## 三周实施路线图

### Week 1: 基础架构搭建
- 环境配置和依赖安装
- 模拟数据生成脚本
- Node.js后端API框架
- 基础前端页面结构

### Week 2: 核心功能开发  
- KPI仪表盘实现
- 技术性能监控模块
- 经济效益分析图表
- 基础可视化组件

### Week 3: 高级功能集成
- 高德地图API集成
- AI预测模型部署
- LLM智能解读模块
- 整体调试和优化

---

## 📈 项目统计

- **开发周期**: 3周迭代开发
- **代码行数**: ~5000+ lines
- **核心功能**: 6大可视化模块
- **技术栈**: 10+ 技术组件
- **数据接口**: 20+ RESTful APIs

---

## 🤝 贡献指南

### 开发流程
1. Fork项目到个人账户
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交代码 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建Pull Request

### 代码规范
- JavaScript: ES6+ 语法
- CSS: 使用CSS3特性
- Python: PEP8 编码规范
- 注释: 中英文混合，关键逻辑必须注释

---

## 📞 联系信息

- **项目负责人**: crandler
- **GitHub仓库**: https://github.com/huh7i5/carbon2.git
- **技术支持**: 感恩 Claude Code
- **开发工具**: VS Code + Claude Code

---

## 📄 许可证

本项目采用 [MIT许可证](LICENSE) - 详情请查看LICENSE文件

---

**⭐ 如果这个项目对您有帮助，请给个星标支持！**

