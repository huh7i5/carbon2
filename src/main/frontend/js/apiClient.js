// API客户端 - 处理与后端服务器的通信
class APIClient {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
        this.isBackendAvailable = false;
        this.wsConnection = null;
        this.wsReconnectInterval = null;
        
        // 检查后端可用性
        this.checkBackendAvailability();
    }

    // 检查后端服务器是否可用
    async checkBackendAvailability() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 3000
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isBackendAvailable = true;
                console.log('✅ 后端服务器连接成功:', data.data);
                
                // 初始化WebSocket连接
                this.initWebSocket();
                
                return true;
            }
        } catch (error) {
            console.warn('⚠️ 后端服务器不可用，使用模拟数据模式');
            this.isBackendAvailable = false;
        }
        
        return false;
    }

    // 通用API请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const config = { ...defaultOptions, ...options };
        
        // 如果有请求体且不是FormData，转换为JSON
        if (config.body && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error(`API请求失败 ${endpoint}:`, error);
            throw error;
        }
    }

    // KPI数据API
    async getKPIData() {
        if (!this.isBackendAvailable) {
            return this.getMockKPIData();
        }

        try {
            const response = await this.request('/api/kpi/current');
            return response.success ? response.data : this.getMockKPIData();
        } catch (error) {
            console.warn('获取KPI数据失败，使用模拟数据');
            return this.getMockKPIData();
        }
    }

    async refreshKPIData() {
        if (!this.isBackendAvailable) {
            return this.getMockKPIData();
        }

        try {
            const response = await this.request('/api/kpi/refresh', { method: 'POST' });
            return response.success ? response.data : this.getMockKPIData();
        } catch (error) {
            console.warn('刷新KPI数据失败，使用模拟数据');
            return this.getMockKPIData();
        }
    }

    // 性能数据API
    async getPerformanceData(timeRange = '24h', metrics = ['captureRate', 'energyConsumption', 'solventFlow']) {
        if (!this.isBackendAvailable) {
            return this.getMockPerformanceData(timeRange);
        }

        try {
            const metricsParam = Array.isArray(metrics) ? metrics.join(',') : metrics;
            const response = await this.request(`/api/performance/data?timeRange=${timeRange}&metrics=${metricsParam}`);
            return response.success ? response.data : this.getMockPerformanceData(timeRange);
        } catch (error) {
            console.warn('获取性能数据失败，使用模拟数据');
            return this.getMockPerformanceData(timeRange);
        }
    }

    // 地理数据API
    async getGeoData() {
        if (!this.isBackendAvailable) {
            return window.MockData?.getGeoData() || this.getMockGeoData();
        }

        try {
            const response = await this.request('/api/geo/locations');
            return response.success ? response.data : window.MockData?.getGeoData() || this.getMockGeoData();
        } catch (error) {
            console.warn('获取地理数据失败，使用模拟数据');
            return window.MockData?.getGeoData() || this.getMockGeoData();
        }
    }

    // 经济分析API
    async getEconomicData(timeRange = '30d') {
        if (!this.isBackendAvailable) {
            return this.getMockEconomicData();
        }

        try {
            const response = await this.request(`/api/economic/analysis?timeRange=${timeRange}`);
            return response.success ? response.data : this.getMockEconomicData();
        } catch (error) {
            console.warn('获取经济数据失败，使用模拟数据');
            return this.getMockEconomicData();
        }
    }

    // AI预测API
    async runAIPrediction(model = 'arima', horizon = 24, metrics = ['captureRate']) {
        if (!this.isBackendAvailable) {
            return this.getMockPredictionData();
        }

        try {
            const response = await this.request('/api/ai/predict', {
                method: 'POST',
                body: { model, horizon, metrics }
            });
            return response.success ? response.data : this.getMockPredictionData();
        } catch (error) {
            console.warn('AI预测失败，使用模拟数据');
            return this.getMockPredictionData();
        }
    }

    // LLM分析API
    async getLLMAnalysis(query, context = 'general', data = {}) {
        if (!this.isBackendAvailable) {
            return this.getMockLLMResponse(query, context);
        }

        try {
            const response = await this.request('/api/llm/analyze', {
                method: 'POST',
                body: { query, context, data }
            });
            return response.success ? response.data : this.getMockLLMResponse(query, context);
        } catch (error) {
            console.warn('LLM分析失败，使用模拟回复');
            return this.getMockLLMResponse(query, context);
        }
    }

    async sendChatMessage(message, sessionId = null, context = 'general') {
        if (!this.isBackendAvailable) {
            return this.getMockChatResponse(message);
        }

        try {
            const response = await this.request('/api/llm/chat', {
                method: 'POST',
                body: { message, sessionId, context }
            });
            return response.success ? response.data : this.getMockChatResponse(message);
        } catch (error) {
            console.warn('聊天失败，使用模拟回复');
            return this.getMockChatResponse(message);
        }
    }

    // WebSocket连接管理
    initWebSocket() {
        if (!this.isBackendAvailable) return;

        try {
            const wsProtocol = 'ws:';
            const wsURL = `${wsProtocol}//localhost:3000/ws`;
            
            this.wsConnection = new WebSocket(wsURL);
            
            this.wsConnection.onopen = () => {
                console.log('🔗 WebSocket连接已建立');
                
                // 订阅实时数据频道
                this.wsConnection.send(JSON.stringify({
                    type: 'subscribe',
                    payload: {
                        channels: ['realtime', 'kpi', 'performance', 'system']
                    }
                }));
                
                // 清除重连定时器
                if (this.wsReconnectInterval) {
                    clearInterval(this.wsReconnectInterval);
                    this.wsReconnectInterval = null;
                }
            };
            
            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('WebSocket消息解析错误:', error);
                }
            };
            
            this.wsConnection.onclose = () => {
                console.warn('🔌 WebSocket连接已断开');
                this.scheduleReconnect();
            };
            
            this.wsConnection.onerror = (error) => {
                console.error('❌ WebSocket连接错误:', error);
            };
            
        } catch (error) {
            console.error('WebSocket初始化失败:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'realtime_update':
                // 广播实时数据更新事件
                window.dispatchEvent(new CustomEvent('realtimeDataUpdate', {
                    detail: data.data
                }));
                break;
                
            case 'kpi_update':
                window.dispatchEvent(new CustomEvent('kpiUpdate', {
                    detail: data.data
                }));
                break;
                
            case 'notification':
                if (window.CarbonBrainApp) {
                    window.CarbonBrainApp.showNotification(
                        '系统通知', 
                        data.data.message, 
                        data.data.type
                    );
                }
                break;
                
            case 'heartbeat':
                // 心跳响应
                break;
                
            default:
                console.log('收到WebSocket消息:', data.type);
        }
    }

    scheduleReconnect() {
        if (this.wsReconnectInterval) return;
        
        this.wsReconnectInterval = setInterval(() => {
            console.log('🔄 尝试重新连接WebSocket...');
            this.initWebSocket();
        }, 5000); // 每5秒尝试重连
    }

    // 模拟数据方法（后备方案）
    getMockKPIData() {
        const latest = window.MockData?.getLatestData();
        if (!latest) return {};
        
        const co2CaptureAmount = (latest.flue_gas_flow_rate * 
                                 latest.co2_concentration_in * 
                                 latest.co2_capture_rate / 100) / 1000;
        
        return {
            totalInvestment: { value: 2.8, unit: '亿元', change: '+2.5%' },
            co2Capture: { value: parseFloat(co2CaptureAmount.toFixed(1)), unit: '吨/小时', change: '+12.3%' },
            methanolProduction: { value: parseFloat(latest.methanol_yield.toFixed(1)), unit: '吨/小时', change: '+8.7%' },
            realTimeProfit: { value: parseFloat((latest.profit / 10000).toFixed(1)), unit: '万元/小时', change: '+15.2%' }
        };
    }

    getMockPerformanceData(timeRange) {
        return window.MockData?.getPerformanceData(this.parseTimeRange(timeRange)) || {};
    }

    getMockGeoData() {
        return {
            sourceLocation: {
                lng: 121.783333, lat: 30.866667,
                name: "上海化工园区CO2捕集源", type: "source"
            },
            storageLocations: [],
            transportRoutes: []
        };
    }

    getMockEconomicData() {
        return window.MockData?.getEconomicData() || {};
    }

    getMockPredictionData() {
        return window.MockData?.getPredictionData() || {};
    }

    getMockLLMResponse(query, context) {
        return {
            response: "我是沪碳智脑AI助手，目前运行在离线模式。请启动后端服务器以获得完整的智能分析功能。",
            confidence: 0.8,
            suggestions: ["启动后端服务器", "检查网络连接", "查看开发者工具"]
        };
    }

    getMockChatResponse(message) {
        return {
            response: "系统当前运行在离线模式，无法提供智能对话服务。请启动后端服务器以获得完整功能。",
            confidence: 0.7,
            suggestions: []
        };
    }

    parseTimeRange(timeRange) {
        const ranges = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
        return ranges[timeRange] || 24;
    }

    // 关闭连接
    disconnect() {
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
        
        if (this.wsReconnectInterval) {
            clearInterval(this.wsReconnectInterval);
            this.wsReconnectInterval = null;
        }
    }
}

// 创建全局API客户端实例
window.APIClient = new APIClient();