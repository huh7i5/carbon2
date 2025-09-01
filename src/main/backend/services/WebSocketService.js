// WebSocket实时通信服务
class WebSocketService {
    constructor(wss) {
        this.wss = wss;
        this.clients = new Map(); // 存储客户端连接和其订阅信息
    }

    // 处理客户端消息
    handleMessage(ws, data) {
        try {
            const { type, payload } = data;
            
            switch (type) {
                case 'subscribe':
                    this.handleSubscribe(ws, payload);
                    break;
                    
                case 'unsubscribe':
                    this.handleUnsubscribe(ws, payload);
                    break;
                    
                case 'ping':
                    this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
                    break;
                    
                default:
                    console.warn('未知的WebSocket消息类型:', type);
            }
            
        } catch (error) {
            console.error('处理WebSocket消息错误:', error);
            this.sendErrorToClient(ws, '消息处理失败');
        }
    }

    // 处理订阅请求
    handleSubscribe(ws, payload) {
        const { channels } = payload;
        
        if (!Array.isArray(channels)) {
            this.sendErrorToClient(ws, '订阅频道必须是数组格式');
            return;
        }
        
        // 获取或创建客户端信息
        let clientInfo = this.clients.get(ws) || {
            id: this.generateClientId(),
            subscriptions: new Set(),
            connectedAt: new Date().toISOString()
        };
        
        // 添加订阅频道
        channels.forEach(channel => {
            if (this.isValidChannel(channel)) {
                clientInfo.subscriptions.add(channel);
            }
        });
        
        this.clients.set(ws, clientInfo);
        
        // 发送订阅确认
        this.sendToClient(ws, {
            type: 'subscription_confirmed',
            data: {
                clientId: clientInfo.id,
                subscriptions: Array.from(clientInfo.subscriptions)
            }
        });
        
        console.log(`客户端 ${clientInfo.id} 订阅频道:`, Array.from(clientInfo.subscriptions));
    }

    // 处理取消订阅
    handleUnsubscribe(ws, payload) {
        const { channels } = payload;
        const clientInfo = this.clients.get(ws);
        
        if (!clientInfo) return;
        
        if (Array.isArray(channels)) {
            channels.forEach(channel => {
                clientInfo.subscriptions.delete(channel);
            });
        } else {
            // 取消所有订阅
            clientInfo.subscriptions.clear();
        }
        
        this.sendToClient(ws, {
            type: 'unsubscription_confirmed',
            data: {
                clientId: clientInfo.id,
                subscriptions: Array.from(clientInfo.subscriptions)
            }
        });
    }

    // 向单个客户端发送消息
    sendToClient(ws, message) {
        if (ws.readyState === ws.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('发送消息到客户端失败:', error);
            }
        }
    }

    // 向客户端发送错误消息
    sendErrorToClient(ws, message) {
        this.sendToClient(ws, {
            type: 'error',
            error: {
                message,
                timestamp: new Date().toISOString()
            }
        });
    }

    // 广播消息给所有客户端
    broadcastToAll(message) {
        const messageStr = JSON.stringify(message);
        let sentCount = 0;
        
        this.clients.forEach((clientInfo, ws) => {
            if (ws.readyState === ws.OPEN) {
                try {
                    ws.send(messageStr);
                    sentCount++;
                } catch (error) {
                    console.error(`向客户端 ${clientInfo.id} 发送消息失败:`, error);
                    this.removeClient(ws);
                }
            }
        });
        
        if (sentCount > 0) {
            console.log(`广播消息发送给 ${sentCount} 个客户端`);
        }
    }

    // 向订阅特定频道的客户端发送消息
    broadcastToChannel(channel, message) {
        const messageStr = JSON.stringify({
            ...message,
            channel
        });
        let sentCount = 0;
        
        this.clients.forEach((clientInfo, ws) => {
            if (clientInfo.subscriptions.has(channel) && ws.readyState === ws.OPEN) {
                try {
                    ws.send(messageStr);
                    sentCount++;
                } catch (error) {
                    console.error(`向客户端 ${clientInfo.id} 发送频道消息失败:`, error);
                    this.removeClient(ws);
                }
            }
        });
        
        if (sentCount > 0) {
            console.log(`频道 ${channel} 消息发送给 ${sentCount} 个客户端`);
        }
    }

    // 移除客户端连接
    removeClient(ws) {
        const clientInfo = this.clients.get(ws);
        if (clientInfo) {
            console.log(`客户端 ${clientInfo.id} 断开连接`);
            this.clients.delete(ws);
        }
    }

    // 获取连接统计信息
    getStats() {
        const stats = {
            totalConnections: this.clients.size,
            connections: []
        };
        
        this.clients.forEach((clientInfo, ws) => {
            stats.connections.push({
                id: clientInfo.id,
                connectedAt: clientInfo.connectedAt,
                subscriptions: Array.from(clientInfo.subscriptions),
                readyState: ws.readyState
            });
        });
        
        return stats;
    }

    // 发送实时数据更新
    sendRealtimeUpdate(data) {
        this.broadcastToChannel('realtime', {
            type: 'realtime_update',
            data,
            timestamp: new Date().toISOString()
        });
    }

    // 发送KPI数据更新
    sendKPIUpdate(data) {
        this.broadcastToChannel('kpi', {
            type: 'kpi_update',
            data,
            timestamp: new Date().toISOString()
        });
    }

    // 发送性能数据更新
    sendPerformanceUpdate(data) {
        this.broadcastToChannel('performance', {
            type: 'performance_update',
            data,
            timestamp: new Date().toISOString()
        });
    }

    // 发送预测结果更新
    sendPredictionUpdate(data) {
        this.broadcastToChannel('prediction', {
            type: 'prediction_update',
            data,
            timestamp: new Date().toISOString()
        });
    }

    // 发送系统通知
    sendNotification(message, type = 'info') {
        this.broadcastToAll({
            type: 'notification',
            data: {
                message,
                type,
                timestamp: new Date().toISOString()
            }
        });
    }

    // 验证频道名称
    isValidChannel(channel) {
        const validChannels = [
            'realtime',
            'kpi',
            'performance',
            'economic',
            'prediction',
            'geo',
            'system'
        ];
        return validChannels.includes(channel);
    }

    // 生成客户端ID
    generateClientId() {
        return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 定期清理无效连接
    startConnectionCleanup() {
        setInterval(() => {
            let removedCount = 0;
            
            this.clients.forEach((clientInfo, ws) => {
                if (ws.readyState !== ws.OPEN) {
                    this.removeClient(ws);
                    removedCount++;
                }
            });
            
            if (removedCount > 0) {
                console.log(`清理了 ${removedCount} 个无效连接`);
            }
        }, 60000); // 每分钟清理一次
    }

    // 发送心跳检测
    startHeartbeat() {
        setInterval(() => {
            this.broadcastToAll({
                type: 'heartbeat',
                timestamp: new Date().toISOString(),
                stats: {
                    connections: this.clients.size,
                    uptime: process.uptime()
                }
            });
        }, 30000); // 每30秒发送一次心跳
    }
}

module.exports = WebSocketService;