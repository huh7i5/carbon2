// 图表管理模块
class ChartManager {
    constructor() {
        this.charts = {};
        this.theme = this.getChartTheme();
    }

    // 获取图表主题配置
    getChartTheme() {
        return {
            backgroundColor: 'transparent',
            textStyle: {
                color: '#ffffff'
            },
            title: {
                textStyle: {
                    color: '#ffffff'
                }
            },
            legend: {
                textStyle: {
                    color: '#a0a0a0'
                }
            },
            grid: {
                borderColor: 'rgba(255, 255, 255, 0.1)'
            },
            categoryAxis: {
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#a0a0a0'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: ['rgba(255, 255, 255, 0.05)']
                    }
                }
            },
            valueAxis: {
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: '#a0a0a0'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: ['rgba(255, 255, 255, 0.05)']
                    }
                }
            }
        };
    }

    // 初始化所有图表
    initAllCharts() {
        this.initPerformanceCharts();
        this.initEconomicCharts();
        this.initPredictionChart();
    }

    // 初始化性能监控图表
    initPerformanceCharts() {
        const performanceData = window.MockData.getPerformanceData();
        
        // CO2捕集率图表
        this.createCaptureRateChart(performanceData);
        
        // 能耗图表
        this.createEnergyConsumptionChart(performanceData);
        
        // 溶剂流量图表
        this.createSolventFlowChart(performanceData);
    }

    // 创建CO2捕集率图表
    createCaptureRateChart(data) {
        const chart = echarts.init(document.getElementById('captureRateChart'), 'dark');
        
        const option = {
            title: {
                text: 'CO2捕集率 (%)',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 212, 170, 0.5)',
                textStyle: {
                    color: '#ffffff'
                },
                formatter: function(params) {
                    const time = new Date(params[0].axisValue).toLocaleTimeString();
                    return `${time}<br/>捕集率: ${params[0].value.toFixed(1)}%`;
                }
            },
            xAxis: {
                type: 'category',
                data: data.timestamps.map(t => t.toLocaleTimeString()),
                axisLabel: {
                    color: '#a0a0a0',
                    interval: Math.floor(data.timestamps.length / 6)
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                min: 75,
                max: 100,
                axisLabel: {
                    color: '#a0a0a0',
                    formatter: '{value}%'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            series: [{
                name: 'CO2捕集率',
                type: 'line',
                data: data.captureRate,
                smooth: true,
                lineStyle: {
                    color: '#00d4aa',
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(0, 212, 170, 0.3)' },
                            { offset: 1, color: 'rgba(0, 212, 170, 0.05)' }
                        ]
                    }
                },
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#00d4aa'
                }
            }]
        };
        
        chart.setOption(option);
        this.charts.captureRate = chart;
        
        // 响应式处理
        window.addEventListener('resize', () => chart.resize());
    }

    // 创建能耗图表
    createEnergyConsumptionChart(data) {
        const chart = echarts.init(document.getElementById('energyConsumptionChart'), 'dark');
        
        const option = {
            title: {
                text: '再生能耗 (GJ/tCO2)',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(255, 193, 7, 0.5)',
                textStyle: {
                    color: '#ffffff'
                },
                formatter: function(params) {
                    const time = new Date(params[0].axisValue).toLocaleTimeString();
                    return `${time}<br/>能耗: ${params[0].value.toFixed(2)} GJ/tCO2`;
                }
            },
            xAxis: {
                type: 'category',
                data: data.timestamps.map(t => t.toLocaleTimeString()),
                axisLabel: {
                    color: '#a0a0a0',
                    interval: Math.floor(data.timestamps.length / 6)
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#a0a0a0',
                    formatter: '{value}'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            series: [{
                name: '再生能耗',
                type: 'line',
                data: data.energyConsumption,
                smooth: true,
                lineStyle: {
                    color: '#ffc107',
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(255, 193, 7, 0.3)' },
                            { offset: 1, color: 'rgba(255, 193, 7, 0.05)' }
                        ]
                    }
                },
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#ffc107'
                }
            }]
        };
        
        chart.setOption(option);
        this.charts.energyConsumption = chart;
        
        window.addEventListener('resize', () => chart.resize());
    }

    // 创建溶剂流量图表
    createSolventFlowChart(data) {
        const chart = echarts.init(document.getElementById('solventFlowChart'), 'dark');
        
        const option = {
            title: {
                text: '溶剂流量 (t/h)',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(33, 150, 243, 0.5)',
                textStyle: {
                    color: '#ffffff'
                },
                formatter: function(params) {
                    const time = new Date(params[0].axisValue).toLocaleTimeString();
                    return `${time}<br/>流量: ${params[0].value.toFixed(1)} t/h`;
                }
            },
            xAxis: {
                type: 'category',
                data: data.timestamps.map(t => t.toLocaleTimeString()),
                axisLabel: {
                    color: '#a0a0a0',
                    interval: Math.floor(data.timestamps.length / 6)
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#a0a0a0',
                    formatter: '{value}'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            series: [{
                name: '溶剂流量',
                type: 'line',
                data: data.solventFlow,
                smooth: true,
                lineStyle: {
                    color: '#2196f3',
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
                            { offset: 1, color: 'rgba(33, 150, 243, 0.05)' }
                        ]
                    }
                },
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#2196f3'
                }
            }]
        };
        
        chart.setOption(option);
        this.charts.solventFlow = chart;
        
        window.addEventListener('resize', () => chart.resize());
    }

    // 初始化经济分析图表
    initEconomicCharts() {
        const economicData = window.MockData.getEconomicData();
        
        this.createCostPieChart(economicData.costBreakdown);
        this.createProfitBarChart(economicData.profitTrend);
    }

    // 创建成本构成饼图
    createCostPieChart(costData) {
        const chart = echarts.init(document.getElementById('costPieChart'), 'dark');
        
        const pieData = [
            { name: '电费', value: costData.electricity, itemStyle: { color: '#00d4aa' } },
            { name: '溶剂成本', value: costData.solvent, itemStyle: { color: '#ffc107' } },
            { name: '人工成本', value: costData.labor, itemStyle: { color: '#2196f3' } },
            { name: '设备维护', value: costData.maintenance, itemStyle: { color: '#ff6b6b' } },
            { name: '其他费用', value: costData.other, itemStyle: { color: '#9c27b0' } }
        ];
        
        const option = {
            title: {
                text: '成本构成',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 14
                },
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                textStyle: {
                    color: '#ffffff'
                },
                formatter: '{b}: ¥{c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: '20%',
                textStyle: {
                    color: '#a0a0a0',
                    fontSize: 11
                }
            },
            series: [{
                name: '成本构成',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['60%', '50%'],
                data: pieData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                labelLine: {
                    lineStyle: {
                        color: '#a0a0a0'
                    }
                },
                label: {
                    color: '#a0a0a0',
                    fontSize: 11
                }
            }]
        };
        
        chart.setOption(option);
        this.charts.costPie = chart;
        
        window.addEventListener('resize', () => chart.resize());
    }

    // 创建收益柱状图
    createProfitBarChart(profitData) {
        const chart = echarts.init(document.getElementById('profitBarChart'), 'dark');
        
        const dates = profitData.map(d => d.date.toLocaleDateString());
        const revenues = profitData.map(d => d.revenue);
        const costs = profitData.map(d => d.cost);
        const profits = profitData.map(d => d.profit);
        
        const option = {
            title: {
                text: '收入-成本-利润分析',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                textStyle: {
                    color: '#ffffff'
                },
                formatter: function(params) {
                    let result = params[0].axisValueLabel + '<br/>';
                    params.forEach(param => {
                        result += `${param.seriesName}: ¥${param.value.toFixed(1)}万<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['收入', '成本', '利润'],
                textStyle: {
                    color: '#a0a0a0'
                },
                top: 25
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    color: '#a0a0a0',
                    rotate: 45,
                    interval: 4
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#a0a0a0',
                    formatter: '¥{value}万'
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            series: [
                {
                    name: '收入',
                    type: 'bar',
                    data: revenues,
                    itemStyle: {
                        color: '#00d4aa'
                    }
                },
                {
                    name: '成本',
                    type: 'bar',
                    data: costs,
                    itemStyle: {
                        color: '#ff6b6b'
                    }
                },
                {
                    name: '利润',
                    type: 'bar',
                    data: profits,
                    itemStyle: {
                        color: '#ffc107'
                    }
                }
            ]
        };
        
        chart.setOption(option);
        this.charts.profitBar = chart;
        
        window.addEventListener('resize', () => chart.resize());
    }

    // 初始化AI预测图表
    initPredictionChart() {
        const predictionData = window.MockData.getPredictionData();
        this.createPredictionChart(predictionData);
    }

    // 创建AI预测图表
    createPredictionChart(data) {
        const chart = echarts.init(document.getElementById('predictionChart'), 'dark');
        
        const historicalTimes = data.historical.timestamps.map(t => t.toLocaleString());
        const predictionTimes = data.prediction.map(p => p.timestamp.toLocaleString());
        const allTimes = [...historicalTimes, ...predictionTimes];
        
        const historicalData = data.historical.actual;
        const predictionData = new Array(historicalData.length).fill(null).concat(
            data.prediction.map(p => p.predicted)
        );
        const confidenceData = new Array(historicalData.length).fill(null).concat(
            data.prediction.map(p => p.confidence * 100)
        );
        
        const option = {
            title: {
                text: 'CO2捕集率预测 (ARIMA模型)',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                textStyle: {
                    color: '#ffffff'
                }
            },
            legend: {
                data: ['历史数据', '预测数据', '置信度'],
                textStyle: {
                    color: '#a0a0a0'
                },
                top: 25
            },
            xAxis: {
                type: 'category',
                data: allTimes,
                axisLabel: {
                    color: '#a0a0a0',
                    interval: Math.floor(allTimes.length / 8)
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '捕集率 (%)',
                    min: 75,
                    max: 100,
                    axisLabel: {
                        color: '#a0a0a0',
                        formatter: '{value}%'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                {
                    type: 'value',
                    name: '置信度 (%)',
                    min: 70,
                    max: 100,
                    axisLabel: {
                        color: '#a0a0a0',
                        formatter: '{value}%'
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    }
                }
            ],
            series: [
                {
                    name: '历史数据',
                    type: 'line',
                    data: historicalData,
                    lineStyle: {
                        color: '#00d4aa',
                        width: 2
                    },
                    symbol: 'circle',
                    symbolSize: 4,
                    itemStyle: {
                        color: '#00d4aa'
                    }
                },
                {
                    name: '预测数据',
                    type: 'line',
                    data: predictionData,
                    lineStyle: {
                        color: '#ffc107',
                        width: 3,
                        type: 'dashed'
                    },
                    symbol: 'diamond',
                    symbolSize: 6,
                    itemStyle: {
                        color: '#ffc107'
                    }
                },
                {
                    name: '置信度',
                    type: 'line',
                    yAxisIndex: 1,
                    data: confidenceData,
                    lineStyle: {
                        color: '#2196f3',
                        width: 2,
                        opacity: 0.6
                    },
                    symbol: 'none',
                    areaStyle: {
                        color: 'rgba(33, 150, 243, 0.1)'
                    }
                }
            ]
        };
        
        chart.setOption(option);
        this.charts.prediction = chart;
        
        window.addEventListener('resize', () => chart.resize());
    }

    // 更新图表数据
    updateCharts() {
        this.initPerformanceCharts();
        this.initEconomicCharts();
    }

    // 销毁所有图表
    dispose() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.dispose === 'function') {
                chart.dispose();
            }
        });
        this.charts = {};
    }
}

// 全局实例
window.ChartManager = new ChartManager();