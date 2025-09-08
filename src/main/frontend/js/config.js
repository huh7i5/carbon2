// 配置文件
const CONFIG = {
    // 系统基础配置
    SYSTEM: {
        NAME: '沪碳智脑',
        FULL_NAME: '上海化工园区CCU技术智能决策与分析平台',
        VERSION: '1.0.0',
        AUTHOR: 'crandler'
    },

    // 高德地图配置
    AMAP: {
        KEY: 'ec8bd2f50328bddc6a67a4e881f4adfb', // 高德地图API Key
        VERSION: '2.0',
        CENTER: [121.783333, 30.866667], // 上海化学工业区坐标
        ZOOM: 12
    },

    // 数据更新配置
    UPDATE: {
        REAL_TIME_INTERVAL: 30000,    // 实时数据更新间隔(毫秒)
        CHART_REFRESH_INTERVAL: 60000, // 图表刷新间隔(毫秒)
        KPI_UPDATE_INTERVAL: 10000     // KPI更新间隔(毫秒)
    },

    // 图表配置
    CHARTS: {
        THEME: 'dark',
        ANIMATION_DURATION: 1000,
        COLORS: {
            PRIMARY: '#00d4aa',
            SECONDARY: '#007a8c',
            SUCCESS: '#00d4aa',
            WARNING: '#ffc107',
            ERROR: '#ff6b6b',
            INFO: '#2196f3'
        }
    },

    // 模拟数据配置
    MOCK_DATA: {
        ENABLED: true,
        HISTORY_DAYS: 30,           // 历史数据天数
        DATA_POINTS_PER_DAY: 24,    // 每天数据点数
        VARIATION_RANGE: 0.1        // 数据变化范围
    },

    // CCU技术参数配置
    CCU_PARAMS: {
        // CO2捕集参数
        CAPTURE: {
            MIN_RATE: 75,           // 最小捕集率(%)
            MAX_RATE: 98,           // 最大捕集率(%)
            TARGET_RATE: 90,        // 目标捕集率(%)
            FLOW_RATE_MIN: 12000,   // 最小烟道气流量(m³/h)
            FLOW_RATE_MAX: 18000    // 最大烟道气流量(m³/h)
        },
        
        // 溶剂参数
        SOLVENT: {
            FLOW_MIN: 150,          // 最小流量(t/h)
            FLOW_MAX: 250,          // 最大流量(t/h)
            PRICE_MIN: 2600,        // 最低价格(元/吨)
            PRICE_MAX: 3200         // 最高价格(元/吨)
        },
        
        // 能耗参数
        ENERGY: {
            MIN_CONSUMPTION: 2.5,   // 最小能耗(GJ/tCO2)
            MAX_CONSUMPTION: 5.0,   // 最大能耗(GJ/tCO2)
            TARGET_CONSUMPTION: 3.2 // 目标能耗(GJ/tCO2)
        },
        
        // 甲醇产出参数
        METHANOL: {
            MIN_YIELD: 15,          // 最小产量(t/h)
            MAX_YIELD: 30,          // 最大产量(t/h)
            PRICE_MIN: 2900,        // 最低市场价(元/吨)
            PRICE_MAX: 3500         // 最高市场价(元/吨)
        }
    },

    // 经济参数配置
    ECONOMIC: {
        // 电价配置(上海工业电价)
        ELECTRICITY: {
            PEAK_PRICE: 0.92,       // 峰时电价(元/kWh)
            NORMAL_PRICE: 0.63,     // 平时电价(元/kWh)
            VALLEY_PRICE: 0.35,     // 谷时电价(元/kWh)
            PEAK_HOURS: [[8, 11], [18, 21]],  // 峰时时段
            VALLEY_HOURS: [[23, 24], [0, 7]]  // 谷时时段
        },
        
        // 碳价配置
        CARBON_PRICE: {
            MIN: 60,                // 最低碳价(元/吨CO2)
            MAX: 100,               // 最高碳价(元/吨CO2)
            AVERAGE: 80             // 平均碳价(元/吨CO2)
        },
        
        // 运营成本配置
        OPERATIONAL_COST: {
            LABOR_HOURLY: 3000,     // 人工成本(元/小时)
            MAINTENANCE_HOURLY: 2000, // 维护成本(元/小时)
            OTHER_HOURLY: 1500      // 其他费用(元/小时)
        }
    },

    // 地理位置配置
    LOCATIONS: {
        // 上海化学工业区
        SICIP: {
            NAME: '上海化学工业区',
            COORDINATES: [121.783333, 30.866667],
            TYPE: 'source',
            DESCRIPTION: '乙烯裂解装置CO2捕集源'
        },
        
        // 存储和运输点
        STORAGE_POINTS: [
            {
                NAME: '东海CO2封存点A',
                COORDINATES: [121.9, 30.75],
                TYPE: 'storage',
                CAPACITY: 100000,
                DESCRIPTION: 'CO2地质封存设施'
            },
            {
                NAME: '产品运输中心',
                COORDINATES: [121.45, 31.15],
                TYPE: 'transport',
                CAPACITY: 50000,
                DESCRIPTION: '甲醇产品物流中心'
            },
            {
                NAME: '合作化工厂B',
                COORDINATES: [121.65, 30.95],
                TYPE: 'partner',
                CAPACITY: 80000,
                DESCRIPTION: 'CO2利用合作企业'
            }
        ]
    },

    // AI模型配置
    AI_MODELS: {
        PREDICTION: {
            ARIMA: {
                NAME: 'ARIMA时间序列模型',
                ACCURACY: 0.942,
                UPDATE_INTERVAL: 3600000, // 1小时更新一次
                PREDICTION_HORIZON: 24    // 预测24小时
            },
            LGBM: {
                NAME: 'LightGBM机器学习模型',
                ACCURACY: 0.956,
                UPDATE_INTERVAL: 1800000, // 30分钟更新一次
                PREDICTION_HORIZON: 12    // 预测12小时
            }
        }
    },

    // LLM配置
    LLM: {
        ENABLED: true,
        MODEL: 'zhipu',             // 'openai', 'zhipu', 'mock'
        API_KEY: '81dafd92fdef48d8af38647d9531f075.jy9Rln9sDeXhldg4',  // 智谱AI API密钥
        MAX_TOKENS: 500,            // 最大回复token数
        TEMPERATURE: 0.7,           // 回复温度
        CONTEXT_LENGTH: 2000        // 上下文长度
    },

    // 界面配置
    UI: {
        THEME: 'dark',
        ANIMATION_ENABLED: true,
        AUTO_REFRESH: true,
        NOTIFICATION_TIMEOUT: 3000,
        CHART_RESPONSIVE: true
    },

    // 开发配置
    DEV: {
        DEBUG_MODE: false,
        CONSOLE_LOG: true,
        PERFORMANCE_MONITOR: false,
        MOCK_DELAY: 1000           // 模拟API延迟(毫秒)
    }
};

// 导出配置
window.CONFIG = CONFIG;

// 配置验证函数
window.validateConfig = function() {
    const warnings = [];
    
    // 检查高德地图API Key
    if (!CONFIG.AMAP.KEY || CONFIG.AMAP.KEY === 'YOUR_AMAP_KEY') {
        warnings.push('高德地图API Key未配置，地图功能将不可用');
    }
    
    // 检查LLM配置
    console.log('🔍 LLM配置检查:', {
        ENABLED: CONFIG.LLM.ENABLED,
        MODEL: CONFIG.LLM.MODEL, 
        API_KEY_LENGTH: CONFIG.LLM.API_KEY ? CONFIG.LLM.API_KEY.length : 0,
        API_KEY_PREFIX: CONFIG.LLM.API_KEY ? CONFIG.LLM.API_KEY.substring(0, 10) + '...' : 'empty'
    });
    
    if (CONFIG.LLM.ENABLED && CONFIG.LLM.MODEL !== 'mock' && !CONFIG.LLM.API_KEY) {
        warnings.push('LLM API Key未配置，将使用模拟回复');
    }
    
    // 显示警告
    if (warnings.length > 0) {
        console.warn('配置警告:');
        warnings.forEach(warning => console.warn('- ' + warning));
    }
    
    return warnings.length === 0;
};

// 自动验证配置
document.addEventListener('DOMContentLoaded', function() {
    window.validateConfig();
});