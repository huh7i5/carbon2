# 沪碳智脑平台 API 设计文档

## 概述

基于前端6大模块的数据需求，设计RESTful API接口架构，支持实时数据获取、历史数据查询、AI预测和LLM智能分析。

## 架构设计

```
Frontend (React/Vue/Vanilla JS)
    ↓ HTTP/WebSocket
Backend (Node.js + Express)
    ↓ Child Process
Python Analysis Module
    ↓ File I/O
Data Storage (JSON/SQLite)
```

## API 接口规范

### 1. KPI 仪表盘数据接口

#### GET /api/kpi/current
获取当前实时KPI数据

**响应示例：**
```json
{
  "success": true,
  "data": {
    "totalInvestment": {
      "value": 2.8,
      "unit": "亿元",
      "change": "+2.5%"
    },
    "co2Capture": {
      "value": 156.8,
      "unit": "吨",
      "change": "+12.3%"
    },
    "methanolProduction": {
      "value": 24.6,
      "unit": "吨",
      "change": "+8.7%"
    },
    "realTimeProfit": {
      "value": 18.9,
      "unit": "万元",
      "change": "+15.2%"
    }
  },
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### 2. 技术性能监控接口

#### GET /api/performance/data
获取技术性能数据

**请求参数：**
- `timeRange`: string - "24h", "7d", "30d"
- `metrics`: array - ["captureRate", "energyConsumption", "solventFlow"]

**响应示例：**
```json
{
  "success": true,
  "data": {
    "timestamps": ["2025-01-01T00:00:00Z", "..."],
    "captureRate": [89.5, 90.2, 88.7, "..."],
    "energyConsumption": [3.2, 3.1, 3.4, "..."],
    "solventFlow": [185, 190, 182, "..."]
  },
  "timeRange": "24h"
}
```

### 3. 地理空间数据接口

#### GET /api/geo/locations
获取地理位置数据

**响应示例：**
```json
{
  "success": true,
  "data": {
    "sourceLocation": {
      "lng": 121.783333,
      "lat": 30.866667,
      "name": "上海化工园区CO2捕集源",
      "type": "source",
      "captureRate": 89.5,
      "dailyCapture": 3620
    },
    "storageLocations": [
      {
        "lng": 121.9,
        "lat": 30.75,
        "name": "东海CO2封存点A",
        "type": "storage",
        "capacity": 100000,
        "currentStorage": 45600
      }
    ],
    "transportRoutes": [...]
  }
}
```

### 4. 经济效益分析接口

#### GET /api/economic/analysis
获取经济分析数据

**响应示例：**
```json
{
  "success": true,
  "data": {
    "costBreakdown": {
      "electricity": 12500,
      "solvent": 8600,
      "labor": 3000,
      "maintenance": 2000,
      "other": 1500
    },
    "profitTrend": [
      {
        "date": "2025-01-01",
        "revenue": 186.5,
        "cost": 145.2,
        "profit": 41.3
      }
    ]
  }
}
```

### 5. AI 预测接口

#### POST /api/ai/predict
运行AI预测模型

**请求体：**
```json
{
  "model": "arima",  // "arima" | "lgbm"
  "horizon": 24,     // 预测时长(小时)
  "metrics": ["captureRate"]
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "model": "arima",
    "accuracy": 0.942,
    "predictions": [
      {
        "timestamp": "2025-01-01T13:00:00Z",
        "predicted": 87.5,
        "confidence": 0.95
      }
    ]
  }
}
```

### 6. LLM 智能分析接口

#### POST /api/llm/analyze
智能数据解读

**请求体：**
```json
{
  "query": "分析当前KPI数据情况",
  "context": "kpi",  // "kpi" | "performance" | "economic" | "prediction"
  "data": {}  // 相关数据上下文
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "response": "根据当前KPI数据，项目运行状况良好...",
    "confidence": 0.85,
    "suggestions": [
      "建议优化溶剂循环系统",
      "可考虑在低电价时段提高运行负荷"
    ]
  }
}
```

### 7. 实时数据 WebSocket

#### WebSocket /ws/realtime
实时数据推送

**连接后接收：**
```json
{
  "type": "kpi_update",
  "data": {
    "co2Capture": 157.2,
    "methanolProduction": 25.1
  },
  "timestamp": "2025-01-01T12:05:00Z"
}
```

## 数据模型设计

### CCU 运行数据模型
```javascript
{
  id: string,
  timestamp: Date,
  flue_gas_flow_rate: number,    // 烟道气流量 m³/h
  co2_concentration_in: number,   // 入口CO2浓度 %
  co2_concentration_out: number,  // 出口CO2浓度 %
  co2_capture_rate: number,       // CO2捕集率 %
  solvent_flow_rate: number,      // 溶剂流量 t/h
  energy_consumption: number,     // 能耗 GJ/tCO2
  methanol_yield: number,         // 甲醇产量 t/h
  electricity_price: number,      // 电价 元/kWh
  operational_cost: number,       // 运营成本 元/h
  revenue: number,               // 收入 元/h
  profit: number                 // 利润 元/h
}
```

### 地理位置模型
```javascript
{
  id: string,
  name: string,
  type: "source" | "storage" | "transport" | "partner",
  coordinates: [longitude, latitude],
  properties: {
    capacity?: number,
    currentStorage?: number,
    captureRate?: number,
    dailyCapture?: number
  },
  description: string
}
```

## Python 数据分析集成

### 1. 数据生成模块
- 路径: `src/main/python/data_generation/`
- 功能: 生成CCU技术运行的模拟数据
- 输出: JSON格式的时序数据

### 2. 机器学习模块  
- 路径: `src/main/python/ml_models/`
- 功能: ARIMA和LightGBM预测模型
- 输入: 历史运行数据
- 输出: 预测结果和置信区间

### 3. 数据分析模块
- 路径: `src/main/python/analysis/`
- 功能: 统计分析、趋势分析、异常检测
- 输出: 分析报告和可视化数据

## 错误处理

所有API响应遵循统一格式：

**成功响应：**
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "请求参数无效",
    "details": {}
  }
}
```

## 性能要求

- API响应时间: < 200ms (实时数据)
- AI预测接口: < 5s
- WebSocket延迟: < 50ms
- 数据更新频率: 30秒/次
- 并发支持: 100+ 连接

## 安全考虑

- API密钥验证
- CORS跨域配置
- 请求频率限制
- 数据加密传输
- 输入参数校验