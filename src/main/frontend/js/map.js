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
                try {
                    // 添加控件
                    this.map.addControl(new this.AMap.Scale());
                    this.map.addControl(new this.AMap.ToolBar());

                    // 初始化标记点
                    this.initializeMarkers();

                    this.isInitialized = true;
                    console.log('地图初始化成功');
                    
                    // 显示成功通知
                    if (window.CarbonBrainApp) {
                        window.CarbonBrainApp.showNotification('地图模块', '地图加载成功', 'success');
                    }
                } catch (error) {
                    console.error('地图初始化过程中出错:', error);
                    this.showMapPlaceholder(`初始化失败: ${error.message}`);
                }
            });

            // 添加地图错误监听
            this.map.on('error', (error) => {
                console.error('地图加载错误:', error);
                this.showMapPlaceholder('地图加载失败');
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
        if (!this.map) {
            console.warn('地图实例不存在，无法添加标记点');
            return;
        }
        
        if (!window.MockData) {
            console.warn('MockData未加载，无法获取地理数据');
            return;
        }

        try {
            console.log('开始初始化地图标记点...');
            const geoData = window.MockData.getGeoData();
            console.log('获取地理数据:', geoData);

            // 添加CO2捕集源标记
            if (geoData.sourceLocation) {
                console.log('添加CO2捕集源标记:', geoData.sourceLocation.name);
                this.addSourceMarker(geoData.sourceLocation);
            }

            // 添加存储和运输点标记
            if (geoData.storageLocations && geoData.storageLocations.length > 0) {
                console.log(`添加${geoData.storageLocations.length}个存储/运输点标记`);
                geoData.storageLocations.forEach((location, index) => {
                    console.log(`添加标记 ${index + 1}:`, location.name, location.type);
                    this.addStorageMarker(location);
                });
            }
            
            console.log(`地图标记点初始化完成，共添加${this.markers.length}个标记`);
            
        } catch (error) {
            console.error('标记点初始化失败:', error);
        }
    }

    // 添加CO2源点标记
    addSourceMarker(location) {
        if (!this.map || !this.AMap) {
            console.warn('地图或AMap实例不存在，无法添加源点标记');
            return;
        }

        try {
            // 使用简单的SVG图标，避免emoji编码问题
            const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="#00d4aa" stroke="#ffffff" stroke-width="2"/>
                <circle cx="16" cy="16" r="6" fill="#ffffff"/>
                <circle cx="16" cy="16" r="3" fill="#00d4aa"/>
            </svg>`;

            const marker = new this.AMap.Marker({
                position: [location.lng, location.lat],
                title: location.name,
                icon: new this.AMap.Icon({
                    image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgIcon),
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
            
            console.log(`源点标记添加成功: ${location.name}`);
            
        } catch (error) {
            console.error('添加源点标记失败:', error);
        }
    }

    // 添加存储点标记
    addStorageMarker(location) {
        if (!this.map || !this.AMap) {
            console.warn('地图或AMap实例不存在，无法添加存储点标记');
            return;
        }

        try {
            const colors = {
            storage: '#ff6b6b',
            transport: '#ffc107',
            partner: '#2196f3'
        };

        const color = colors[location.type] || '#00d4aa';

        // 根据类型创建不同的SVG图标
        let svgIcon;
        if (location.type === 'storage') {
            svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
                <rect x="8" y="8" width="12" height="8" fill="white" stroke="none"/>
                <rect x="10" y="10" width="8" height="4" fill="${color}"/>
            </svg>`;
        } else if (location.type === 'transport') {
            svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
                <rect x="6" y="10" width="16" height="6" fill="white" rx="1"/>
                <circle cx="9" cy="18" r="2" fill="white"/>
                <circle cx="19" cy="18" r="2" fill="white"/>
            </svg>`;
        } else if (location.type === 'partner') {
            svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
                <rect x="8" y="12" width="12" height="8" fill="white"/>
                <rect x="10" y="8" width="8" height="4" fill="white"/>
            </svg>`;
        } else {
            svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
                <circle cx="14" cy="14" r="4" fill="white"/>
            </svg>`;
        }

        const marker = new this.AMap.Marker({
            position: [location.lng, location.lat],
            title: location.name,
            icon: new this.AMap.Icon({
                image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgIcon),
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
        
        console.log(`存储点标记添加成功: ${location.name} (${location.type})`);
        
        } catch (error) {
            console.error('添加存储点标记失败:', error);
        }
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