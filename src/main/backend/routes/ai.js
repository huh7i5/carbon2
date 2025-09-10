// AI预测分析路由
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

/**
 * @route POST /api/ai/predict
 * @desc 运行AI预测模型
 * @access Public
 */
router.post('/predict', async (req, res) => {
    try {
        const { model = 'ensemble', horizon = 24, metrics = ['co2_capture_rate'] } = req.body;
        
        console.log(`AI预测请求: 模型=${model}, 预测时长=${horizon}小时, 指标=${metrics}`);
        
        // 调用Python高级预测模型
        const predictionData = await runAdvancedPrediction(model, horizon, metrics);
        
        res.json({
            success: true,
            data: predictionData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('AI预测失败:', error);
        
        // 如果Python模型失败，使用备用模拟数据
        console.log('使用备用模拟预测数据...');
        const fallbackData = generatePredictionData(req.body.model || 'ensemble', req.body.horizon || 24, req.body.metrics || ['co2_capture_rate']);
        
        res.json({
            success: true,
            data: fallbackData,
            fallback: true,
            warning: 'Python预测模型不可用，使用模拟数据',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/ai/models
 * @desc 获取可用的AI模型列表
 * @access Public
 */
router.get('/models', (req, res) => {
    const models = [
        {
            id: 'arima',
            name: 'ARIMA时间序列模型',
            accuracy: 0.942,
            description: '适用于CO2捕集率短期预测',
            maxHorizon: 72
        },
        {
            id: 'lgbm',
            name: 'LightGBM机器学习模型',
            accuracy: 0.956,
            description: '适用于多指标综合预测',
            maxHorizon: 48
        },
        {
            id: 'ensemble',
            name: '集成预测模型',
            accuracy: 0.972,
            description: '结合多种算法的高精度预测',
            maxHorizon: 72
        }
    ];
    
    res.json({
        success: true,
        data: models,
        timestamp: new Date().toISOString()
    });
});

/**
 * 调用Python高级预测模型
 */
async function runAdvancedPrediction(model, horizon, metrics) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '../../../main/python/ml_models/advanced_predictor.py');
        const dataPath = path.join(__dirname, '../../../resources/data/historical/historical_data.json');
        const outputPath = path.join(__dirname, `../../tmp_prediction_${Date.now()}.json`);
        
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const metricsStr = Array.isArray(metrics) ? metrics.join(',') : metrics;
        
        const args = [
            pythonScript,
            '--data', dataPath,
            '--output', outputPath,
            '--metrics', metricsStr,
            '--horizon', horizon.toString(),
            '--model', model
        ];
        
        // 检测可用的Python命令
        let pythonCmd = 'python3';
        try {
            require('child_process').execSync('python3 --version', { stdio: 'ignore' });
        } catch (e) {
            try {
                require('child_process').execSync('python --version', { stdio: 'ignore' });
                pythonCmd = 'python';
            } catch (e2) {
                throw new Error('Python环境不可用');
            }
        }
        
        console.log('执行Python预测:', pythonCmd, args.join(' '));
        
        const pythonProcess = spawn(pythonCmd, args);
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            console.log('Python预测进程结束，代码:', code);
            console.log('Python输出:', stdout);
            
            if (code !== 0) {
                console.error('Python错误:', stderr);
                reject(new Error(`Python预测失败: ${stderr}`));
                return;
            }
            
            // 读取预测结果
            try {
                if (fs.existsSync(outputPath)) {
                    const resultData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
                    
                    // 清理临时文件
                    fs.unlinkSync(outputPath);
                    
                    // 转换为前端期望的格式
                    const convertedData = convertPythonResultToFrontend(resultData);
                    resolve(convertedData);
                } else {
                    reject(new Error('预测结果文件不存在'));
                }
            } catch (error) {
                reject(new Error(`读取预测结果失败: ${error.message}`));
            }
        });
        
        // 设置超时
        setTimeout(() => {
            pythonProcess.kill();
            reject(new Error('Python预测超时'));
        }, 30000); // 30秒超时
    });
}

/**
 * 转换Python预测结果为前端格式
 */
function convertPythonResultToFrontend(pythonResult) {
    const modelInfo = pythonResult.model_info;
    const predictionResults = pythonResult.prediction_results;
    
    // 合并所有指标的预测数据
    const predictions = [];
    const maxLength = Math.max(...Object.values(predictionResults).map(result => 
        result.predictions ? result.predictions.length : 0
    ));
    
    for (let i = 0; i < maxLength; i++) {
        const prediction = {
            timestamp: null,
            confidence: 0.9
        };
        
        let totalConfidence = 0;
        let confidenceCount = 0;
        
        Object.keys(predictionResults).forEach(metric => {
            const result = predictionResults[metric];
            if (result.predictions && result.predictions[i]) {
                const pred = result.predictions[i];
                prediction.timestamp = pred.timestamp;
                
                // 映射指标名称
                if (metric === 'co2_capture_rate') {
                    prediction.captureRate = pred.predicted_value;
                } else if (metric === 'energy_consumption') {
                    prediction.energyConsumption = pred.predicted_value;
                } else if (metric === 'methanol_yield') {
                    prediction.methanolYield = pred.predicted_value;
                }
                
                totalConfidence += pred.confidence;
                confidenceCount++;
            }
        });
        
        if (confidenceCount > 0) {
            prediction.confidence = parseFloat((totalConfidence / confidenceCount).toFixed(3));
        }
        
        if (prediction.timestamp) {
            predictions.push(prediction);
        }
    }
    
    return {
        model: modelInfo.algorithm,
        accuracy: modelInfo.overall_confidence,
        horizon: modelInfo.horizon_hours,
        predictions,
        metadata: {
            trainedAt: modelInfo.timestamp,
            version: modelInfo.version,
            algorithm: modelInfo.algorithm,
            predictionQuality: pythonResult.summary.prediction_quality
        },
        summary: pythonResult.summary
    };
}

/**
 * 备用模拟预测数据生成（当Python模型不可用时使用）
 */
function generatePredictionData(model, horizon, metrics) {
    const predictions = [];
    const baseTime = new Date();
    
    for (let i = 1; i <= horizon; i++) {
        const timestamp = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
        const confidence = Math.max(0.7, 0.95 - (i * 0.01));
        
        const prediction = {
            timestamp: timestamp.toISOString(),
            confidence: parseFloat(confidence.toFixed(3))
        };
        
        metrics.forEach(metric => {
            const metricName = typeof metric === 'string' ? metric : 'co2_capture_rate';
            switch (metricName) {
                case 'co2_capture_rate':
                case 'captureRate':
                    prediction.captureRate = 87.5 + (Math.random() - 0.5) * 10;
                    break;
                case 'energy_consumption':
                case 'energyConsumption':
                    prediction.energyConsumption = 3.2 + (Math.random() - 0.5) * 0.8;
                    break;
                case 'methanol_yield':
                case 'methanolYield':
                    prediction.methanolYield = 22 + (Math.random() - 0.5) * 6;
                    break;
            }
        });
        
        predictions.push(prediction);
    }
    
    return {
        model: model || 'fallback',
        accuracy: 0.85,
        horizon,
        predictions,
        metadata: {
            trainedAt: new Date().toISOString(),
            dataPoints: 720,
            features: metrics.length,
            note: '模拟数据 - Python模型不可用时的备用方案'
        }
    };
}

/**
 * @route GET /api/ai/test
 * @desc 测试AI预测模型连接
 * @access Public
 */
router.get('/test', async (req, res) => {
    try {
        console.log('测试AI预测模型连接...');
        
        const testResult = await runAdvancedPrediction('ensemble', 6, ['co2_capture_rate']);
        
        res.json({
            success: true,
            message: 'AI预测模型连接正常',
            testResult: {
                model: testResult.model,
                accuracy: testResult.accuracy,
                predictionsCount: testResult.predictions.length
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('AI预测模型测试失败:', error);
        res.status(200).json({
            success: false,
            message: 'AI预测模型不可用，将使用备用方案',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;