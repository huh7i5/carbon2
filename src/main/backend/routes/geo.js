// 地理空间数据路由
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
 * @route GET /api/geo/locations
 * @desc 获取地理位置数据
 * @access Public
 */
router.get('/locations', async (req, res) => {
    try {
        console.log('获取地理位置数据请求');
        
        const geoData = dataService ? 
            await dataService.getGeoData() : 
            generateMockGeoData();
        
        res.json({
            success: true,
            data: geoData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取地理数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GEO_FETCH_ERROR',
                message: '获取地理数据失败',
                details: error.message
            }
        });
    }
});

/**
 * @route GET /api/geo/location/:id
 * @desc 获取特定位置的详细信息
 * @access Public
 */
router.get('/location/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const geoData = dataService ? 
            await dataService.getGeoData() : 
            generateMockGeoData();
        
        let location = null;
        
        // 查找指定位置
        if (geoData.sourceLocation && geoData.sourceLocation.name === id) {
            location = geoData.sourceLocation;
        } else {
            location = geoData.storageLocations?.find(loc => 
                loc.name === id || loc.name.includes(id)
            );
        }
        
        if (!location) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'LOCATION_NOT_FOUND',
                    message: '指定的位置不存在'
                }
            });
        }
        
        // 添加实时数据
        const enrichedLocation = await enrichLocationWithRealTimeData(location);
        
        res.json({
            success: true,
            data: enrichedLocation,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取位置详细信息失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOCATION_DETAIL_ERROR',
                message: '获取位置详细信息失败',
                details: error.message
            }
        });
    }
});

/**
 * @route GET /api/geo/routes
 * @desc 获取运输路线数据
 * @access Public
 */
router.get('/routes', async (req, res) => {
    try {
        const { type } = req.query; // 'methanol' | 'co2_storage' | 'all'
        
        const geoData = dataService ? 
            await dataService.getGeoData() : 
            generateMockGeoData();
        
        let routes = geoData.transportRoutes || [];
        
        // 按类型过滤
        if (type && type !== 'all') {
            routes = routes.filter(route => route.type === type);
        }
        
        // 添加实时路线状态
        const enrichedRoutes = routes.map(route => ({
            ...route,
            status: generateRouteStatus(),
            lastUpdate: new Date().toISOString()
        }));
        
        res.json({
            success: true,
            data: {
                routes: enrichedRoutes,
                summary: {
                    total: enrichedRoutes.length,
                    active: enrichedRoutes.filter(r => r.status.active).length,
                    avgEfficiency: calculateAvgEfficiency(enrichedRoutes)
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取路线数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ROUTES_FETCH_ERROR',
                message: '获取路线数据失败',
                details: error.message
            }
        });
    }
});

/**
 * @route GET /api/geo/analytics
 * @desc 获取地理空间分析数据
 * @access Public
 */
router.get('/analytics', async (req, res) => {
    try {
        const { timeRange = '24h' } = req.query;
        
        const geoData = dataService ? 
            await dataService.getGeoData() : 
            generateMockGeoData();
        
        const analytics = generateGeoAnalytics(geoData, timeRange);
        
        res.json({
            success: true,
            data: analytics,
            timeRange,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('获取地理分析数据失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GEO_ANALYTICS_ERROR',
                message: '获取地理分析数据失败',
                details: error.message
            }
        });
    }
});

// 为位置添加实时数据
async function enrichLocationWithRealTimeData(location) {
    const realTimeData = dataService ? 
        await dataService.getRealTimeData() : 
        generateMockRealTimeData();
    
    const enriched = { ...location };
    
    if (location.type === 'source') {
        enriched.realTimeData = {
            captureRate: realTimeData.co2_capture_rate,
            flueGasFlow: realTimeData.flue_gas_flow_rate,
            co2ConcentrationIn: realTimeData.co2_concentration_in,
            co2ConcentrationOut: realTimeData.co2_concentration_out,
            energyConsumption: realTimeData.energy_consumption,
            operatingStatus: 'normal',
            lastMaintenance: '2024-12-15',
            nextMaintenance: '2025-01-15'
        };
    } else if (location.type === 'storage') {
        enriched.realTimeData = {
            currentStorage: location.currentStorage || Math.floor(Math.random() * 50000),
            capacity: location.capacity,
            utilizationRate: ((location.currentStorage || 0) / location.capacity * 100).toFixed(1),
            injectionRate: Math.floor(Math.random() * 100),
            pressure: (150 + Math.random() * 50).toFixed(1),
            temperature: (45 + Math.random() * 10).toFixed(1),
            operatingStatus: 'normal'
        };
    } else if (location.type === 'transport') {
        enriched.realTimeData = {
            dailyThroughput: location.dailyThroughput || Math.floor(Math.random() * 1000),
            currentLoad: Math.floor(Math.random() * 100),
            vehiclesActive: Math.floor(Math.random() * 20),
            avgDeliveryTime: (2.5 + Math.random() * 2).toFixed(1),
            operatingStatus: 'normal'
        };
    } else if (location.type === 'partner') {
        enriched.realTimeData = {
            monthlyDemand: location.monthlyDemand || Math.floor(Math.random() * 20000),
            currentConsumption: Math.floor(Math.random() * 50),
            productionRate: (85 + Math.random() * 15).toFixed(1),
            qualityIndex: (95 + Math.random() * 5).toFixed(1),
            operatingStatus: 'normal'
        };
    }
    
    return enriched;
}

// 生成路线状态
function generateRouteStatus() {
    return {
        active: Math.random() > 0.1, // 90%概率活跃
        traffic: Math.random() > 0.7 ? 'heavy' : Math.random() > 0.4 ? 'moderate' : 'light',
        weather: Math.random() > 0.8 ? 'poor' : 'good',
        avgSpeed: (60 + Math.random() * 20).toFixed(1),
        estimatedDelay: Math.random() > 0.8 ? Math.floor(Math.random() * 30) : 0
    };
}

// 计算平均效率
function calculateAvgEfficiency(routes) {
    if (routes.length === 0) return 0;
    const sum = routes.reduce((acc, route) => acc + route.efficiency, 0);
    return (sum / routes.length).toFixed(1);
}

// 生成地理分析数据
function generateGeoAnalytics(geoData, timeRange) {
    return {
        coverage: {
            totalLocations: (geoData.storageLocations?.length || 0) + 1, // +1 for source
            activeLocations: Math.floor(Math.random() * ((geoData.storageLocations?.length || 0) + 1)) + 1,
            coverageArea: 245.6, // km²
            networkDensity: 0.85
        },
        transportation: {
            totalRoutes: geoData.transportRoutes?.length || 0,
            activeRoutes: Math.floor(Math.random() * (geoData.transportRoutes?.length || 0)) + 1,
            avgDistance: 32.4, // km
            totalDistance: geoData.transportRoutes?.reduce((acc, route) => acc + route.distance, 0) || 0,
            carbonFootprint: 1250 // kg CO2
        },
        efficiency: {
            storageUtilization: (67.5 + Math.random() * 20).toFixed(1) + '%',
            transportEfficiency: (92.3 + Math.random() * 5).toFixed(1) + '%',
            networkOptimization: (88.7 + Math.random() * 10).toFixed(1) + '%',
            costEffectiveness: 'good'
        },
        trends: {
            capacityGrowth: '+12.5%',
            efficiencyImprovement: '+8.3%',
            costReduction: '-5.2%',
            networkExpansion: '+15.7%'
        }
    };
}

// 生成模拟地理数据
function generateMockGeoData() {
    return {
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
}

// 生成模拟实时数据
function generateMockRealTimeData() {
    return {
        co2_capture_rate: 85 + Math.random() * 10,
        flue_gas_flow_rate: 15000 + Math.random() * 3000,
        co2_concentration_in: 12 + Math.random() * 3,
        co2_concentration_out: 1.5 + Math.random() * 0.8,
        energy_consumption: 3.2 + Math.random() * 0.8
    };
}

module.exports = router;