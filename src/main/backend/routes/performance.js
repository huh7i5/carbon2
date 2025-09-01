// 技术性能监控路由
const express = require('express');
const router = express.Router();

let dataService = null;

router.use((req, res, next) => {
    if (!dataService && req.app.locals.dataService) {
        dataService = req.app.locals.dataService;
    }
    next();
});

/**
 * @route GET /api/performance/data
 * @desc 获取技术性能数据
 * @access Public
 */
router.get('/data', async (req, res) => {
    try {
        const { timeRange = '24h', metrics } = req.query;
        
        console.log(`获取性能数据: ${timeRange}, 指标: ${metrics}`);
        
        // 获取历史数据
        const historicalData = dataService ? 
            await dataService.getHistoricalData(timeRange) : 
            generateMockPerformanceData(timeRange);
        
        // 提取指定的性能指标
        const performanceData = extractPerformanceMetrics(historicalData, metrics);
        
        res.json({
            success: true,
            data: performanceData,
            timeRange,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取性能数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PERFORMANCE_FETCH_ERROR',
                message: '获取性能数据失败',
                details: error.message
            }
        });
    }
});

/**
 * @route GET /api/performance/summary
 * @desc 获取性能汇总统计
 * @access Public
 */
router.get('/summary', async (req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        
        const historicalData = dataService ? 
            await dataService.getHistoricalData(timeRange) : 
            generateMockPerformanceData(timeRange);
        
        const summary = calculatePerformanceSummary(historicalData);
        
        res.json({
            success: true,
            data: summary,
            timeRange,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取性能汇总失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PERFORMANCE_SUMMARY_ERROR',
                message: '获取性能汇总失败',
                details: error.message
            }
        });
    }
});

// 提取性能指标
function extractPerformanceMetrics(historicalData, metrics) {
    const timestamps = historicalData.map(d => d.timestamp);
    const result = { timestamps };
    
    // 默认指标
    const defaultMetrics = ['captureRate', 'energyConsumption', 'solventFlow'];
    const requestedMetrics = metrics ? metrics.split(',') : defaultMetrics;
    
    requestedMetrics.forEach(metric => {
        switch (metric) {
            case 'captureRate':
                result.captureRate = historicalData.map(d => d.co2_capture_rate);
                break;
            case 'energyConsumption':
                result.energyConsumption = historicalData.map(d => d.energy_consumption);
                break;
            case 'solventFlow':
                result.solventFlow = historicalData.map(d => d.solvent_flow_rate);
                break;
            case 'flueGasFlow':
                result.flueGasFlow = historicalData.map(d => d.flue_gas_flow_rate);
                break;
            case 'methanolYield':
                result.methanolYield = historicalData.map(d => d.methanol_yield);
                break;
        }
    });
    
    return result;
}

// 计算性能汇总统计
function calculatePerformanceSummary(historicalData) {
    if (!historicalData || historicalData.length === 0) {
        return null;
    }
    
    const summary = {
        captureRate: calculateStats(historicalData.map(d => d.co2_capture_rate)),
        energyConsumption: calculateStats(historicalData.map(d => d.energy_consumption)),
        solventFlow: calculateStats(historicalData.map(d => d.solvent_flow_rate)),
        methanolYield: calculateStats(historicalData.map(d => d.methanol_yield)),
        overallEfficiency: calculateEfficiencyScore(historicalData)
    };
    
    return summary;
}

// 计算统计信息
function calculateStats(values) {
    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    
    return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: parseFloat(avg.toFixed(2)),
        median: sorted[Math.floor(sorted.length / 2)],
        trend: calculateTrend(values),
        stability: calculateStability(values, avg)
    };
}

// 计算趋势
function calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const first = values.slice(0, Math.floor(values.length / 3)).reduce((a, b) => a + b, 0);
    const last = values.slice(-Math.floor(values.length / 3)).reduce((a, b) => a + b, 0);
    
    const change = (last - first) / first;
    
    if (change > 0.02) return 'increasing';
    if (change < -0.02) return 'decreasing';
    return 'stable';
}

// 计算稳定性评分
function calculateStability(values, avg) {
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avg; // 变异系数
    
    if (cv < 0.05) return 'excellent';
    if (cv < 0.10) return 'good';
    if (cv < 0.15) return 'fair';
    return 'poor';
}

// 计算综合效率评分
function calculateEfficiencyScore(historicalData) {
    const avgCaptureRate = historicalData.reduce((acc, d) => acc + d.co2_capture_rate, 0) / historicalData.length;
    const avgEnergyConsumption = historicalData.reduce((acc, d) => acc + d.energy_consumption, 0) / historicalData.length;
    const avgMethanolYield = historicalData.reduce((acc, d) => acc + d.methanol_yield, 0) / historicalData.length;
    
    // 综合效率评分算法
    const captureScore = (avgCaptureRate - 75) / (95 - 75) * 40; // 40分权重
    const energyScore = (5 - avgEnergyConsumption) / (5 - 2.5) * 30; // 30分权重（能耗越低越好）
    const yieldScore = (avgMethanolYield - 15) / (30 - 15) * 30; // 30分权重
    
    const totalScore = Math.max(0, Math.min(100, captureScore + energyScore + yieldScore));
    
    let grade = 'Poor';
    if (totalScore >= 90) grade = 'Excellent';
    else if (totalScore >= 80) grade = 'Good';
    else if (totalScore >= 70) grade = 'Fair';
    else if (totalScore >= 60) grade = 'Average';
    
    return {
        score: parseFloat(totalScore.toFixed(1)),
        grade,
        components: {
            capture: parseFloat(captureScore.toFixed(1)),
            energy: parseFloat(energyScore.toFixed(1)),
            yield: parseFloat(yieldScore.toFixed(1))
        }
    };
}

// 生成模拟性能数据
function generateMockPerformanceData(timeRange) {
    const hours = parseTimeRange(timeRange);
    const data = [];
    
    for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
        data.push({
            timestamp: timestamp.toISOString(),
            co2_capture_rate: 85 + Math.random() * 10 + Math.sin(i / 12) * 3,
            energy_consumption: 3.2 + Math.random() * 0.8 + Math.sin(i / 6) * 0.2,
            solvent_flow_rate: 180 + Math.random() * 40 + Math.cos(i / 8) * 15,
            flue_gas_flow_rate: 15000 + Math.random() * 3000,
            methanol_yield: 18 + Math.random() * 8 + Math.sin(i / 10) * 2
        });
    }
    
    return data;
}

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