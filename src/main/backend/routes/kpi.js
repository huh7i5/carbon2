// KPI数据路由
const express = require('express');
const router = express.Router();

// 模拟数据服务（后续会替换为真实的数据服务）
let dataService = null;

// 中间件：确保数据服务可用
router.use((req, res, next) => {
    if (!dataService && req.app.locals.dataService) {
        dataService = req.app.locals.dataService;
    }
    next();
});

/**
 * @route GET /api/kpi/current
 * @desc 获取当前实时KPI数据
 * @access Public
 */
router.get('/current', async (req, res) => {
    try {
        console.log('获取当前KPI数据请求');
        
        // 从数据服务获取实时数据
        const realtimeData = dataService ? 
            await dataService.getRealTimeData() : 
            generateMockKPIData();
        
        // 计算KPI指标
        const kpiData = calculateKPIFromRealtime(realtimeData);
        
        res.json({
            success: true,
            data: kpiData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取KPI数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KPI_FETCH_ERROR',
                message: '获取KPI数据失败',
                details: error.message
            }
        });
    }
});

/**
 * @route GET /api/kpi/history
 * @desc 获取历史KPI数据
 * @access Public
 */
router.get('/history', async (req, res) => {
    try {
        const { timeRange = '24h', interval = '1h' } = req.query;
        
        console.log(`获取KPI历史数据: ${timeRange}, 间隔: ${interval}`);
        
        // 获取历史数据
        const historicalData = dataService ? 
            await dataService.getHistoricalData(timeRange) : 
            generateMockHistoricalKPI(timeRange);
        
        // 按间隔聚合数据
        const aggregatedData = aggregateKPIData(historicalData, interval);
        
        res.json({
            success: true,
            data: {
                timeRange,
                interval,
                records: aggregatedData
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取KPI历史数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KPI_HISTORY_ERROR',
                message: '获取KPI历史数据失败',
                details: error.message
            }
        });
    }
});

/**
 * @route POST /api/kpi/refresh
 * @desc 刷新KPI数据
 * @access Public
 */
router.post('/refresh', async (req, res) => {
    try {
        console.log('刷新KPI数据请求');
        
        // 生成新的实时数据
        const newData = dataService ? 
            await dataService.generateNewRealTimeData() : 
            generateMockKPIData();
        
        const kpiData = calculateKPIFromRealtime(newData);
        
        // 广播更新给WebSocket客户端
        if (req.app.locals.wsService) {
            req.app.locals.wsService.sendKPIUpdate(kpiData);
        }
        
        res.json({
            success: true,
            data: kpiData,
            message: 'KPI数据已刷新',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('刷新KPI数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'KPI_REFRESH_ERROR',
                message: '刷新KPI数据失败',
                details: error.message
            }
        });
    }
});

// 从实时数据计算KPI指标
function calculateKPIFromRealtime(realtimeData) {
    const co2CaptureAmount = (realtimeData.flue_gas_flow_rate * 
                             realtimeData.co2_concentration_in * 
                             realtimeData.co2_capture_rate / 100) / 1000; // 转换为吨
    
    return {
        totalInvestment: {
            value: 2.8,
            unit: '亿元',
            change: '+2.5%',
            trend: 'up'
        },
        co2Capture: {
            value: parseFloat(co2CaptureAmount.toFixed(1)),
            unit: '吨/小时',
            change: generateRandomChange(),
            trend: getTrend()
        },
        methanolProduction: {
            value: parseFloat(realtimeData.methanol_yield.toFixed(1)),
            unit: '吨/小时',
            change: generateRandomChange(),
            trend: getTrend()
        },
        realTimeProfit: {
            value: parseFloat((realtimeData.profit / 10000).toFixed(1)),
            unit: '万元/小时',
            change: generateRandomChange(),
            trend: getTrend()
        },
        captureRate: {
            value: parseFloat(realtimeData.co2_capture_rate.toFixed(1)),
            unit: '%',
            change: generateRandomChange(),
            trend: getTrend()
        },
        energyEfficiency: {
            value: parseFloat(realtimeData.energy_consumption.toFixed(2)),
            unit: 'GJ/tCO2',
            change: generateRandomChange(),
            trend: getTrend()
        }
    };
}

// 聚合KPI历史数据
function aggregateKPIData(historicalData, interval) {
    const intervalMinutes = parseInterval(interval);
    const aggregated = [];
    
    for (let i = 0; i < historicalData.length; i += intervalMinutes) {
        const chunk = historicalData.slice(i, i + intervalMinutes);
        if (chunk.length === 0) continue;
        
        const avgData = chunk.reduce((acc, curr) => {
            Object.keys(curr).forEach(key => {
                if (typeof curr[key] === 'number') {
                    acc[key] = (acc[key] || 0) + curr[key] / chunk.length;
                }
            });
            return acc;
        }, {});
        
        avgData.timestamp = chunk[0].timestamp;
        aggregated.push(calculateKPIFromRealtime(avgData));
    }
    
    return aggregated;
}

// 解析时间间隔
function parseInterval(interval) {
    const intervals = {
        '10m': 1,
        '1h': 6,
        '4h': 24,
        '1d': 144
    };
    return intervals[interval] || 6;
}

// 生成随机变化百分比
function generateRandomChange() {
    const change = (Math.random() - 0.5) * 20; // -10% 到 +10%
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
}

// 获取趋势方向
function getTrend() {
    const trends = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
}

// 生成模拟KPI数据
function generateMockKPIData() {
    return {
        timestamp: new Date().toISOString(),
        flue_gas_flow_rate: 15000 + Math.random() * 3000,
        co2_concentration_in: 12 + Math.random() * 3,
        co2_capture_rate: 85 + Math.random() * 10,
        methanol_yield: 18 + Math.random() * 8,
        profit: 180000 + Math.random() * 40000,
        energy_consumption: 3.2 + Math.random() * 0.8
    };
}

// 生成模拟历史KPI数据
function generateMockHistoricalKPI(timeRange) {
    const hours = parseTimeRange(timeRange);
    const data = [];
    
    for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
        data.push({
            timestamp: timestamp.toISOString(),
            flue_gas_flow_rate: 15000 + Math.random() * 3000,
            co2_concentration_in: 12 + Math.random() * 3,
            co2_capture_rate: 85 + Math.random() * 10,
            methanol_yield: 18 + Math.random() * 8,
            profit: 180000 + Math.random() * 40000,
            energy_consumption: 3.2 + Math.random() * 0.8
        });
    }
    
    return data;
}

// 解析时间范围
function parseTimeRange(timeRange) {
    const ranges = {
        '1h': 1,
        '24h': 24,
        '7d': 168,
        '30d': 720
    };
    return ranges[timeRange] || 24;
}

module.exports = router;