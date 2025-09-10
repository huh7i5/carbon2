// 数据服务管理模块
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DataService {
    constructor() {
        this.dataPath = path.join(__dirname, '../../../resources/data');
        this.pythonPath = path.join(__dirname, '../../python');
        this.isInitialized = false;
        
        // 数据缓存
        this.cache = {
            realTimeData: null,
            historicalData: null,
            geoData: null,
            lastUpdate: null
        };
        
        // 缓存过期时间(毫秒)
        this.cacheExpiry = {
            realTime: 30000,  // 30秒
            historical: 300000, // 5分钟
            geo: 3600000      // 1小时
        };
    }

    // 初始化数据服务
    async initialize() {
        try {
            console.log('初始化数据服务...');
            
            // 确保数据目录存在
            await this.ensureDirectories();
            
            // 初始化Python数据生成模块
            await this.initializePythonModules();
            
            // 生成初始数据
            await this.generateInitialData();
            
            this.isInitialized = true;
            console.log('数据服务初始化完成');
            
        } catch (error) {
            console.error('数据服务初始化失败:', error);
            throw error;
        }
    }

    // 确保数据目录存在
    async ensureDirectories() {
        const directories = [
            this.dataPath,
            path.join(this.dataPath, 'realtime'),
            path.join(this.dataPath, 'historical'),
            path.join(this.dataPath, 'predictions'),
            path.join(this.dataPath, 'analysis')
        ];

        for (const dir of directories) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
                console.log(`创建目录: ${dir}`);
            }
        }
    }

    // 初始化Python模块
    async initializePythonModules() {
        try {
            // 检查Python是否可用 (优先python3，fallback到python)
            let pythonCmd = 'python3';
            try {
                await execAsync('python3 --version');
                console.log('Python3 环境检查通过');
            } catch (e1) {
                try {
                    await execAsync('python --version');
                    pythonCmd = 'python';
                    console.log('Python 环境检查通过');
                } catch (e2) {
                    throw new Error('Python环境不可用');
                }
            }
            
            // 保存Python命令供后续使用
            this.pythonCmd = pythonCmd;
            
            // 生成基础数据
            const generateScript = path.join(this.pythonPath, 'data_generation/generate_base_data.py');
            
            // 如果Python脚本不存在，创建一个简单的版本
            await this.createBasePythonScript(generateScript);
            
        } catch (error) {
            console.warn('Python环境初始化警告:', error.message);
            console.log('将使用内置模拟数据生成器');
            this.pythonCmd = null;
        }
    }

    // 创建基础Python脚本
    async createBasePythonScript(scriptPath) {
        const scriptContent = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
沪碳智脑基础数据生成脚本
"""
import json
import os
import sys
from datetime import datetime, timedelta
import random
import math

def generate_ccu_data(hours=720):
    """生成CCU运行数据"""
    data = []
    base_time = datetime.now() - timedelta(hours=hours)
    
    for i in range(hours):
        timestamp = base_time + timedelta(hours=i)
        
        # 基础参数
        base_capture = 85 + random.random() * 10  # 85-95%
        capture_rate = max(75, min(98, base_capture + math.sin(i / 24) * 3))
        
        record = {
            "timestamp": timestamp.isoformat(),
            "flue_gas_flow_rate": 15000 + random.random() * 3000,
            "co2_concentration_in": 12 + random.random() * 3,
            "co2_concentration_out": 1.5 + random.random() * 0.8,
            "co2_capture_rate": capture_rate,
            "solvent_flow_rate": 180 + random.random() * 40,
            "energy_consumption": 3.2 + random.random() * 0.8,
            "methanol_yield": 18 + random.random() * 8,
            "electricity_price": get_electricity_price(timestamp.hour),
            "solvent_price": 2800 + random.random() * 200,
            "methanol_market_price": 3200 + random.random() * 300,
            "operational_cost": 12000 + random.random() * 2000
        }
        
        # 计算收益
        record["revenue"] = record["methanol_yield"] * record["methanol_market_price"]
        record["profit"] = record["revenue"] - record["operational_cost"]
        
        data.append(record)
    
    return data

def get_electricity_price(hour):
    """获取分时电价"""
    if 8 <= hour < 11 or 18 <= hour < 21:
        return 0.92  # 峰时
    elif hour >= 23 or hour < 7:
        return 0.35  # 谷时
    else:
        return 0.63  # 平时

def main():
    try:
        # 生成历史数据
        historical_data = generate_ccu_data(720)
        
        # 保存数据
        output_dir = sys.argv[1] if len(sys.argv) > 1 else './data'
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, 'historical_data.json'), 'w', encoding='utf-8') as f:
            json.dump(historical_data, f, ensure_ascii=False, indent=2)
        
        # 生成最新数据作为实时数据
        realtime_data = historical_data[-1]
        with open(os.path.join(output_dir, 'realtime_data.json'), 'w', encoding='utf-8') as f:
            json.dump(realtime_data, f, ensure_ascii=False, indent=2)
        
        print(f"数据生成完成，共生成{len(historical_data)}条记录")
        
    except Exception as e:
        print(f"数据生成失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

        const scriptDir = path.dirname(scriptPath);
        await fs.mkdir(scriptDir, { recursive: true });
        await fs.writeFile(scriptPath, scriptContent);
        await fs.chmod(scriptPath, '755');
        console.log(`创建Python数据生成脚本: ${scriptPath}`);
    }

    // 生成初始数据
    async generateInitialData() {
        try {
            const dataDir = path.join(this.dataPath, 'historical');
            
            // 尝试使用Python生成数据
            try {
                const scriptPath = path.join(this.pythonPath, 'data_generation/generate_base_data.py');
                await execAsync(`${this.pythonCmd} "${scriptPath}" "${dataDir}"`);
                console.log('使用Python生成初始数据成功');
                return;
            } catch (pythonError) {
                console.warn('Python数据生成失败，使用内置生成器:', pythonError.message);
            }
            
            // 回退到JavaScript数据生成
            await this.generateDataWithJS();
            console.log('使用内置JavaScript生成器完成数据生成');
            
        } catch (error) {
            console.error('数据生成失败:', error);
            throw error;
        }
    }

    // JavaScript数据生成器
    async generateDataWithJS() {
        const historicalData = [];
        const now = new Date();
        
        // 生成过去30天的数据
        for (let i = 720; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
            
            const baseCapture = 85 + Math.random() * 10;
            const captureRate = Math.max(75, Math.min(98, baseCapture + Math.sin(i / 24) * 3));
            
            const record = {
                timestamp: timestamp.toISOString(),
                flue_gas_flow_rate: 15000 + Math.random() * 3000,
                co2_concentration_in: 12 + Math.random() * 3,
                co2_concentration_out: 1.5 + Math.random() * 0.8,
                co2_capture_rate: captureRate,
                solvent_flow_rate: 180 + Math.random() * 40,
                energy_consumption: 3.2 + Math.random() * 0.8,
                methanol_yield: 18 + Math.random() * 8,
                electricity_price: this.getElectricityPrice(timestamp.getHours()),
                solvent_price: 2800 + Math.random() * 200,
                methanol_market_price: 3200 + Math.random() * 300,
                operational_cost: 12000 + Math.random() * 2000
            };
            
            record.revenue = record.methanol_yield * record.methanol_market_price;
            record.profit = record.revenue - record.operational_cost;
            
            historicalData.push(record);
        }
        
        // 保存历史数据
        const historicalPath = path.join(this.dataPath, 'historical', 'data.json');
        await fs.writeFile(historicalPath, JSON.stringify(historicalData, null, 2));
        
        // 保存实时数据
        const realtimePath = path.join(this.dataPath, 'realtime', 'data.json');
        await fs.writeFile(realtimePath, JSON.stringify(historicalData[historicalData.length - 1], null, 2));
        
        // 生成地理数据
        await this.generateGeoData();
    }

    // 生成地理数据
    async generateGeoData() {
        const geoData = {
            sourceLocation: {
                lng: 121.783333,
                lat: 30.866667,
                name: "上海化工园区CO2捕集源",
                type: "source",
                captureRate: 89.5,
                dailyCapture: 3620,
                description: "基于化学吸收法的乙烯裂解装置CO2捕集系统，采用MEA溶剂技术"
            },
            storageLocations: [
                {
                    lng: 121.9,
                    lat: 30.75,
                    name: "东海CO2封存点A",
                    type: "storage",
                    capacity: 100000,
                    currentStorage: 45600,
                    description: "CO2地质封存设施，采用深层盐水层封存技术"
                },
                {
                    lng: 121.45,
                    lat: 31.15,
                    name: "产品运输中心",
                    type: "transport",
                    dailyThroughput: 580,
                    description: "甲醇产品物流配送中心，负责产品外运"
                },
                {
                    lng: 121.65,
                    lat: 30.95,
                    name: "合作化工厂B",
                    type: "partner",
                    monthlyDemand: 15600,
                    description: "CO2利用合作企业，进行化工产品生产"
                }
            ],
            transportRoutes: [
                {
                    from: [121.783333, 30.866667],
                    to: [121.45, 31.15],
                    type: "methanol",
                    distance: 42.5,
                    efficiency: 95.2
                },
                {
                    from: [121.783333, 30.866667],
                    to: [121.9, 30.75],
                    type: "co2_storage",
                    distance: 18.3,
                    efficiency: 98.1
                }
            ]
        };
        
        const geoPath = path.join(this.dataPath, 'geo_data.json');
        await fs.writeFile(geoPath, JSON.stringify(geoData, null, 2));
    }

    // 获取分时电价
    getElectricityPrice(hour) {
        if ((hour >= 8 && hour < 11) || (hour >= 18 && hour < 21)) {
            return 0.92; // 峰时电价
        } else if (hour >= 23 || hour < 7) {
            return 0.35; // 谷时电价
        } else {
            return 0.63; // 平时电价
        }
    }

    // 获取实时数据
    async getRealTimeData() {
        const cacheKey = 'realTimeData';
        
        // 检查缓存
        if (this.isCacheValid(cacheKey, this.cacheExpiry.realTime)) {
            return this.cache[cacheKey];
        }
        
        try {
            const dataPath = path.join(this.dataPath, 'realtime', 'data.json');
            const data = await fs.readFile(dataPath, 'utf8');
            const realtimeData = JSON.parse(data);
            
            // 更新缓存
            this.cache[cacheKey] = realtimeData;
            this.cache.lastUpdate = Date.now();
            
            return realtimeData;
            
        } catch (error) {
            console.error('读取实时数据失败:', error);
            // 返回模拟数据
            return this.generateMockRealTimeData();
        }
    }

    // 获取历史数据
    async getHistoricalData(timeRange = '24h') {
        const cacheKey = `historicalData_${timeRange}`;
        
        if (this.isCacheValid(cacheKey, this.cacheExpiry.historical)) {
            return this.cache[cacheKey];
        }
        
        try {
            const dataPath = path.join(this.dataPath, 'historical', 'data.json');
            const data = await fs.readFile(dataPath, 'utf8');
            let historicalData = JSON.parse(data);
            
            // 根据时间范围过滤数据
            const hours = this.parseTimeRange(timeRange);
            const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
            
            historicalData = historicalData.filter(record => 
                new Date(record.timestamp) >= cutoff
            );
            
            this.cache[cacheKey] = historicalData;
            return historicalData;
            
        } catch (error) {
            console.error('读取历史数据失败:', error);
            return [];
        }
    }

    // 获取地理数据
    async getGeoData() {
        const cacheKey = 'geoData';
        
        if (this.isCacheValid(cacheKey, this.cacheExpiry.geo)) {
            return this.cache[cacheKey];
        }
        
        try {
            const geoPath = path.join(this.dataPath, 'geo_data.json');
            const data = await fs.readFile(geoPath, 'utf8');
            const geoData = JSON.parse(data);
            
            this.cache[cacheKey] = geoData;
            return geoData;
            
        } catch (error) {
            console.error('读取地理数据失败:', error);
            return null;
        }
    }

    // 生成新的实时数据
    async generateNewRealTimeData() {
        try {
            const latestData = await this.getRealTimeData();
            
            // 基于最新数据生成新的数据点
            const newData = {
                timestamp: new Date().toISOString(),
                flue_gas_flow_rate: this.fluctuate(latestData.flue_gas_flow_rate, 0.05),
                co2_concentration_in: this.fluctuate(latestData.co2_concentration_in, 0.02),
                co2_concentration_out: this.fluctuate(latestData.co2_concentration_out, 0.1),
                co2_capture_rate: this.fluctuate(latestData.co2_capture_rate, 0.02),
                solvent_flow_rate: this.fluctuate(latestData.solvent_flow_rate, 0.05),
                energy_consumption: this.fluctuate(latestData.energy_consumption, 0.1),
                methanol_yield: this.fluctuate(latestData.methanol_yield, 0.08),
                electricity_price: this.getElectricityPrice(new Date().getHours()),
                solvent_price: this.fluctuate(latestData.solvent_price, 0.01),
                methanol_market_price: this.fluctuate(latestData.methanol_market_price, 0.03),
                operational_cost: this.fluctuate(latestData.operational_cost, 0.08)
            };
            
            newData.revenue = newData.methanol_yield * newData.methanol_market_price;
            newData.profit = newData.revenue - newData.operational_cost;
            
            // 保存新数据
            const realtimePath = path.join(this.dataPath, 'realtime', 'data.json');
            await fs.writeFile(realtimePath, JSON.stringify(newData, null, 2));
            
            // 更新缓存
            this.cache.realTimeData = newData;
            this.cache.lastUpdate = Date.now();
            
            return newData;
            
        } catch (error) {
            console.error('生成新实时数据失败:', error);
            return this.generateMockRealTimeData();
        }
    }

    // 数据波动模拟
    fluctuate(value, range) {
        const variation = value * range * (Math.random() - 0.5) * 2;
        return Math.max(0, value + variation);
    }

    // 生成模拟实时数据
    generateMockRealTimeData() {
        return {
            timestamp: new Date().toISOString(),
            flue_gas_flow_rate: 15000 + Math.random() * 3000,
            co2_concentration_in: 12 + Math.random() * 3,
            co2_concentration_out: 1.5 + Math.random() * 0.8,
            co2_capture_rate: 85 + Math.random() * 10,
            solvent_flow_rate: 180 + Math.random() * 40,
            energy_consumption: 3.2 + Math.random() * 0.8,
            methanol_yield: 18 + Math.random() * 8,
            electricity_price: this.getElectricityPrice(new Date().getHours()),
            solvent_price: 2800 + Math.random() * 200,
            methanol_market_price: 3200 + Math.random() * 300,
            operational_cost: 12000 + Math.random() * 2000
        };
    }

    // 解析时间范围
    parseTimeRange(timeRange) {
        const ranges = {
            '1h': 1,
            '24h': 24,
            '7d': 168,
            '30d': 720
        };
        return ranges[timeRange] || 24;
    }

    // 检查缓存是否有效
    isCacheValid(key, expiry) {
        const cached = this.cache[key];
        const lastUpdate = this.cache.lastUpdate;
        
        return cached && lastUpdate && (Date.now() - lastUpdate) < expiry;
    }
}

module.exports = DataService;