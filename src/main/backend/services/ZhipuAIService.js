// 智谱AI服务模块
const https = require('https');

class ZhipuAIService {
    constructor() {
        this.apiKey = process.env.ZHIPU_API_KEY || '81dafd92fdef48d8af38647d9531f075.jy9Rln9sDeXhldg4';
        this.baseURL = 'https://open.bigmodel.cn/api/paas/v4';
        this.defaultModel = 'glm-4.5';
        
        // 会话管理
        this.sessions = new Map();
        this.maxSessionAge = 30 * 60 * 1000; // 30分钟过期
        
        console.log('智谱AI服务初始化完成');
    }

    // 发送HTTP请求到智谱AI API
    async makeRequest(endpoint, data, options = {}) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            
            const reqOptions = {
                hostname: 'open.bigmodel.cn',
                port: 443,
                path: `/api/paas/v4${endpoint}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(reqOptions, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            const parsedData = JSON.parse(responseData);
                            resolve(parsedData);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`响应解析错误: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`请求错误: ${error.message}`));
            });

            // 设置超时
            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('请求超时'));
            });

            req.write(postData);
            req.end();
        });
    }

    // 沪碳智脑专用系统提示词
    getSystemPrompt(context = 'general') {
        const basePrompt = `你是沪碳智脑AI助手，专门服务于上海化工园区CCU（碳捕集与利用）技术智能决策与分析平台。

【你的专业背景】
- 深度理解CCU技术原理：化学吸收法CO2捕集、MEA溶剂技术、CO2转化制甲醇工艺
- 熟悉化工园区运营：工艺参数控制、设备维护、能耗管理、经济效益分析
- 掌握数据分析：KPI指标解读、趋势分析、异常检测、预测建议

【平台核心指标】
- CO2捕集率：目标90%，正常范围85-95%
- 烟道气流量：12,000-18,000 m³/h
- 溶剂流量：150-250 t/h  
- 能耗：目标3.2 GJ/tCO2，正常范围2.5-5.0
- 甲醇产量：15-30 t/h
- 分时电价：峰时0.92、平时0.63、谷时0.35元/kWh

【你的任务】
1. 分析实时运行数据，识别异常和优化机会
2. 解读趋势图表，提供专业洞察和建议
3. 回答CCU技术相关问题，给出实用指导
4. 协助决策制定，提供数据支持

【回答风格】
- 专业准确：基于化工专业知识回答
- 简洁明了：突出关键信息和建议
- 数据驱动：结合具体数值和图表分析
- 实用导向：提供可操作的优化建议`;

        const contextPrompts = {
            kpi: `${basePrompt}

【当前专注领域：KPI仪表盘分析】
重点关注：项目投资回报、CO2捕集效率、甲醇产量、实时运行利润等核心指标的变化趋势和异常分析。`,

            performance: `${basePrompt}

【当前专注领域：技术性能监控】  
重点关注：捕集率稳定性、能耗控制、溶剂循环效率、设备运行状态等技术参数的优化建议。`,

            economic: `${basePrompt}

【当前专注领域：经济效益分析】
重点关注：成本结构优化、收益提升策略、峰谷电价利用、运营成本控制等经济指标分析。`,

            prediction: `${basePrompt}

【当前专注领域：AI预测分析】
重点关注：预测模型准确性评估、趋势分析、异常预警、运行参数调整建议等预测相关分析。`,

            geo: `${basePrompt}

【当前专注领域：地理空间分析】
重点关注：运输路线优化、储存点效率、物流成本分析、区域布局规划等空间相关分析。`
        };

        return contextPrompts[context] || basePrompt;
    }

    // 数据分析专用提示词
    getDataAnalysisPrompt(dataType, data) {
        let prompt = '请基于以下数据进行专业分析：\n\n';
        
        switch (dataType) {
            case 'kpi':
                prompt += `【KPI数据】
- 项目总投资：${data.totalInvestment?.value || 'N/A'}${data.totalInvestment?.unit || ''}
- CO2捕集量：${data.co2Capture?.value || 'N/A'}${data.co2Capture?.unit || ''}  
- 甲醇产量：${data.methanolProduction?.value || 'N/A'}${data.methanolProduction?.unit || ''}
- 实时利润：${data.realTimeProfit?.value || 'N/A'}${data.realTimeProfit?.unit || ''}

请分析这些KPI指标的表现，识别优势和改进空间，给出运营建议。`;
                break;

            case 'performance':
                if (data.timestamps && data.captureRate) {
                    const avgCapture = (data.captureRate.reduce((a, b) => a + b, 0) / data.captureRate.length).toFixed(1);
                    const avgEnergy = data.energyConsumption ? 
                        (data.energyConsumption.reduce((a, b) => a + b, 0) / data.energyConsumption.length).toFixed(2) : 'N/A';
                    
                    prompt += `【技术性能数据】
- 平均CO2捕集率：${avgCapture}%
- 平均能耗：${avgEnergy} GJ/tCO2
- 数据时间范围：${data.timestamps.length}个时间点
- 捕集率变化范围：${Math.min(...data.captureRate).toFixed(1)}% - ${Math.max(...data.captureRate).toFixed(1)}%

请分析技术性能表现，评估稳定性，提出优化建议。`;
                }
                break;

            case 'economic':
                if (data.costBreakdown) {
                    const total = Object.values(data.costBreakdown).reduce((a, b) => a + b, 0);
                    prompt += `【经济数据分析】
成本构成：
- 电费：${(data.costBreakdown.electricity || 0).toFixed(0)}元 (${((data.costBreakdown.electricity / total) * 100).toFixed(1)}%)
- 溶剂：${(data.costBreakdown.solvent || 0).toFixed(0)}元 (${((data.costBreakdown.solvent / total) * 100).toFixed(1)}%)  
- 人工：${(data.costBreakdown.labor || 0).toFixed(0)}元 (${((data.costBreakdown.labor / total) * 100).toFixed(1)}%)
- 维护：${(data.costBreakdown.maintenance || 0).toFixed(0)}元 (${((data.costBreakdown.maintenance / total) * 100).toFixed(1)}%)
- 其他：${(data.costBreakdown.other || 0).toFixed(0)}元 (${((data.costBreakdown.other / total) * 100).toFixed(1)}%)

请分析成本结构，识别节约机会，提供优化策略。`;
                }
                break;
        }
        
        return prompt;
    }

    // 智能数据分析
    async analyzeData(query, context = 'general', data = {}) {
        try {
            console.log(`智谱AI数据分析请求: 上下文=${context}`);
            
            const systemPrompt = this.getSystemPrompt(context);
            let userPrompt = query;
            
            // 如果提供了数据，添加数据分析提示
            if (data && Object.keys(data).length > 0) {
                userPrompt = this.getDataAnalysisPrompt(context, data) + '\n\n用户问题：' + query;
            }

            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user", 
                    content: userPrompt
                }
            ];

            const requestData = {
                model: this.defaultModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: 800,
                top_p: 0.9
            };

            const response = await this.makeRequest('/chat/completions', requestData);
            
            if (response.choices && response.choices.length > 0) {
                const aiResponse = response.choices[0].message.content;
                
                return {
                    response: aiResponse,
                    confidence: 0.85 + Math.random() * 0.1, // 模拟置信度
                    suggestions: this.extractSuggestions(aiResponse),
                    context: context,
                    model: this.defaultModel,
                    usage: response.usage || {}
                };
            } else {
                throw new Error('智谱AI返回数据格式异常');
            }

        } catch (error) {
            console.error('智谱AI分析失败:', error);
            
            // 返回错误信息和降级响应
            return {
                response: `抱歉，智谱AI服务暂时不可用。错误信息：${error.message}。请稍后重试或联系系统管理员。`,
                confidence: 0.0,
                suggestions: ['检查网络连接', '稍后重试', '联系技术支持'],
                context: context,
                error: error.message
            };
        }
    }

    // 智能对话
    async chat(message, sessionId = null, context = 'general') {
        try {
            console.log(`智谱AI聊天请求: 会话=${sessionId}`);
            
            // 获取或创建会话
            let session = this.getSession(sessionId);
            if (!session) {
                session = this.createSession(context);
                sessionId = session.id;
            }
            
            // 添加用户消息到会话历史
            session.messages.push({
                role: "user",
                content: message,
                timestamp: new Date().toISOString()
            });

            // 保持会话历史在合理长度内（最多10轮对话）
            if (session.messages.length > 20) {
                // 保留系统提示和最近的18条消息
                const systemMsg = session.messages[0];
                const recentMessages = session.messages.slice(-18);
                session.messages = [systemMsg, ...recentMessages];
            }

            const requestData = {
                model: this.defaultModel,
                messages: session.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature: 0.8,
                max_tokens: 600,
                top_p: 0.95
            };

            const response = await this.makeRequest('/chat/completions', requestData);
            
            if (response.choices && response.choices.length > 0) {
                const aiResponse = response.choices[0].message.content;
                
                // 添加AI回复到会话历史
                session.messages.push({
                    role: "assistant",
                    content: aiResponse,
                    timestamp: new Date().toISOString()
                });
                
                // 更新会话时间
                session.lastActivity = Date.now();

                return {
                    response: aiResponse,
                    confidence: 0.9,
                    suggestions: this.extractSuggestions(aiResponse),
                    sessionId: sessionId,
                    context: context,
                    usage: response.usage || {}
                };
            } else {
                throw new Error('智谱AI返回数据格式异常');
            }

        } catch (error) {
            console.error('智谱AI聊天失败:', error);
            
            return {
                response: `抱歉，智能对话服务暂时不可用。错误：${error.message}`,
                confidence: 0.0,
                suggestions: ['重新开始对话', '检查网络连接'],
                sessionId: sessionId,
                error: error.message
            };
        }
    }

    // 会话管理
    createSession(context = 'general') {
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const session = {
            id: sessionId,
            context: context,
            messages: [
                {
                    role: "system",
                    content: this.getSystemPrompt(context),
                    timestamp: new Date().toISOString()
                }
            ],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        this.sessions.set(sessionId, session);
        
        // 清理过期会话
        this.cleanupSessions();
        
        return session;
    }

    getSession(sessionId) {
        if (!sessionId) return null;
        
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        
        // 检查会话是否过期
        if (Date.now() - session.lastActivity > this.maxSessionAge) {
            this.sessions.delete(sessionId);
            return null;
        }
        
        return session;
    }

    cleanupSessions() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity > this.maxSessionAge) {
                this.sessions.delete(sessionId);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`清理了 ${cleanedCount} 个过期会话`);
        }
    }

    // 从AI回复中提取建议
    extractSuggestions(response) {
        const suggestions = [];
        
        // 查找建议相关的关键词
        const suggestionKeywords = ['建议', '推荐', '应该', '可以', '优化', '改进', '注意'];
        const lines = response.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (suggestionKeywords.some(keyword => trimmedLine.includes(keyword))) {
                // 清理格式符号
                const cleanSuggestion = trimmedLine
                    .replace(/^[-•*]\s*/, '')
                    .replace(/^\d+\.\s*/, '')
                    .trim();
                
                if (cleanSuggestion.length > 10 && cleanSuggestion.length < 100) {
                    suggestions.push(cleanSuggestion);
                }
            }
        }
        
        return suggestions.slice(0, 3); // 最多返回3个建议
    }

    // 获取服务状态
    getStatus() {
        return {
            apiKey: this.apiKey ? '已配置' : '未配置',
            model: this.defaultModel,
            activeSessions: this.sessions.size,
            isAvailable: !!this.apiKey
        };
    }

    // 测试连接
    async testConnection() {
        try {
            const testData = {
                model: this.defaultModel,
                messages: [
                    {
                        role: "user",
                        content: "你好，请简单介绍一下你自己。"
                    }
                ],
                max_tokens: 100
            };

            const response = await this.makeRequest('/chat/completions', testData);
            
            return {
                success: true,
                message: '智谱AI连接测试成功',
                response: response.choices?.[0]?.message?.content || '连接正常'
            };

        } catch (error) {
            return {
                success: false,
                message: '智谱AI连接测试失败',
                error: error.message
            };
        }
    }
}

module.exports = ZhipuAIService;