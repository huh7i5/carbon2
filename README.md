# 沪碳智脑——上海化工园区CCU技术智能决策与分析平台

## 项目概述

本项目是一个基于化学吸收法CO2捕集与转化技术的智能决策分析平台，专注于上海化工园区的CCU（Carbon Capture and Utilization）技术应用场景。

### 核心技术路线
- **技术方向**: 化学吸收法捕集CO2并转化为高价值化学品（甲醇、聚碳酸酯等）
- **应用场景**: 上海化学工业区大型乙烯裂解装置烟道气处理
- **技术优势**: 化工产业链完整、产品消纳市场成熟、港口物流便利

## 技术架构

### 前端技术栈
- **HTML5 + CSS3 + JavaScript**: 现代化Web界面
- **Plotly.js + ECharts**: 数据可视化
- **高德地图API**: 地理空间分析

### 后端技术栈
- **Node.js + Express**: RESTful API服务
- **Python**: 数据分析和机器学习
- **LangChain**: LLM智能解读模块

### 数据处理
- **Pandas + NumPy**: 数据处理和分析
- **Scikit-learn**: 机器学习预测模型
- **Mock Data**: 基于真实场景的模拟数据

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

## 快速开始

### 环境要求
- Node.js 16+
- Python 3.8+
- 现代浏览器（Chrome、Firefox、Safari）

### 安装依赖
```bash
# 安装Node.js依赖
npm install

# 安装Python依赖
pip install -r requirements.txt
```

### 启动项目
```bash
# 启动后端服务
npm run dev

# 启动前端服务
npm run serve

# 生成模拟数据
python src/main/python/data_generation/generate_mock_data.py
```

## 开发指南

1. **阅读CLAUDE.md** - 包含开发规范和重要规则
2. **遵循项目结构** - 代码放在对应的模块目录下
3. **单一数据源** - 避免重复实现相同功能
4. **提交规范** - 每完成一个任务立即提交代码

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

## 联系信息

- **项目负责人**: [crandler]
- **GitHub仓库**: https://github.com/huh7i5/carbon2.git
- **技术支持**: 感恩Claude Code

