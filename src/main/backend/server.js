// 沪碳智脑后端服务器主入口
require('dotenv').config(); // 加载环境变量

const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const rateLimit = require('express-rate-limit');

// 导入路由模块
const kpiRoutes = require('./routes/kpi');
const performanceRoutes = require('./routes/performance');
const geoRoutes = require('./routes/geo');
const economicRoutes = require('./routes/economic');
const aiRoutes = require('./routes/ai');
const llmRoutes = require('./routes/llm');

// 导入服务模块
const DataService = require('./services/DataService');
const WebSocketService = require('./services/WebSocketService');

class CarbonBrainServer {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server });
        this.port = process.env.PORT || 3000;
        
        // 初始化服务
        this.dataService = new DataService();
        this.wsService = new WebSocketService(this.wss);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupErrorHandling();
    }

    // 设置中间件
    setupMiddleware() {
        // CORS配置
        this.app.use(cors({
            origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
            credentials: true
        }));

        // 请求解析
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // 静态文件服务
        this.app.use(express.static(path.join(__dirname, '../frontend')));

        // 请求日志
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });

        // 频率限制
        const limiter = rateLimit({
            windowMs: 1 * 60 * 1000, // 1分钟
            max: 100, // 限制100个请求
            message: {
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: '请求频率超限，请稍后再试'
                }
            }
        });
        this.app.use('/api/', limiter);
    }

    // 设置路由
    setupRoutes() {
        // 将服务添加到应用上下文，供路由使用
        this.app.locals.dataService = this.dataService;
        this.app.locals.wsService = this.wsService;
        
        // 健康检查
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                data: {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: '1.0.0',
                    services: {
                        dataService: this.dataService.isInitialized,
                        webSocket: this.wss.clients.size
                    }
                }
            });
        });

        // API路由
        this.app.use('/api/kpi', kpiRoutes);
        this.app.use('/api/performance', performanceRoutes);
        this.app.use('/api/geo', geoRoutes);
        this.app.use('/api/economic', economicRoutes);
        this.app.use('/api/ai', aiRoutes);
        this.app.use('/api/llm', llmRoutes);

        // 前端路由回退
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../frontend/html/index.html'));
        });
    }

    // 设置WebSocket
    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            console.log(`WebSocket连接建立: ${req.socket.remoteAddress}`);
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.wsService.handleMessage(ws, data);
                } catch (error) {
                    console.error('WebSocket消息解析错误:', error);
                }
            });

            ws.on('close', () => {
                console.log('WebSocket连接关闭');
                this.wsService.removeClient(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket错误:', error);
            });

            // 发送欢迎消息
            ws.send(JSON.stringify({
                type: 'connection',
                data: {
                    message: '连接到沪碳智脑实时数据服务',
                    timestamp: new Date().toISOString()
                }
            }));
        });

        // 启动实时数据推送
        this.startRealTimeDataPush();
    }

    // 错误处理
    setupErrorHandling() {
        // 404错误处理
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '请求的资源不存在'
                }
            });
        });

        // 全局错误处理
        this.app.use((error, req, res, next) => {
            console.error('服务器错误:', error);
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '服务器内部错误',
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            });
        });

        // 进程错误处理
        process.on('uncaughtException', (error) => {
            console.error('未捕获的异常:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('未处理的Promise拒绝:', reason);
        });
    }

    // 启动实时数据推送
    startRealTimeDataPush() {
        // 每30秒推送一次实时数据
        setInterval(async () => {
            try {
                const realTimeData = await this.dataService.getRealTimeData();
                this.wsService.broadcastToAll({
                    type: 'realtime_update',
                    data: realTimeData,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('实时数据推送错误:', error);
            }
        }, 30000);

        console.log('实时数据推送服务已启动 (30秒间隔)');
    }

    // 启动服务器
    async start() {
        try {
            // 初始化数据服务
            await this.dataService.initialize();
            
            // 启动HTTP服务器
            this.server.listen(this.port, () => {
                console.log(`
╔══════════════════════════════════════════════╗
║              沪碳智脑后端服务器                ║
╠══════════════════════════════════════════════╣
║  🚀 服务器地址: http://localhost:${this.port}        ║
║  📊 健康检查:   http://localhost:${this.port}/health ║
║  📡 WebSocket:  ws://localhost:${this.port}/ws      ║
║  📚 API文档:    /docs/api/                   ║
╠══════════════════════════════════════════════╣
║  状态: 运行中                                ║
║  环境: ${process.env.NODE_ENV || 'development'}                           ║
║  版本: 1.0.0                                ║
╚══════════════════════════════════════════════╝
                `);
            });

        } catch (error) {
            console.error('服务器启动失败:', error);
            process.exit(1);
        }
    }

    // 优雅关闭
    async shutdown() {
        console.log('正在关闭服务器...');
        
        return new Promise((resolve) => {
            this.server.close(() => {
                console.log('服务器已关闭');
                resolve();
            });
        });
    }
}

// 创建和启动服务器
const server = new CarbonBrainServer();

// 处理进程退出信号
process.on('SIGTERM', async () => {
    console.log('收到SIGTERM信号，开始优雅关闭...');
    await server.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('收到SIGINT信号，开始优雅关闭...');
    await server.shutdown();
    process.exit(0);
});

// 启动服务器
if (require.main === module) {
    server.start();
}

module.exports = CarbonBrainServer;