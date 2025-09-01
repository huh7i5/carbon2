// 经济效益分析路由
const express = require('express');
const router = express.Router();

/**
 * @route GET /api/economic/analysis
 * @desc 获取经济分析数据
 * @access Public
 */
router.get('/analysis', async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        
        const economicData = generateEconomicAnalysis(timeRange);
        
        res.json({
            success: true,
            data: economicData,
            timeRange,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取经济分析数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ECONOMIC_ANALYSIS_ERROR',
                message: '获取经济分析数据失败'
            }
        });
    }
});

function generateEconomicAnalysis(timeRange) {
    // 成本构成分析
    const costBreakdown = {
        electricity: 45000 + Math.random() * 10000,
        solvent: 28000 + Math.random() * 5000,
        labor: 15000 + Math.random() * 2000,
        maintenance: 12000 + Math.random() * 3000,
        other: 8000 + Math.random() * 2000
    };
    
    // 收益趋势（过去30天）
    const profitTrend = [];
    for (let i = 30; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        profitTrend.push({
            date: date.toISOString().split('T')[0],
            revenue: 450 + Math.random() * 100,
            cost: 350 + Math.random() * 50,
            profit: 100 + Math.random() * 50
        });
    }
    
    return {
        costBreakdown,
        profitTrend,
        summary: {
            totalRevenue: profitTrend.reduce((sum, day) => sum + day.revenue, 0),
            totalCost: profitTrend.reduce((sum, day) => sum + day.cost, 0),
            totalProfit: profitTrend.reduce((sum, day) => sum + day.profit, 0),
            profitMargin: '22.3%',
            roi: '18.5%'
        }
    };
}

module.exports = router;