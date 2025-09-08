// 测试后端LLM API
const https = require('https');

async function testLLMAPI() {
    const postData = JSON.stringify({
        message: "分析一下当前的CO2捕集数据",
        context: "kpi",
        data: { co2_capture_rate: 85, energy_consumption: 3.2 }
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/llm/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('状态码:', res.statusCode);
                console.log('响应:', data);
                resolve(data);
            });
        });

        req.on('error', (error) => {
            console.error('请求错误:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

testLLMAPI().catch(console.error);