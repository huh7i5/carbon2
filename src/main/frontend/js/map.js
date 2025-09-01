// 地图管理模块
class MapManager {
    constructor() {
        this.map = null;
        this.AMap = null; // 保存AMap对象
        this.markers = [];
        this.isInitialized = false;
    }

    // 初始化地图
    async init() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error('地图容器未找到');
            return;
        }

        // 显示加载状态
        this.showLoadingStatus();

        // 检查AMapLoader是否可用
        if (typeof AMapLoader === 'undefined') {
            console.warn('AMapLoader未加载，显示占位符');
            this.showMapPlaceholder('AMapLoader未加载');
            return;
        }

        try {
            // 使用AMapLoader加载高德地图API
            console.log('正在加载高德地图API...');
            this.AMap = await AMapLoader.load({
                key: window.CONFIG?.AMAP?.KEY || "ec8bd2f50328bddc6a67a4e881f4adfb",
                version: "2.0",
                plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Polyline', 'AMap.InfoWindow'] // 需要使用的插件列表
            });

            // 初始化地图实例
            this.map = new this.AMap.Map('mapContainer', {
                center: window.CONFIG?.AMAP?.CENTER || [121.783333, 30.866667],
                zoom: window.CONFIG?.AMAP?.ZOOM || 12,
                mapStyle: 'amap://styles/darkblue', // 深色主题
                viewMode: '2D',
                features: ['bg', 'road', 'building'], // 显示背景、道路、建筑
                expandZoomRange: true
            });

            // 添加地图加载完成监听
            this.map.on('complete', () => {
                console.log('地图加载完成');
                // 添加控件
                this.map.addControl(new this.AMap.Scale());
                this.map.addControl(new this.AMap.ToolBar());

                // 初始化标记点
                this.initializeMarkers();

                this.isInitialized = true;
                console.log('地图初始化成功');
            });

        } catch (error) {
            console.error('地图初始化失败:', error);
            this.showMapPlaceholder(`地图加载失败: ${error.message}`);
        }
    }

    // 显示加载状态
    showLoadingStatus() {
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
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                ">
                    <div class="loading-spinner" style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #333;
                        border-top: 4px solid #00d4aa;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 15px;
                    "></div>
                    <div style="margin-bottom: 5px;">正在加载高德地图...</div>
                    <div style="font-size: 12px; color: #666;">
                        请稍候，地图模块正在初始化
                    </div>
                </div>
            `;
        }
    }

    // 显示地图占位符
    showMapPlaceholder(errorMessage = '地图加载失败') {
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
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                ">
                    <i class="fas fa-map" style="font-size: 48px; margin-bottom: 15px; color: #00d4aa;"></i>
                    <div style="margin-bottom: 5px;">上海化工园区地理空间分析</div>
                    <div style="font-size: 12px; color: #ff6b6b; margin-bottom: 10px;">
                        ${errorMessage}
                    </div>
                    <div style="margin-top: 15px; padding: 10px 15px; background: rgba(0, 212, 170, 0.1); border-radius: 4px; font-size: 11px;">
                        <div>🗺️ CO2捕集源: 上海化学工业区 (121.783°E, 30.867°N)</div>
                        <div>📍 封存点: 东海CO2封存点A (121.9°E, 30.75°N)</div>
                        <div>🚛 运输中心: 产品运输中心 (121.45°E, 31.15°N)</div>
                        <div>🏭 合作企业: 合作化工厂B (121.65°E, 30.95°N)</div>
                    </div>
                    <button style="
                        margin-top: 15px;
                        padding: 8px 16px;
                        background: #00d4aa;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    " onclick="window.MapManager.init()">
                        重新加载地图
                    </button>
                </div>
            `;
        }
    }

    // 初始化标记点
    initializeMarkers() {
        if (!this.map || !window.MockData) return;

        const geoData = window.MockData.getGeoData();

        // 添加CO2捕集源标记
        this.addSourceMarker(geoData.sourceLocation);

        // 添加存储和运输点标记
        geoData.storageLocations.forEach(location => {
            this.addStorageMarker(location);
        });
    }

    // 添加CO2源点标记
    addSourceMarker(location) {
        if (!this.map || !this.AMap) return;

        const marker = new this.AMap.Marker({
            position: [location.lng, location.lat],
            title: location.name,
            icon: new this.AMap.Icon({
                image: 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="12" fill="#00d4aa" stroke="#ffffff" stroke-width="2"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">🏭</text>
                    </svg>
                `),
                size: new this.AMap.Size(32, 32),
                imageOffset: new this.AMap.Pixel(-16, -16)
            })
        });

        marker.setMap(this.map);
        this.markers.push(marker);

        // 添加点击事件
        marker.on('click', () => {
            this.showLocationInfo(location);
        });
    }

    // 添加存储点标记
    addStorageMarker(location) {
        if (!this.map || !this.AMap) return;

        const colors = {
            storage: '#ff6b6b',
            transport: '#ffc107',
            partner: '#2196f3'
        };

        const icons = {
            storage: '🏭',
            transport: '🚛',
            partner: '🏢'
        };

        const color = colors[location.type] || '#00d4aa';
        const icon = icons[location.type] || '📍';

        const marker = new this.AMap.Marker({
            position: [location.lng, location.lat],
            title: location.name,
            icon: new this.AMap.Icon({
                image: 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
                        <text x="14" y="18" text-anchor="middle" fill="white" font-size="10" font-family="Arial">${icon}</text>
                    </svg>
                `),
                size: new this.AMap.Size(28, 28),
                imageOffset: new this.AMap.Pixel(-14, -14)
            })
        });

        marker.setMap(this.map);
        this.markers.push(marker);

        // 添加点击事件
        marker.on('click', () => {
            this.showLocationInfo(location);
        });
    }

    // 显示位置信息
    showLocationInfo(location) {
        const infoPanel = document.getElementById('locationInfo');
        if (!infoPanel) return;

        const typeNames = {
            source: 'CO2捕集源',
            storage: 'CO2封存点',
            transport: '运输中心',
            partner: '合作企业'
        };

        const typeName = typeNames[location.type] || '地点';

        let content = `
            <h3 style="color: #00d4aa; margin-bottom: 10px;">
                <i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>
                ${location.name}
            </h3>
            <div style="color: #ffffff; margin-bottom: 8px;">
                <strong>类型:</strong> ${typeName}
            </div>
            <div style="color: #a0a0a0; font-size: 14px; line-height: 1.4; margin-bottom: 10px;">
                ${location.description || '暂无描述'}
            </div>
        `;

        // 添加具体数据
        if (location.captureRate) {
            content += `
                <div style="color: #a0a0a0; font-size: 13px; margin-bottom: 5px;">
                    捕集率: <span style="color: #00d4aa;">${location.captureRate}%</span>
                </div>
                <div style="color: #a0a0a0; font-size: 13px; margin-bottom: 5px;">
                    日捕集量: <span style="color: #00d4aa;">${location.dailyCapture} 吨</span>
                </div>
            `;
        }

        if (location.capacity) {
            content += `
                <div style="color: #a0a0a0; font-size: 13px; margin-bottom: 5px;">
                    设计容量: <span style="color: #ffc107;">${location.capacity.toLocaleString()} 吨</span>
                </div>
            `;
        }

        if (location.currentStorage) {
            content += `
                <div style="color: #a0a0a0; font-size: 13px; margin-bottom: 5px;">
                    当前存储: <span style="color: #2196f3;">${location.currentStorage.toLocaleString()} 吨</span>
                </div>
            `;
        }

        if (location.dailyThroughput) {
            content += `
                <div style="color: #a0a0a0; font-size: 13px; margin-bottom: 5px;">
                    日处理量: <span style="color: #ffc107;">${location.dailyThroughput} 吨</span>
                </div>
            `;
        }

        if (location.monthlyDemand) {
            content += `
                <div style="color: #a0a0a0; font-size: 13px; margin-bottom: 5px;">
                    月需求量: <span style="color: #2196f3;">${location.monthlyDemand.toLocaleString()} 吨</span>
                </div>
            `;
        }

        infoPanel.innerHTML = content;
    }

    // 显示CO2源点
    showSources() {
        // 高亮显示CO2源点
        console.log('显示CO2源点');
    }

    // 显示运输路线
    showRoutes() {
        if (!this.map || !window.MockData) return;

        // 清除现有路线
        this.clearRoutes();

        const geoData = window.MockData.getGeoData();
        geoData.transportRoutes.forEach(route => {
            this.drawRoute(route);
        });

        console.log('显示运输路线');
    }

    // 显示封存点
    showStorage() {
        // 高亮显示封存点
        console.log('显示封存点');
    }

    // 绘制路线
    drawRoute(route) {
        if (!this.map || !this.AMap) return;

        const polyline = new this.AMap.Polyline({
            path: [route.from, route.to],
            strokeColor: route.type === 'methanol' ? '#ffc107' : '#2196f3',
            strokeWeight: 4,
            strokeOpacity: 0.8,
            strokeStyle: 'dashed'
        });

        polyline.setMap(this.map);
        this.routes = this.routes || [];
        this.routes.push(polyline);
    }

    // 清除路线
    clearRoutes() {
        if (this.routes) {
            this.routes.forEach(route => {
                route.setMap(null);
            });
            this.routes = [];
        }
    }

    // 销毁地图
    destroy() {
        if (this.map) {
            this.map.destroy();
            this.map = null;
        }
        this.markers = [];
        this.isInitialized = false;
    }
}

// 全局实例
window.MapManager = new MapManager();