// LLM智能解读模块
class LLMManager {
    constructor() {
        this.currentChart = 'kpi';
        this.chatHistory = [];
        this.isProcessing = false;
    }

    // 发送消息
    async sendMessage(message) {
        if (this.isProcessing || !message.trim()) return;

        this.isProcessing = true;

        try {
            // 添加用户消息到聊天界面
            this.addMessage(message, 'user');

            // 显示AI正在思考
            this.showTypingIndicator();

            // 获取当前选中图表的数据
            const chartData = this.getCurrentChartData();

            // 生成AI回复
            const aiResponse = await this.generateResponse(message, chartData);

            // 移除思考指示器
            this.hideTypingIndicator();

            // 添加AI回复
            this.addMessage(aiResponse, 'ai');

            // 保存到聊天历史
            this.chatHistory.push({
                timestamp: new Date(),
                user: message,
                ai: aiResponse,
                chart: this.currentChart
            });

        } catch (error) {
            console.error('LLM处理失败:', error);
            this.hideTypingIndicator();
            this.addMessage('抱歉，AI分析遇到了技术问题，请稍后重试。', 'ai');
        } finally {
            this.isProcessing = false;
        }
    }

    // 添加消息到聊天界面
    addMessage(content, type) {
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

    // 显示AI思考指示器
    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                正在分析数据...
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 添加思考动画样式
        const style = document.createElement('style');
        style.textContent = `
            .typing-dots {
                display: inline-block;
                margin-right: 10px;
            }
            .typing-dots span {
                display: inline-block;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #00d4aa;
                margin: 0 1px;
                animation: typing 1.4s infinite;
            }
            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }
            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }
            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.4;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 隐藏思考指示器
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // 获取当前图表数据
    getCurrentChartData() {
        const selector = document.getElementById('chartSelector');
        this.currentChart = selector ? selector.value : 'kpi';

        let data = {};

        switch (this.currentChart) {
            case 'kpi':
                data = window.MockData.getCurrentKPI();
                break;
            case 'performance':
                data = window.MockData.getPerformanceData(24);
                break;
            case 'economic':
                data = window.MockData.getEconomicData();
                break;
            case 'prediction':
                data = window.MockData.getPredictionData();
                break;
            default:
                data = window.MockData.getCurrentKPI();
        }

        return {
            chart: this.currentChart,
            data: data,
            timestamp: new Date().toISOString()
        };
    }

    // 生成AI回复
    async generateResponse(userMessage, chartData) {
        try {
            const { chart, data } = chartData;
            
            // 调用后端LLM API
            const response = await fetch('http://localhost:3000/api/llm/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: chart,
                    data: data
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return result.data.response || result.data.text || '收到您的问题，正在分析...';
            } else {
                throw new Error(result.error?.message || '后端API返回错误');
            }
            
        } catch (error) {
            console.error('LLM API调用失败:', error);
            
            // 降级到本地模拟回复
            return this.generateFallbackResponse(userMessage, chartData);
        }
    }
    
    // 降级回复方法
    generateFallbackResponse(userMessage, chartData) {
        const { chart, data } = chartData;
        const lowerMessage = userMessage.toLowerCase();

        // 根据图表类型和用户问题生成专业回复
        switch (chart) {
            case 'kpi':
                return this.generateKPIResponse(lowerMessage, data);
            case 'performance':
                return this.generatePerformanceResponse(lowerMessage, data);
            case 'economic':
                return this.generateEconomicResponse(lowerMessage, data);
            case 'prediction':
                return this.generatePredictionResponse(lowerMessage, data);
            default:
                return this.generateDefaultResponse(lowerMessage);
        }
    }

    // 生成KPI分析回复
    generateKPIResponse(message, data) {
        if (message.includes('投资') || message.includes('总体')) {
            return `根据当前KPI数据分析：

📊 **整体运营状况优良**
• 项目总投资：¥${data.totalInvestment}亿，投资回收期预计6.2年
• 实时CO2捕集量：${data.co2Capture.toFixed(1)}吨，达到设计指标的92%
• 甲醇产量：${data.methanolProduction.toFixed(1)}吨/日，市场供应稳定
• 实时利润：¥${data.realTimeProfit.toFixed(1)}万元，盈利能力良好

💡 **优化建议**：当前运行效率较高，建议保持现有参数设置，重点关注设备维护和溶剂质量管控。`;
        }

        if (message.includes('利润') || message.includes('收益')) {
            return `**💰 利润分析结果**

当前实时利润为¥${data.realTimeProfit.toFixed(1)}万元，利润率约18.5%。

**盈利结构：**
• 甲醇销售收入占总收入85%
• 碳交易收入占总收入15%
• 净利润率维持在合理水平

**改善空间：**
• 优化能耗管理可提升利润2-3%
• 提高甲醇产品纯度可获得价格溢价
• 合理安排生产时段避开峰时电价`;
        }

        return `根据当前KPI仪表盘数据：项目运行状况稳定，CO2捕集效率${data.co2Capture.toFixed(1)}吨，甲醇产量${data.methanolProduction.toFixed(1)}吨，实时利润${data.realTimeProfit.toFixed(1)}万元。整体指标均达到预期目标，建议继续保持当前运行参数。`;
    }

    // 生成性能分析回复
    generatePerformanceResponse(message, data) {
        const avgCaptureRate = data.captureRate.reduce((sum, val) => sum + val, 0) / data.captureRate.length;
        const avgEnergyConsumption = data.energyConsumption.reduce((sum, val) => sum + val, 0) / data.energyConsumption.length;

        if (message.includes('捕集率') || message.includes('效率')) {
            return `**📈 CO2捕集性能分析**

过去24小时平均捕集率：${avgCaptureRate.toFixed(1)}%

**性能评估：**
• 捕集率稳定在85-95%区间，符合设计标准
• 最高捕集率达到${Math.max(...data.captureRate).toFixed(1)}%
• 波动范围控制在±3%以内，运行稳定

**技术建议：**
• 当前性能表现优秀，建议维持现有工艺参数
• 可适当提高溶剂浓度以进一步提升捕集效率
• 定期检查吸收塔填料状态确保传质效果`;
        }

        if (message.includes('能耗') || message.includes('能源')) {
            return `**⚡ 能耗分析报告**

平均再生能耗：${avgEnergyConsumption.toFixed(2)} GJ/tCO2

**能耗水平评价：**
• 当前能耗处于行业先进水平（<3.5 GJ/tCO2）
• 相比传统MEA工艺节能约15%
• 能耗波动范围在2.5-4.2 GJ/tCO2之间

**节能优化方案：**
• 利用低谷电价时段增加运行负荷
• 优化热集成系统回收废热
• 调整溶剂再生温度提高热效率`;
        }

        return `技术性能监控显示：过去24小时平均CO2捕集率${avgCaptureRate.toFixed(1)}%，平均能耗${avgEnergyConsumption.toFixed(2)} GJ/tCO2。系统运行稳定，各项技术指标均在设计范围内，建议继续保持当前工艺参数设置。`;
    }

    // 生成经济分析回复
    generateEconomicResponse(message, data) {
        const costBreakdown = data.costBreakdown;
        const totalCost = Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0);

        if (message.includes('成本') || message.includes('费用')) {
            return `**💸 成本构成分析**

总运营成本：¥${(totalCost/10000).toFixed(1)}万元/小时

**成本结构：**
• 电费：${((costBreakdown.electricity/totalCost)*100).toFixed(1)}% - ¥${(costBreakdown.electricity/10000).toFixed(1)}万元
• 溶剂成本：${((costBreakdown.solvent/totalCost)*100).toFixed(1)}% - ¥${(costBreakdown.solvent/10000).toFixed(1)}万元  
• 人工成本：${((costBreakdown.labor/totalCost)*100).toFixed(1)}% - ¥${(costBreakdown.labor/10000).toFixed(1)}万元
• 设备维护：${((costBreakdown.maintenance/totalCost)*100).toFixed(1)}% - ¥${(costBreakdown.maintenance/10000).toFixed(1)}万元

**优化建议：**
• 电费占比最高，建议优化用电时段安排
• 加强溶剂回收利用降低采购成本
• 实施预防性维护减少设备故障`;
        }

        if (message.includes('收益') || message.includes('盈利')) {
            const recentProfit = data.profitTrend.slice(-7); // 最近7天
            const avgProfit = recentProfit.reduce((sum, day) => sum + day.profit, 0) / recentProfit.length;

            return `**📊 收益盈利分析**

近7日平均利润：¥${avgProfit.toFixed(1)}万元/天

**盈利表现：**
• 盈利能力稳定，日均利润率约18.5%
• 甲醇销售收入为主要利润来源
• 碳交易收入提供额外利润支撑

**盈利优化路径：**
• 提高甲醇产品附加值（高纯度产品）
• 扩大碳交易规模获得更多收益
• 优化生产计划提高设备利用率`;
        }

        return `经济效益分析显示：当前运营成本控制良好，电费和溶剂成本是主要支出项。建议在低电价时段提高运行负荷，同时加强溶剂管理降低采购成本，预计可节省运营成本8-12%。`;
    }

    // 生成预测分析回复
    generatePredictionResponse(message, data) {
        const accuracy = (data.accuracy * 100).toFixed(1);
        const nextHour = data.prediction[0]?.predicted.toFixed(1) || '87.5';

        if (message.includes('预测') || message.includes('未来')) {
            return `**🤖 AI预测分析结果**

模型：${data.model}时间序列预测
预测准确率：${accuracy}%

**未来24小时预测：**
• 下一小时CO2捕集率：${nextHour}%
• 预测趋势：整体上升，波动范围±2%
• 置信度：94%以上，预测可靠性高

**关键预测点：**
• 6小时后达到峰值（约92%）
• 12小时后略有下降（约89%）
• 24小时保持稳定（约88-91%）

**操作建议：**
• 可适当提高溶剂流量以达到更高捕集率
• 关注12小时后的预期下降趋势
• 建议在6小时峰值期增加甲醇产量`;
        }

        if (message.includes('准确') || message.includes('可靠')) {
            return `**📊 模型准确性评估**

当前ARIMA模型表现优秀：
• 历史预测准确率：${accuracy}%
• 平均预测误差：±1.8%
• 模型置信度：94.2%

**模型优势：**
• 能够很好地捕捉时间序列的季节性变化
• 对异常值具有良好的鲁棒性
• 预测结果稳定可靠

**改进方向：**
• 结合更多外部因素（天气、原料质量等）
• 考虑集成深度学习模型提高长期预测精度`;
        }

        return `AI预测模型显示：未来24小时CO2捕集率预计保持在${nextHour}%左右，模型准确率${accuracy}%。预测趋势整体向上，建议保持当前运行参数，适时调整溶剂流量以优化捕集效果。`;
    }

    // 生成默认回复
    generateDefaultResponse(message) {
        const generalResponses = [
            `我是沪碳智脑AI助手，专门为您分析CCU技术运行数据。请选择具体的图表模块（KPI、性能、经济、预测）后提问，我会为您提供专业的数据解读和建议。`,
            
            `根据当前${this.getChartDisplayName()}数据，系统运行正常。如需深入分析，请告诉我您关注的具体方面，如：捕集效率、经济效益、预测趋势等。`,
            
            `我可以帮您分析：
• KPI指标：投资回报、捕集量、产量、利润情况
• 技术性能：捕集率、能耗、溶剂效率分析  
• 经济效益：成本构成、收益分析、优化建议
• AI预测：未来趋势、风险评估、决策支持

请选择您需要了解的方面。`
        ];

        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    // 获取图表显示名称
    getChartDisplayName() {
        const names = {
            kpi: 'KPI仪表盘',
            performance: '技术性能监控',
            economic: '经济效益分析',
            prediction: 'AI预测模块'
        };
        return names[this.currentChart] || 'KPI仪表盘';
    }

    // 切换分析的图表
    changeChart(chartType) {
        this.currentChart = chartType;
        
        // 添加系统消息
        const chartName = this.getChartDisplayName();
        this.addMessage(`已切换到${chartName}，请提出您的问题。`, 'ai');
        
        console.log(`LLM分析切换到: ${chartName}`);
    }

    // 清空聊天记录
    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        您好！我是沪碳智脑AI助手。请选择一个图表模块，然后提问，我将为您解读当前的数据情况。
                    </div>
                </div>
            `;
        }
        
        this.chatHistory = [];
        console.log('聊天记录已清空');
    }

    // 导出聊天记录
    exportChatHistory() {
        if (this.chatHistory.length === 0) {
            console.warn('没有聊天记录可导出');
            return;
        }

        const exportData = {
            platform: '沪碳智脑CCU技术分析平台',
            export_time: new Date().toISOString(),
            total_conversations: this.chatHistory.length,
            conversations: this.chatHistory
        };

        const jsonData = JSON.stringify(exportData, null, 2);
        
        if (window.Utils) {
            const filename = `chat_history_${new Date().toISOString().slice(0, 10)}.json`;
            window.Utils.downloadFile(jsonData, filename);
        }
    }
}

// 全局实例
window.LLMManager = new LLMManager();

// 全局函数（供HTML调用）
window.sendMessage = function() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // 清空输入框
    input.value = '';
    
    // 发送消息
    window.LLMManager.sendMessage(message);
};

// 图表选择器变化事件
document.addEventListener('DOMContentLoaded', function() {
    const chartSelector = document.getElementById('chartSelector');
    if (chartSelector) {
        chartSelector.addEventListener('change', function(e) {
            window.LLMManager.changeChart(e.target.value);
        });
    }
});