// AI预测模块
class PredictionManager {
    constructor() {
        this.currentModel = 'ensemble';
        this.predictionData = null;
        this.isRunning = false;
        this.apiClient = window.ApiClient || null;
    }

    // 运行预测
    async runPrediction(model = null) {
        if (this.isRunning) {
            console.warn('预测正在运行中...');
            return;
        }

        this.isRunning = true;
        const modelType = model || this.currentModel;
        console.log(`开始运行${modelType.toUpperCase()}预测...`);

        try {
            // 显示加载状态
            this.showLoadingState(true);
            console.log('加载状态已设置');

            // 尝试调用真实AI预测 API
            console.log('调用AI预测 API...');
            try {
                this.predictionData = await this.callPredictionAPI(modelType);
                
                // 如果API返回了数据，使用真实数据
                if (this.predictionData) {
                    console.log('使用真实AI预测数据');
                } else {
                    throw new Error('API返回空数据');
                }
            } catch (apiError) {
                console.warn('API调用失败，使用模拟预测数据:', apiError.message);
                this.predictionData = this.generateFallbackPrediction(modelType);
                
                // 显示备用数据提醒
                if (window.CarbonBrainApp) {
                    window.CarbonBrainApp.showNotification(
                        'API连接失败',
                        '使用模拟预测数据，功能演示正常',
                        'warning'
                    );
                }
            }
            
            console.log('预测数据获取成功:', this.predictionData);

            // 更新预测图表
            this.updatePredictionChart();

            // 更新预测指标
            this.updatePredictionMetrics();

            // 显示成功状态
            this.showPredictionComplete();

            console.log(`${modelType.toUpperCase()}预测完成`);

        } catch (error) {
            console.error('预测失败:', error);
            this.showPredictionError(error.message);
        } finally {
            console.log('清理运行状态...');
            this.isRunning = false;
            this.showLoadingState(false);
            console.log('加载状态已重置');
        }
    }

    // 显示加载状态
    showLoadingState(isLoading) {
        // 多种选择器尝试
        const btnSelectors = [
            '.prediction-controls .btn-primary',
            '.predict-btn',
            '[onclick*="runPrediction"]',
            'button[class*="predict"]'
        ];
        
        let btn = null;
        for (const selector of btnSelectors) {
            btn = document.querySelector(selector);
            if (btn) break;
        }
        
        if (!btn) {
            console.warn('找不到预测按钮，尝试的选择器:', btnSelectors);
            return;
        }
        
        console.log(`设置按钮状态: ${isLoading ? '加载中' : '正常'}`);

        if (isLoading) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 预测中...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.classList.add('loading');
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> 运行预测';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.classList.remove('loading');
        }
    }

    // 更新预测图表
    updatePredictionChart() {
        if (!this.predictionData) return;

        // 使用ChartManager更新预测图表
        if (window.ChartManager) {
            window.ChartManager.initPredictionChart();
        }
    }

    // 调用预测 API
    async callPredictionAPI(model) {
        console.log(`调用预测 API - 模型: ${model}`);
        
        if (!this.apiClient) {
            console.warn('ApiClient 不可用，使用原生 fetch');
            return await this.callPredictionWithFetch(model);
        }
        
        try {
            console.log('使用 ApiClient 调用预测 API...');
            const response = await this.apiClient.post('/ai/predict', {
                model: model,
                horizon: 24,
                metrics: ['co2_capture_rate', 'energy_consumption', 'methanol_yield']
            });
            
            console.log('API 响应:', response);
            
            if (response.success) {
                console.log('AI预测成功:', response.data);
                return this.transformAPIResponse(response.data);
            } else {
                console.error('AI预测 API 错误:', response.error);
                return null;
            }
            
        } catch (error) {
            console.error('调用预测 API 失败:', error);
            // 尝试使用 fetch 备用方案
            console.log('尝试使用 fetch 备用方案...');
            return await this.callPredictionWithFetch(model);
        }
    }
    
    // 使用原生 fetch 调用预测 API
    async callPredictionWithFetch(model) {
        try {
            console.log(`使用 fetch 调用预测 API - 模型: ${model}`);
            
            const requestBody = {
                model: model,
                horizon: 24,
                metrics: ['co2_capture_rate', 'energy_consumption', 'methanol_yield']
            };
            
            console.log('请求数据:', requestBody);
            
            const response = await fetch('/api/ai/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Fetch API 响应:', data);
            
            if (data.success) {
                console.log('AI预测成功 (原生 fetch):', data.data);
                return this.transformAPIResponse(data.data);
            } else {
                console.error('AI预测 API 错误:', data.error);
                if (data.fallback) {
                    console.log('使用备用数据');
                    return this.transformAPIResponse(data.data);
                }
                return null;
            }
            
        } catch (error) {
            console.error('调用预测 API 失败 (原生 fetch):', error);
            throw error; // 向上抛出错误以触发 finally 块
        }
    }
    
    // 转换 API 响应为前端格式
    transformAPIResponse(apiData) {
        return {
            model: apiData.model,
            accuracy: apiData.accuracy || 0.9,
            horizon: apiData.horizon || 24,
            prediction: apiData.predictions || [],
            metadata: apiData.metadata || {},
            summary: apiData.summary || {}
        };
    }
    
    // 生成备用预测数据（当API失败时使用）
    generateFallbackPrediction(modelType) {
        const baseTime = new Date();
        const predictions = [];
        
        // 根据模型类型设置不同的准确率
        const modelAccuracy = {
            'arima': 0.85,
            'lgbm': 0.88,
            'ensemble': 0.92
        };
        
        const accuracy = modelAccuracy[modelType] || 0.87;
        
        // 生成24小时预测数据
        for (let i = 1; i <= 24; i++) {
            const timestamp = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
            const confidence = Math.max(0.6, 0.95 - (i * 0.015));
            
            // 生成具有轻微趋势的预测值
            const baseCaptureRate = 87.5 + Math.sin(i / 4) * 3; // 添加周期性变化
            const noise = (Math.random() - 0.5) * 2; // 随机噪声
            
            predictions.push({
                timestamp: timestamp.toISOString(),
                captureRate: Math.max(75, Math.min(95, baseCaptureRate + noise)),
                energyConsumption: 3.2 + (Math.random() - 0.5) * 0.6,
                methanolYield: 22 + (Math.random() - 0.5) * 4,
                confidence: parseFloat(confidence.toFixed(3))
            });
        }
        
        return {
            model: modelType,
            accuracy: accuracy,
            horizon: 24,
            prediction: predictions,
            metadata: {
                source: 'fallback',
                note: '模拟数据 - API不可用时的备用方案',
                timestamp: baseTime.toISOString()
            },
            summary: {
                prediction_quality: accuracy > 0.9 ? '高' : accuracy > 0.8 ? '中' : '低'
            }
        };
    }

    // 更新预测指标
    updatePredictionMetrics() {
        if (!this.predictionData) return;

        // 处理不同的数据格式
        let accuracy, nextHourPrediction;
        
        if (this.predictionData.prediction && Array.isArray(this.predictionData.prediction)) {
            // 新的 API 格式
            accuracy = (this.predictionData.accuracy || 0.9) * 100;
            const firstPrediction = this.predictionData.prediction[0];
            nextHourPrediction = firstPrediction?.captureRate || firstPrediction?.predicted_value || 87.5;
        } else {
            // 旧的模拟数据格式
            accuracy = (this.predictionData.accuracy || 0.9) * 100;
            nextHourPrediction = this.predictionData.prediction?.[0]?.predicted || 87.5;
        }
        
        const metrics = {
            accuracy: accuracy,
            nextHourPrediction: nextHourPrediction,
            trendDirection: this.calculateTrendDirection()
        };

        // 更新准确率
        const accuracyElement = document.getElementById('accuracy');
        if (accuracyElement) {
            accuracyElement.textContent = `${metrics.accuracy.toFixed(1)}%`;
        }

        // 更新下一小时预测
        const nextHourElement = document.getElementById('nextHourPrediction');
        if (nextHourElement) {
            nextHourElement.textContent = `${metrics.nextHourPrediction.toFixed(1)}%`;
        }

        // 更新趋势方向
        const trendElement = document.getElementById('trendDirection');
        if (trendElement) {
            trendElement.textContent = metrics.trendDirection.text;
            trendElement.className = `metric-value ${metrics.trendDirection.class}`;
        }
    }

    // 计算趋势方向
    calculateTrendDirection() {
        if (!this.predictionData || !this.predictionData.prediction || !this.predictionData.prediction.length) {
            return { text: '未知', class: 'trend-neutral' };
        }

        const predictions = this.predictionData.prediction.slice(0, 6); // 前6小时
        
        // 处理不同的数据格式
        let firstValue, lastValue;
        
        if (predictions[0].predicted !== undefined) {
            // 旧格式
            firstValue = predictions[0].predicted;
            lastValue = predictions[predictions.length - 1].predicted;
        } else if (predictions[0].captureRate !== undefined) {
            // 新格式
            firstValue = predictions[0].captureRate;
            lastValue = predictions[predictions.length - 1].captureRate;
        } else {
            return { text: '未知', class: 'trend-neutral' };
        }
        
        const difference = lastValue - firstValue;

        if (Math.abs(difference) < 0.5) {
            return { text: '平稳', class: 'trend-stable' };
        } else if (difference > 0) {
            return { text: '上升', class: 'trend-up' };
        } else {
            return { text: '下降', class: 'trend-down' };
        }
    }

    // 显示预测完成状态
    showPredictionComplete() {
        const accuracy = (this.predictionData.accuracy || 0.9) * 100;
        const modelName = this.predictionData.model || this.currentModel;
        const message = `${modelName.toUpperCase()}模型预测完成，准确率${accuracy.toFixed(1)}%`;
        
        console.log('AI预测完成:', message);
        
        if (window.CarbonBrainApp) {
            window.CarbonBrainApp.showNotification(
                'AI预测',
                message,
                'success'
            );
        }
        
        // 更新状态显示
        this.updatePredictionStatus('预测完成', 'success');
    }
    
    // 更新预测状态显示
    updatePredictionStatus(status, type = 'info') {
        const statusElement = document.getElementById('predictionStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `prediction-status ${type}`;
        }
    }

    // 显示预测错误
    showPredictionError(message) {
        const errorMsg = message || '预测模型运行失败，请稍后重试';
        console.error('预测错误:', errorMsg);
        
        if (window.CarbonBrainApp) {
            window.CarbonBrainApp.showNotification(
                '预测失败',
                errorMsg,
                'error'
            );
        }
        
        // 更新状态显示
        this.updatePredictionStatus('预测失败', 'error');
    }

    // 切换预测模型
    changeModel(model) {
        if (this.isRunning) {
            console.warn('预测正在运行，无法切换模型');
            return;
        }
        
        this.currentModel = model;
        console.log(`切换到${model.toUpperCase()}模型`);
        
        // 更新界面模型显示
        this.updateModelDisplay(model);
        
        // 重新运行预测
        this.runPrediction(model);
    }
    
    // 更新模型显示
    updateModelDisplay(model) {
        const modelElement = document.getElementById('currentModel');
        if (modelElement) {
            const modelNames = {
                'arima': 'ARIMA时间序列',
                'lgbm': 'LightGBM机器学习',
                'ensemble': '集成预测模型'
            };
            modelElement.textContent = modelNames[model] || model.toUpperCase();
        }
    }

    // 获取模型信息
    getModelInfo(model = null) {
        const modelType = model || this.currentModel;
        const modelConfig = window.CONFIG?.AI_MODELS?.PREDICTION[modelType.toUpperCase()];
        
        if (modelConfig) {
            return {
                name: modelConfig.NAME,
                accuracy: modelConfig.ACCURACY,
                horizon: modelConfig.PREDICTION_HORIZON
            };
        }

        return {
            name: '未知模型',
            accuracy: 0.9,
            horizon: 24
        };
    }

    // 导出预测结果
    exportPredictionData() {
        if (!this.predictionData) {
            console.warn('没有可导出的预测数据');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            model: this.currentModel,
            accuracy: this.predictionData.accuracy,
            historical: this.predictionData.historical,
            prediction: this.predictionData.prediction
        };

        const jsonData = JSON.stringify(exportData, null, 2);
        
        if (window.Utils) {
            const filename = `prediction_${this.currentModel}_${new Date().toISOString().slice(0, 10)}.json`;
            window.Utils.downloadFile(jsonData, filename);
        }
    }

    // 获取预测统计信息
    getPredictionStats() {
        if (!this.predictionData || !this.predictionData.prediction) return null;

        const predictions = this.predictionData.prediction;
        
        // 处理不同的数据格式
        let values, confidences;
        
        if (predictions[0] && predictions[0].predicted !== undefined) {
            // 旧格式
            values = predictions.map(p => p.predicted);
            confidences = predictions.map(p => p.confidence || 0.9);
        } else if (predictions[0] && predictions[0].captureRate !== undefined) {
            // 新格式
            values = predictions.map(p => p.captureRate);
            confidences = predictions.map(p => p.confidence || 0.9);
        } else {
            return null;
        }

        return {
            count: predictions.length,
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            avgValue: values.reduce((sum, val) => sum + val, 0) / values.length,
            avgConfidence: confidences.reduce((sum, val) => sum + val, 0) / confidences.length,
            trend: this.calculateTrendDirection(),
            model: this.predictionData.model,
            accuracy: this.predictionData.accuracy
        };
    }
    
    // 测试 AI 预测连接
    async testPredictionAPI() {
        try {
            const response = await fetch('/api/ai/test');
            const data = await response.json();
            
            console.log('AI预测模型测试结果:', data);
            
            if (data.success) {
                if (window.CarbonBrainApp) {
                    window.CarbonBrainApp.showNotification(
                        'AI模型测试',
                        'AI预测模型连接正常',
                        'success'
                    );
                }
            } else {
                if (window.CarbonBrainApp) {
                    window.CarbonBrainApp.showNotification(
                        'AI模型测试',
                        data.message || 'AI预测模型不可用',
                        'warning'
                    );
                }
            }
            
            return data;
            
        } catch (error) {
            console.error('测试AI预测模型失败:', error);
            
            if (window.CarbonBrainApp) {
                window.CarbonBrainApp.showNotification(
                    'AI模型测试',
                    '网络连接失败',
                    'error'
                );
            }
            
            return { success: false, error: error.message };
        }
    }
}

// 全局实例
window.PredictionManager = new PredictionManager();

// 初始化预测管理器
document.addEventListener('DOMContentLoaded', function() {
    // 确保下拉菜单与当前模型同步
    const modelSelect = document.getElementById('predictionModel');
    if (modelSelect) {
        modelSelect.value = window.PredictionManager.currentModel;
        console.log(`预测模型初始化为: ${window.PredictionManager.currentModel}`);
    }
});

// 全局函数（供HTML调用）
window.runPrediction = function() {
    window.PredictionManager.runPrediction();
};

window.changePredictionModel = function(model) {
    window.PredictionManager.changeModel(model);
};

window.testAIPrediction = function() {
    window.PredictionManager.testPredictionAPI();
};