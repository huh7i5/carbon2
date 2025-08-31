// 模拟数据生成模块
class MockDataGenerator {
    constructor() {
        this.currentTime = new Date();
        this.isInitialized = false;
    }

    // 初始化数据
    init() {
        if (this.isInitialized) return;
        
        this.generateHistoricalData();
        this.isInitialized = true;
        console.log('Mock data initialized');
    }

    // 生成历史数据（过去30天）
    generateHistoricalData() {
        this.historicalData = [];
        const now = new Date();
        
        for (let i = 720; i >= 0; i--) { // 过去30天，每小时一个数据点
            const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
            
            const baseCapture = 85 + Math.random() * 10; // 85-95%
            const captureRate = Math.max(75, Math.min(98, baseCapture + Math.sin(i / 24) * 3));
            
            const data = {
                timestamp: timestamp,
                // 实时运行数据
                flue_gas_flow_rate: 15000 + Math.random() * 3000, // m³/h
                co2_concentration_in: 12 + Math.random() * 3, // %
                co2_concentration_out: 1.5 + Math.random() * 0.8, // %
                co2_capture_rate: captureRate,
                solvent_flow_rate: 180 + Math.random() * 40, // t/h
                energy_consumption: 3.2 + Math.random() * 0.8, // GJ/tCO2
                methanol_yield: 18 + Math.random() * 8, // t/h
                
                // 经济数据
                electricity_price: this.getElectricityPrice(timestamp),
                solvent_price: 2800 + Math.random() * 200, // 元/吨
                methanol_market_price: 3200 + Math.random() * 300, // 元/吨
                carbon_tax_mock: 80 + Math.random() * 20, // 元/吨CO2
                operational_cost: 12000 + Math.random() * 2000, // 元/小时
            };
            
            // 计算收益和利润
            data.revenue = data.methanol_yield * data.methanol_market_price;
            data.profit = data.revenue - data.operational_cost;
            
            this.historicalData.push(data);
        }
    }

    // 获取电价（峰谷电价）
    getElectricityPrice(timestamp) {
        const hour = timestamp.getHours();
        if (hour >= 8 && hour < 11 || hour >= 18 && hour < 21) {
            return 0.92; // 峰时电价
        } else if (hour >= 23 || hour < 7) {
            return 0.35; // 谷时电价
        } else {
            return 0.63; // 平时电价
        }
    }

    // 获取实时KPI数据
    getCurrentKPI() {
        const latest = this.getLatestData();
        return {
            totalInvestment: 2.8, // 亿元
            co2Capture: latest.co2_capture_rate * latest.flue_gas_flow_rate * latest.co2_concentration_in / 100 / 1000, // 吨
            methanolProduction: latest.methanol_yield,
            realTimeProfit: latest.profit / 10000, // 万元
        };
    }

    // 获取最新数据
    getLatestData() {
        if (!this.historicalData || this.historicalData.length === 0) {
            this.generateHistoricalData();
        }
        return this.historicalData[this.historicalData.length - 1];
    }

    // 获取性能监控数据（过去24小时）
    getPerformanceData(hours = 24) {
        const data = this.historicalData.slice(-hours);
        return {
            timestamps: data.map(d => d.timestamp),
            captureRate: data.map(d => d.co2_capture_rate),
            energyConsumption: data.map(d => d.energy_consumption),
            solventFlow: data.map(d => d.solvent_flow_rate)
        };
    }

    // 获取经济分析数据
    getEconomicData() {
        const recentData = this.historicalData.slice(-30); // 过去30天
        
        // 成本构成
        const avgData = recentData.reduce((acc, curr) => {
            acc.electricity += curr.electricity_price * curr.energy_consumption * 1000;
            acc.solvent += curr.solvent_price * curr.solvent_flow_rate * 0.1;
            acc.labor += 3000;
            acc.maintenance += 2000;
            acc.other += 1500;
            return acc;
        }, {electricity: 0, solvent: 0, labor: 0, maintenance: 0, other: 0});
        
        Object.keys(avgData).forEach(key => {
            avgData[key] = avgData[key] / recentData.length;
        });

        // 收入-成本-利润趋势（过去30天）
        const dailyData = [];
        for (let i = 0; i < 30; i++) {
            const dayData = recentData.slice(i * 24, (i + 1) * 24);
            if (dayData.length > 0) {
                const daySum = dayData.reduce((sum, curr) => ({
                    revenue: sum.revenue + curr.revenue,
                    cost: sum.cost + curr.operational_cost,
                    profit: sum.profit + curr.profit
                }), {revenue: 0, cost: 0, profit: 0});
                
                dailyData.push({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
                    revenue: daySum.revenue / 10000, // 万元
                    cost: daySum.cost / 10000,
                    profit: daySum.profit / 10000
                });
            }
        }

        return {
            costBreakdown: avgData,
            profitTrend: dailyData
        };
    }

    // 获取地理空间数据
    getGeoData() {
        return {
            // 上海化学工业区坐标
            sourceLocation: {
                lng: 121.783333,
                lat: 30.866667,
                name: '上海化学工业区CO2捕集源',
                captureRate: 89.5,
                dailyCapture: 3620
            },
            
            // 存储和合作伙伴位置
            storageLocations: [
                {
                    lng: 121.9,
                    lat: 30.75,
                    name: '东海CO2封存点A',
                    capacity: 100000,
                    currentStorage: 45600
                },
                {
                    lng: 121.45,
                    lat: 31.15,
                    name: '产品运输中心',
                    type: 'transport',
                    dailyThroughput: 580
                },
                {
                    lng: 121.65,
                    lat: 30.95,
                    name: '合作化工厂B',
                    type: 'partner',
                    monthlyDemand: 15600
                }
            ],
            
            // 运输路线
            transportRoutes: [
                {
                    from: [121.783333, 30.866667],
                    to: [121.45, 31.15],
                    type: 'methanol',
                    distance: 42.5,
                    efficiency: 95.2
                },
                {
                    from: [121.783333, 30.866667],
                    to: [121.9, 30.75],
                    type: 'co2_storage',
                    distance: 18.3,
                    efficiency: 98.1
                }
            ]
        };
    }

    // 获取AI预测数据
    getPredictionData() {
        const historical = this.getPerformanceData(168); // 过去7天
        const future = [];
        
        // 简单预测算法（实际应用中会用更复杂的ML模型）
        const lastValue = historical.captureRate[historical.captureRate.length - 1];
        const trend = this.calculateTrend(historical.captureRate.slice(-24));
        
        for (let i = 1; i <= 24; i++) {
            const prediction = lastValue + trend * i + (Math.random() - 0.5) * 2;
            const timestamp = new Date(Date.now() + i * 60 * 60 * 1000);
            
            future.push({
                timestamp,
                predicted: Math.max(75, Math.min(98, prediction)),
                confidence: Math.max(0.7, 0.95 - i * 0.01)
            });
        }
        
        return {
            historical: {
                timestamps: historical.timestamps,
                actual: historical.captureRate
            },
            prediction: future,
            accuracy: 0.942,
            model: 'ARIMA'
        };
    }

    // 计算趋势
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        const n = data.length;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumX2 += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    // 生成实时更新数据
    generateRealTimeUpdate() {
        const latest = this.getLatestData();
        const newData = {
            timestamp: new Date(),
            flue_gas_flow_rate: latest.flue_gas_flow_rate + (Math.random() - 0.5) * 500,
            co2_concentration_in: Math.max(10, Math.min(18, latest.co2_concentration_in + (Math.random() - 0.5) * 0.5)),
            co2_concentration_out: Math.max(0.8, Math.min(3, latest.co2_concentration_out + (Math.random() - 0.5) * 0.2)),
            co2_capture_rate: Math.max(75, Math.min(98, latest.co2_capture_rate + (Math.random() - 0.5) * 2)),
            solvent_flow_rate: Math.max(150, Math.min(250, latest.solvent_flow_rate + (Math.random() - 0.5) * 10)),
            energy_consumption: Math.max(2.5, Math.min(5, latest.energy_consumption + (Math.random() - 0.5) * 0.3)),
            methanol_yield: Math.max(15, Math.min(30, latest.methanol_yield + (Math.random() - 0.5) * 2)),
            electricity_price: this.getElectricityPrice(new Date()),
            solvent_price: latest.solvent_price + (Math.random() - 0.5) * 50,
            methanol_market_price: latest.methanol_market_price + (Math.random() - 0.5) * 100,
            carbon_tax_mock: latest.carbon_tax_mock + (Math.random() - 0.5) * 5,
            operational_cost: latest.operational_cost + (Math.random() - 0.5) * 1000
        };
        
        newData.revenue = newData.methanol_yield * newData.methanol_market_price;
        newData.profit = newData.revenue - newData.operational_cost;
        
        // 添加到历史数据
        this.historicalData.push(newData);
        
        // 保持数据量在合理范围内
        if (this.historicalData.length > 1000) {
            this.historicalData.shift();
        }
        
        return newData;
    }
}

// 全局实例
const mockData = new MockDataGenerator();

// 导出供其他模块使用
window.MockData = mockData;