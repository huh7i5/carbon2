// AI预测模块
class PredictionManager {
    constructor() {
        this.currentModel = 'arima';
        this.predictionData = null;
        this.isRunning = false;
    }

    // 运行预测
    async runPrediction(model = null) {
        if (this.isRunning) {
            console.warn('预测正在运行中...');
            return;
        }

        this.isRunning = true;
        const modelType = model || this.currentModel;

        try {
            // 显示加载状态
            this.showLoadingState(true);

            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 获取预测数据
            this.predictionData = window.MockData.getPredictionData();

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
            this.isRunning = false;
            this.showLoadingState(false);
        }
    }

    // 显示加载状态
    showLoadingState(isLoading) {
        const btn = document.querySelector('.prediction-controls .btn-primary');
        if (!btn) return;

        if (isLoading) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 预测中...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> 运行预测';
            btn.disabled = false;
            btn.style.opacity = '1';
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

    // 更新预测指标
    updatePredictionMetrics() {
        if (!this.predictionData) return;

        const metrics = {
            accuracy: this.predictionData.accuracy * 100,
            nextHourPrediction: this.predictionData.prediction[0]?.predicted || 87.5,
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
        if (!this.predictionData || !this.predictionData.prediction.length) {
            return { text: '未知', class: 'trend-neutral' };
        }

        const predictions = this.predictionData.prediction.slice(0, 6); // 前6小时
        const firstValue = predictions[0].predicted;
        const lastValue = predictions[predictions.length - 1].predicted;
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
        if (window.CarbonBrainApp) {
            window.CarbonBrainApp.showNotification(
                'AI预测',
                `${this.currentModel.toUpperCase()}模型预测完成，准确率${(this.predictionData.accuracy * 100).toFixed(1)}%`,
                'success'
            );
        }
    }

    // 显示预测错误
    showPredictionError(message) {
        if (window.CarbonBrainApp) {
            window.CarbonBrainApp.showNotification(
                '预测失败',
                message || '预测模型运行失败，请稍后重试',
                'error'
            );
        }
    }

    // 切换预测模型
    changeModel(model) {
        this.currentModel = model;
        console.log(`切换到${model.toUpperCase()}模型`);
        
        // 重新运行预测
        this.runPrediction(model);
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
        if (!this.predictionData) return null;

        const predictions = this.predictionData.prediction;
        const values = predictions.map(p => p.predicted);
        const confidences = predictions.map(p => p.confidence);

        return {
            count: predictions.length,
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            avgValue: values.reduce((sum, val) => sum + val, 0) / values.length,
            avgConfidence: confidences.reduce((sum, val) => sum + val, 0) / confidences.length,
            trend: this.calculateTrendDirection()
        };
    }
}

// 全局实例
window.PredictionManager = new PredictionManager();

// 全局函数（供HTML调用）
window.runPrediction = function() {
    window.PredictionManager.runPrediction();
};

window.changePredictionModel = function(model) {
    window.PredictionManager.changeModel(model);
};