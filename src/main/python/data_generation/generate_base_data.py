#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
沪碳智脑基础数据生成脚本
"""
import json
import os
import sys
from datetime import datetime, timedelta
import random
import math

def generate_ccu_data(hours=720):
    """生成CCU运行数据"""
    data = []
    base_time = datetime.now() - timedelta(hours=hours)
    
    for i in range(hours):
        timestamp = base_time + timedelta(hours=i)
        
        # 基础参数
        base_capture = 85 + random.random() * 10  # 85-95%
        capture_rate = max(75, min(98, base_capture + math.sin(i / 24) * 3))
        
        record = {
            "timestamp": timestamp.isoformat(),
            "flue_gas_flow_rate": 15000 + random.random() * 3000,
            "co2_concentration_in": 12 + random.random() * 3,
            "co2_concentration_out": 1.5 + random.random() * 0.8,
            "co2_capture_rate": capture_rate,
            "solvent_flow_rate": 180 + random.random() * 40,
            "energy_consumption": 3.2 + random.random() * 0.8,
            "methanol_yield": 18 + random.random() * 8,
            "electricity_price": get_electricity_price(timestamp.hour),
            "solvent_price": 2800 + random.random() * 200,
            "methanol_market_price": 3200 + random.random() * 300,
            "operational_cost": 12000 + random.random() * 2000
        }
        
        # 计算收益
        record["revenue"] = record["methanol_yield"] * record["methanol_market_price"]
        record["profit"] = record["revenue"] - record["operational_cost"]
        
        data.append(record)
    
    return data

def get_electricity_price(hour):
    """获取分时电价"""
    if 8 <= hour < 11 or 18 <= hour < 21:
        return 0.92  # 峰时
    elif hour >= 23 or hour < 7:
        return 0.35  # 谷时
    else:
        return 0.63  # 平时

def main():
    try:
        # 生成历史数据
        historical_data = generate_ccu_data(720)
        
        # 保存数据
        output_dir = sys.argv[1] if len(sys.argv) > 1 else './data'
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, 'historical_data.json'), 'w', encoding='utf-8') as f:
            json.dump(historical_data, f, ensure_ascii=False, indent=2)
        
        # 生成最新数据作为实时数据
        realtime_data = historical_data[-1]
        with open(os.path.join(output_dir, 'realtime_data.json'), 'w', encoding='utf-8') as f:
            json.dump(realtime_data, f, ensure_ascii=False, indent=2)
        
        print(f"数据生成完成，共生成{len(historical_data)}条记录")
        
    except Exception as e:
        print(f"数据生成失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
