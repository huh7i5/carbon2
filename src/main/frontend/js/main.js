// 主应用程序入口
class CarbonBrainApp {
    constructor() {
        this.updateInterval = null;
        this.isInitialized = false;
    }

    // 初始化应用
    async init() {
        try {
            console.log('初始化沪碳智脑平台...');
            
            // 初始化模拟数据
            window.MockData.init();
            
            // 更新当前时间
            this.updateCurrentTime();
            setInterval(() => this.updateCurrentTime(), 1000);
            
            // 初始化KPI数据
            this.updateKPIData();
            
            // 初始化图表
            await this.initializeCharts();
            
            // 初始化地图
            await this.initializeMap();
            
            // 初始化事件监听
            this.setupEventListeners();
            
            // 启动数据更新
            this.startDataUpdate();
            
            this.isInitialized = true;
            console.log('沪碳智脑平台初始化完成');
            
            // 显示初始化成功通知
            this.showNotification('系统初始化完成', '沪碳智脑平台已成功启动', 'success');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showNotification('初始化错误', '平台启动失败，请刷新页面重试', 'error');
        }
    }

    // 更新当前时间
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    // 更新KPI数据
    updateKPIData() {
        const kpiData = window.MockData.getCurrentKPI();
        
        // 更新各项KPI值
        const elements = {
            totalInvestment: document.getElementById('totalInvestment'),
            co2Capture: document.getElementById('co2Capture'),
            methanolProduction: document.getElementById('methanolProduction'),
            realTimeProfit: document.getElementById('realTimeProfit')
        };
        
        if (elements.totalInvestment) {
            elements.totalInvestment.textContent = `¥ ${kpiData.totalInvestment}亿`;
        }
        
        if (elements.co2Capture) {
            elements.co2Capture.textContent = `${kpiData.co2Capture.toFixed(1)} 吨`;
        }
        
        if (elements.methanolProduction) {
            elements.methanolProduction.textContent = `${kpiData.methanolProduction.toFixed(1)} 吨`;
        }
        
        if (elements.realTimeProfit) {
            elements.realTimeProfit.textContent = `${kpiData.realTimeProfit.toFixed(1)} 万元`;
        }
    }

    // 初始化图表
    async initializeCharts() {
        // 等待ECharts库加载
        if (typeof echarts === 'undefined') {
            console.warn('ECharts未加载，等待加载中...');
            await this.waitForLibrary('echarts');
        }
        
        // 初始化图表管理器
        window.ChartManager.initAllCharts();
        
        console.log('图表初始化完成');
    }

    // 初始化地图
    async initializeMap() {
        try {
            console.log('初始化地图模块...');
            
            // 检查地图管理器是否加载
            if (!window.MapManager) {
                console.warn('地图管理器未加载，将显示占位符');
                this.showMapPlaceholder();
                return;
            }
            
            // 初始化地图实例
            await window.MapManager.init();
            
        } catch (error) {
            console.error('地图初始化失败:', error);
            this.showMapPlaceholder();
        }
    }

    // 显示地图占位符
    showMapPlaceholder() {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    color: #a0a0a0;
                    font-size: 16px;
                ">
                    <i class="fas fa-map" style="font-size: 48px; margin-bottom: 10px; color: #00d4aa;"></i>
                    <div>地图模块</div>
                    <div style="font-size: 12px; margin-top: 5px;">需要配置高德地图API Key</div>
                </div>
            `;
        }
    }

    // 设置事件监听
    setupEventListeners() {
        // KPI刷新按钮
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshKPI();
            });
        }

        // 性能监控时间范围选择
        const timeRange = document.getElementById('timeRange');
        if (timeRange) {
            timeRange.addEventListener('change', (e) => {
                this.updatePerformanceCharts(e.target.value);
            });
        }

        // 经济分析标签切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除所有active类
                tabBtns.forEach(b => b.classList.remove('active'));
                // 添加当前active类
                e.target.classList.add('active');
                
                if (e.target.textContent.includes('成本构成')) {
                    this.showCostBreakdown();
                } else if (e.target.textContent.includes('收益趋势')) {
                    this.showProfitTrend();
                }
            });
        });

        // AI预测运行按钮
        const predictionBtn = document.querySelector('.prediction-controls .btn-primary');
        if (predictionBtn) {
            predictionBtn.addEventListener('click', () => {
                // 预测功能由 PredictionManager 处理
                // this.runPrediction();
            });
        }

        // LLM聊天输入
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        
        if (chatInput && sendButton) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // 地图控制按钮
        const mapControlBtns = document.querySelectorAll('.map-controls .btn-secondary');
        mapControlBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent;
                if (action.includes('CO2源点')) {
                    this.showSources();
                } else if (action.includes('运输路线')) {
                    this.showRoutes();
                } else if (action.includes('封存点')) {
                    this.showStorage();
                }
            });
        });

        // 窗口大小改变事件
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    // 等待库加载
    waitForLibrary(libraryName, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function check() {
                if (window[libraryName]) {
                    resolve(window[libraryName]);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`${libraryName} 加载超时`));
                } else {
                    setTimeout(check, 100);
                }
            }
            
            check();
        });
    }

    // 开始数据更新
    startDataUpdate() {
        // 每30秒更新一次数据
        this.updateInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
        
        console.log('数据更新定时器已启动');
    }

    // 更新实时数据
    updateRealTimeData() {
        try {
            // 生成新的实时数据
            window.MockData.generateRealTimeUpdate();
            
            // 更新KPI
            this.updateKPIData();
            
            // 更新图表
            window.ChartManager.updateCharts();
            
            console.log('实时数据更新完成');
        } catch (error) {
            console.error('数据更新失败:', error);
        }
    }

    // 刷新KPI
    refreshKPI() {
        const refreshBtn = document.querySelector('.refresh-btn i');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                refreshBtn.style.transform = '';
            }, 300);
        }
        
        this.updateKPIData();
        this.showNotification('数据刷新', 'KPI数据已更新', 'success');
    }

    // 更新性能图表
    updatePerformanceCharts(timeRange) {
        let hours = 24;
        if (timeRange === '7d') hours = 168;
        else if (timeRange === '30d') hours = 720;
        
        const performanceData = window.MockData.getPerformanceData(hours);
        
        // 更新图表
        if (window.ChartManager.charts.captureRate) {
            // 这里应该更新具体的图表数据
            console.log('更新性能图表:', timeRange);
        }
    }

    // 显示成本构成
    showCostBreakdown() {
        console.log('显示成本构成分析');
    }

    // 显示收益趋势
    showProfitTrend() {
        console.log('显示收益趋势分析');
    }

    // 运行AI预测 (已移除 - 由 PredictionManager 处理)
    // runPrediction() {
    //     此方法已被 PredictionManager.runPrediction() 替代
    // }

    // 发送聊天消息
    sendMessage() {
        const input = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!input || !chatMessages) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // 添加用户消息
        this.addChatMessage(message, 'user');
        
        // 清空输入框
        input.value = '';
        
        // 模拟AI回复
        setTimeout(() => {
            const aiResponse = this.generateAIResponse(message);
            this.addChatMessage(aiResponse, 'ai');
        }, 1000);
    }

    // 添加聊天消息
    addChatMessage(content, type) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message fade-in`;
        
        const avatarIcon = type === 'user' ? 'fa-user' : 'fa-robot';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 生成AI回复
    generateAIResponse(userMessage) {
        const responses = {
            'kpi': '根据当前KPI数据，项目运行状况良好。CO2捕集量稳定在156.8吨，捕集率达到89.5%，甲醇产量为24.6吨，实时利润为18.9万元。投资回收期预计为6.2年。',
            'performance': '技术性能监控显示：CO2捕集率在85-95%之间波动，属于正常范围。再生能耗平均为3.2 GJ/tCO2，溶剂流量稳定在180-220 t/h之间。建议优化溶剂循环系统以降低能耗。',
            'economic': '经济效益分析：当前运行成本主要由电费（45%）、溶剂成本（25%）和人工成本（20%）构成。建议在低电价时段提高运行负荷，可节省成本约12%。',
            'prediction': 'AI预测模型（ARIMA）显示未来24小时CO2捕集率将保持在87-92%之间，置信度94.2%。预测趋势向上，建议保持当前运行参数。'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('kpi') || lowerMessage.includes('指标') || lowerMessage.includes('投资')) {
            return responses.kpi;
        } else if (lowerMessage.includes('性能') || lowerMessage.includes('捕集') || lowerMessage.includes('能耗')) {
            return responses.performance;
        } else if (lowerMessage.includes('经济') || lowerMessage.includes('成本') || lowerMessage.includes('利润')) {
            return responses.economic;
        } else if (lowerMessage.includes('预测') || lowerMessage.includes('未来') || lowerMessage.includes('趋势')) {
            return responses.prediction;
        } else {
            return '我是沪碳智脑AI助手。您可以询问关于KPI指标、技术性能、经济效益或AI预测等方面的问题。请选择一个具体的图表模块进行深入分析。';
        }
    }

    // 地图功能
    showSources() {
        if (window.MapManager && window.MapManager.isInitialized) {
            window.MapManager.showSources();
            this.showNotification('地图操作', 'CO2源点已高亮显示', 'info');
        } else {
            this.showNotification('地图错误', '地图未正确初始化', 'error');
        }
    }

    showRoutes() {
        if (window.MapManager && window.MapManager.isInitialized) {
            window.MapManager.showRoutes();
            this.showNotification('地图操作', '运输路线已显示', 'info');
        } else {
            this.showNotification('地图错误', '地图未正确初始化', 'error');
        }
    }

    showStorage() {
        if (window.MapManager && window.MapManager.isInitialized) {
            window.MapManager.showStorage();
            this.showNotification('地图操作', '封存点位置已标记', 'info');
        } else {
            this.showNotification('地图错误', '地图未正确初始化', 'error');
        }
    }

    // 处理窗口大小改变
    handleResize() {
        // 重新调整图表大小
        Object.values(window.ChartManager.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    // 显示通知
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 销毁应用
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (window.ChartManager) {
            window.ChartManager.dispose();
        }
        
        console.log('应用已销毁');
    }
}

// 全局应用实例
window.CarbonBrainApp = new CarbonBrainApp();

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.CarbonBrainApp.init();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    window.CarbonBrainApp.destroy();
});