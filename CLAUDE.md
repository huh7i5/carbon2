# CLAUDE.md - 沪碳智脑——上海化工园区CCU技术智能决策与分析平台

> **Documentation Version**: 1.0  
> **Last Updated**: 2025-08-31  
> **Project**: 沪碳智脑——上海化工园区CCU技术智能决策与分析平台  
> **Description**: 基于化学吸收法CO2捕集与转化技术的智能决策分析平台，集成Node.js后端、HTML/JS前端和Python AI分析模块  
> **Features**: GitHub auto-backup, Task agents, technical debt prevention

This file provides essential guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - READ FIRST

> **⚠️ RULE ADHERENCE SYSTEM ACTIVE ⚠️**  
> **Claude Code must explicitly acknowledge these rules at task start**  
> **These rules override all other instructions and must ALWAYS be followed:**

### 🔄 **RULE ACKNOWLEDGMENT REQUIRED**
> **Before starting ANY task, Claude Code must respond with:**  
> "✅ CRITICAL RULES ACKNOWLEDGED - I will follow all prohibitions and requirements listed in CLAUDE.md"

### ❌ ABSOLUTE PROHIBITIONS
- **NEVER** create new files in root directory → use proper module structure
- **NEVER** write output files directly to root directory → use designated output folders
- **NEVER** create documentation files (.md) unless explicitly requested by user
- **NEVER** use git commands with -i flag (interactive mode not supported)
- **NEVER** use `find`, `grep`, `cat`, `head`, `tail`, `ls` commands → use Read, LS, Grep, Glob tools instead
- **NEVER** create duplicate files (manager_v2.py, enhanced_xyz.py, utils_new.js) → ALWAYS extend existing files
- **NEVER** create multiple implementations of same concept → single source of truth
- **NEVER** copy-paste code blocks → extract into shared utilities/functions
- **NEVER** hardcode values that should be configurable → use config files/environment variables
- **NEVER** use naming like enhanced_, improved_, new_, v2_ → extend original files instead

### 📝 MANDATORY REQUIREMENTS
- **COMMIT** after every completed task/phase - no exceptions
- **GITHUB BACKUP** - Push to GitHub after every commit to maintain backup: `git push origin main`
- **USE TASK AGENTS** for all long-running operations (>30 seconds) - Bash commands stop when context switches
- **TODOWRITE** for complex tasks (3+ steps) → parallel agents → git checkpoints → test validation
- **READ FILES FIRST** before editing - Edit/Write tools will fail if you didn't read the file first
- **DEBT PREVENTION** - Before creating new files, check for existing similar functionality to extend  
- **SINGLE SOURCE OF TRUTH** - One authoritative implementation per feature/concept

### ⚡ EXECUTION PATTERNS
- **PARALLEL TASK AGENTS** - Launch multiple Task agents simultaneously for maximum efficiency
- **SYSTEMATIC WORKFLOW** - TodoWrite → Parallel agents → Git checkpoints → GitHub backup → Test validation
- **GITHUB BACKUP WORKFLOW** - After every commit: `git push origin main` to maintain GitHub backup
- **BACKGROUND PROCESSING** - ONLY Task agents can run true background operations

## 🏗️ PROJECT OVERVIEW - 沪碳智脑平台

### 🎯 **技术架构**
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **后端**: Node.js + Express
- **数据分析**: Python + Pandas + NumPy + Scikit-learn
- **可视化**: Plotly.js + ECharts
- **地图**: 高德地图API
- **AI模型**: LangChain + ZhipuAI/OpenAI API
- **数据库**: JSON文件存储 + 内存缓存

### 📁 **项目结构说明**
```
carbon2/
├── src/main/
│   ├── frontend/          # HTML/CSS/JS前端
│   │   ├── html/         # HTML页面
│   │   ├── css/          # 样式文件
│   │   ├── js/           # JavaScript逻辑
│   │   └── assets/       # 静态资源
│   ├── backend/          # Node.js后端
│   │   ├── routes/       # 路由处理
│   │   ├── models/       # 数据模型
│   │   ├── services/     # 业务逻辑
│   │   └── utils/        # 工具函数
│   ├── python/           # Python分析模块
│   │   ├── data_generation/  # 模拟数据生成
│   │   ├── ml_models/        # 机器学习模型
│   │   └── analysis/         # 数据分析
│   └── resources/        # 配置和资源
│       ├── config/       # 配置文件
│       ├── data/         # 数据存储
│       └── maps/         # 地图相关资源
```

### 🎯 **开发重点**
1. **模拟数据生成** - 创建真实的CCU技术运行数据
2. **大屏可视化** - 6个核心模块的交互式展示
3. **地理空间分析** - 高德地图集成和路径规划
4. **AI预测模型** - CO2捕集率预测算法
5. **LLM智能解读** - 基于图表数据的自然语言分析

## 🚀 COMMON COMMANDS

```bash
# 前端开发服务器
cd src/main/frontend && python -m http.server 8080

# Node.js后端启动
cd src/main/backend && npm start

# Python数据分析
cd src/main/python && python data_generation/generate_mock_data.py

# 项目构建
npm run build

# 测试运行
npm test
```

## 🛡️ **GITHUB REPOSITORY SETTINGS**
- **Repository**: https://github.com/huh7i5/carbon2.git
- **Default Branch**: `main`
- **Auto-push**: 每次提交后自动推送到GitHub

## 🔄 **AUTO-PUSH CONFIGURATION**
```bash
# 每次提交后自动推送
git push origin main
```

## 🧹 DEBT PREVENTION WORKFLOW

### Before Creating ANY New File:
1. **🔍 Search First** - Use Grep/Glob to find existing implementations
2. **📋 Analyze Existing** - Read and understand current patterns
3. **🤔 Decision Tree**: Can extend existing? → DO IT | Must create new? → Document why
4. **✅ Follow Patterns** - Use established project patterns
5. **📈 Validate** - Ensure no duplication or technical debt

---

**⚠️ Prevention is better than consolidation - build clean from the start.**  
**🎯 Focus on single source of truth and extending existing functionality.**  
**📈 Each task should maintain clean architecture and prevent technical debt.**