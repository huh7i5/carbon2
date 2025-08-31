// 工具函数库
class Utils {
    // 格式化数字
    static formatNumber(num, decimals = 2) {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString('zh-CN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // 格式化百分比
    static formatPercent(num, decimals = 1) {
        if (typeof num !== 'number') return '0%';
        return `${(num).toFixed(decimals)}%`;
    }

    // 格式化货币
    static formatCurrency(num, currency = '¥') {
        if (typeof num !== 'number') return currency + '0';
        return currency + num.toLocaleString('zh-CN');
    }

    // 格式化日期时间
    static formatDateTime(date, format = 'datetime') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const options = {
            datetime: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            },
            date: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            },
            time: {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            },
            short: {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }
        };

        return d.toLocaleString('zh-CN', options[format] || options.datetime);
    }

    // 格式化文件大小
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 深度克隆对象
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }

    // 防抖函数
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 生成UUID
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 获取随机颜色
    static getRandomColor() {
        const colors = [
            '#00d4aa', '#007a8c', '#ffc107', '#ff6b6b',
            '#2196f3', '#9c27b0', '#4caf50', '#ff9800',
            '#e91e63', '#673ab7', '#009688', '#795548'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // 计算两点间距离(经纬度)
    static calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 地球半径(公里)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // 数组去重
    static uniqueArray(arr, key = null) {
        if (key) {
            const seen = new Set();
            return arr.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        return [...new Set(arr)];
    }

    // 数组分组
    static groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    // 数组排序
    static sortBy(arr, key, order = 'asc') {
        return [...arr].sort((a, b) => {
            let aVal = key ? a[key] : a;
            let bVal = key ? b[key] : b;
            
            // 处理字符串数字
            if (typeof aVal === 'string' && !isNaN(aVal)) aVal = parseFloat(aVal);
            if (typeof bVal === 'string' && !isNaN(bVal)) bVal = parseFloat(bVal);
            
            if (order === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    }

    // 下载文件
    static downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // 复制到剪贴板
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    }

    // 检测设备类型
    static getDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
        const isTablet = /tablet|ipad/i.test(userAgent);
        
        if (isMobile && !isTablet) return 'mobile';
        if (isTablet) return 'tablet';
        return 'desktop';
    }

    // 获取浏览器信息
    static getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        let version = '0';

        const browsers = [
            { name: 'Chrome', regex: /Chrome\/(\d+)/ },
            { name: 'Firefox', regex: /Firefox\/(\d+)/ },
            { name: 'Safari', regex: /Safari\/(\d+)/ },
            { name: 'Edge', regex: /Edge\/(\d+)/ },
            { name: 'IE', regex: /MSIE (\d+)|Trident.*rv:(\d+)/ }
        ];

        for (const b of browsers) {
            const match = userAgent.match(b.regex);
            if (match) {
                browser = b.name;
                version = match[1] || match[2] || '0';
                break;
            }
        }

        return { browser, version };
    }

    // 验证数据
    static validateData(data, schema) {
        const errors = [];
        
        for (const field in schema) {
            const rules = schema[field];
            const value = data[field];
            
            // 必填验证
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} 是必填项`);
                continue;
            }
            
            if (value === undefined || value === null || value === '') continue;
            
            // 类型验证
            if (rules.type && typeof value !== rules.type) {
                errors.push(`${field} 类型错误，期望 ${rules.type}`);
                continue;
            }
            
            // 范围验证
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} 不能小于 ${rules.min}`);
            }
            
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} 不能大于 ${rules.max}`);
            }
            
            // 正则验证
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${field} 格式不正确`);
            }
        }
        
        return errors;
    }

    // 简单的数据加密/解密 (仅用于演示，不适用于敏感数据)
    static simpleEncrypt(text, key = 'carbon-brain') {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(result);
    }

    static simpleDecrypt(encryptedText, key = 'carbon-brain') {
        try {
            const text = atob(encryptedText);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return result;
        } catch (e) {
            return null;
        }
    }

    // 性能监测
    static performanceTimer(name) {
        const startTime = performance.now();
        
        return {
            end: () => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                console.log(`性能监测 [${name}]: ${duration.toFixed(2)}ms`);
                return duration;
            }
        };
    }

    // 本地存储封装
    static storage = {
        set: (key, value, expire = null) => {
            try {
                const data = {
                    value,
                    expire: expire ? Date.now() + expire : null
                };
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.warn('localStorage 存储失败:', e);
                return false;
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                if (!item) return defaultValue;
                
                const data = JSON.parse(item);
                
                // 检查是否过期
                if (data.expire && Date.now() > data.expire) {
                    localStorage.removeItem(key);
                    return defaultValue;
                }
                
                return data.value;
            } catch (e) {
                console.warn('localStorage 读取失败:', e);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('localStorage 删除失败:', e);
                return false;
            }
        },

        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.warn('localStorage 清空失败:', e);
                return false;
            }
        }
    };

    // URL参数解析
    static getUrlParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }

    // 设置URL参数
    static setUrlParams(params, replace = false) {
        const urlParams = new URLSearchParams(window.location.search);
        
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined) {
                urlParams.delete(key);
            } else {
                urlParams.set(key, params[key]);
            }
        });
        
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        
        if (replace) {
            window.history.replaceState({}, '', newUrl);
        } else {
            window.history.pushState({}, '', newUrl);
        }
    }
}

// 导出工具类
window.Utils = Utils;