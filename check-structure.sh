#!/bin/bash

echo "=== 沪碳智脑项目文件结构检查 ==="
echo ""

# 检查主要文件是否存在
files=(
    "index.html"
    "src/main/frontend/html/index.html"
    "test-map.html"
    "start-frontend.sh"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - 存在"
    else
        echo "❌ $file - 缺失"
    fi
done

echo ""
echo "=== 前端文件详情 ==="
echo "主页文件大小: $(du -h index.html 2>/dev/null | cut -f1 || echo '不存在')"
echo "主控制台文件大小: $(du -h src/main/frontend/html/index.html 2>/dev/null | cut -f1 || echo '不存在')"
echo "地图测试文件大小: $(du -h test-map.html 2>/dev/null | cut -f1 || echo '不存在')"

echo ""
echo "=== 启动建议 ==="
echo "1. 运行 './start-frontend.sh' 启动服务器"
echo "2. 或者运行 'python3 -m http.server 8081'"
echo "3. 访问 http://localhost:8081 查看主页"
echo "4. 访问 http://localhost:8081/src/main/frontend/html/index.html 查看完整界面"