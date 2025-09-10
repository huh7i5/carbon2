#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的HTTP服务器，支持GET和POST请求
用于前端开发，代理POST请求到后端服务
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import sys
import os
from urllib.error import URLError

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    
    def do_POST(self):
        """处理POST请求，代理到后端服务"""
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # 构建后端URL
            backend_url = f"http://localhost:3000{self.path}"
            print(f"代理POST请求: {self.path} -> {backend_url}")
            
            # 创建代理请求
            req = urllib.request.Request(
                backend_url,
                data=post_data,
                headers={'Content-Type': 'application/json'}
            )
            
            # 发送请求到后端
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    response_data = response.read()
                    
                    # 返回后端响应
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                    self.end_headers()
                    self.wfile.write(response_data)
                    
                    print(f"代理成功: {len(response_data)} bytes")
                    
            except URLError as e:
                print(f"后端连接失败: {e}")
                # 返回错误响应
                self.send_response(503)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {
                    'success': False,
                    'error': '后端服务不可用',
                    'message': str(e)
                }
                self.wfile.write(json.dumps(error_response).encode())
                
        except Exception as e:
            print(f"POST请求处理失败: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                'success': False,
                'error': '内部服务器错误',
                'message': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """处理CORS预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """处理GET请求"""
        # API请求代理到后端
        if self.path.startswith('/api/'):
            try:
                backend_url = f"http://localhost:3000{self.path}"
                print(f"代理GET请求: {self.path} -> {backend_url}")
                
                with urllib.request.urlopen(backend_url, timeout=10) as response:
                    response_data = response.read()
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(response_data)
                    
            except URLError as e:
                print(f"后端连接失败: {e}")
                self.send_response(503)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {
                    'success': False,
                    'error': '后端服务不可用'
                }
                self.wfile.write(json.dumps(error_response).encode())
        else:
            # 静态文件请求
            super().do_GET()
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")

def run_server(port=8080):
    """启动服务器"""
    handler = ProxyHTTPRequestHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"启动前端代理服务器，端口: {port}")
        print(f"支持POST请求代理到后端服务")
        print(f"访问: http://localhost:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run_server(port)