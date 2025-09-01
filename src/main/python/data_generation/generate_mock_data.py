#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
沪碳智脑 - CCU技术运行数据生成器
生成用于演示的模拟CCU技术运行数据
"""

import json
import os
import sys
import argparse
from datetime import datetime, timedelta
import random
import math

class CCUDataGenerator:
    def __init__(self):
        self.base_time = datetime.now()
        
        # CCU技术运行参数范围
        self.params = {
            'flue_gas_flow_rate': {'min': 12000, 'max': 18000, 'unit': 'm³/h'},
            'co2_concentration_in': {'min': 10, 'max': 18, 'unit': '%'},
            'co2_concentration_out': {'min': 0.8, 'max': 3.0, 'unit': '%'},
            'co2_capture_rate': {'min': 75, 'max': 98, 'unit': '%'},
            'solvent_flow_rate': {'min': 150, 'max': 250, 'unit': 't/h'},
            'energy_consumption': {'min': 2.5, 'max': 5.0, 'unit': 'GJ/tCO2'},
            'methanol_yield': {'min': 15, 'max': 30, 'unit': 't/h'},
        }
        
        # 经济参数
        self.economic_params = {
            'electricity_price': {'peak': 0.92, 'normal': 0.63, 'valley': 0.35, 'unit': '元/kWh'},
            'solvent_price': {'min': 2600, 'max': 3200, 'unit': '元/吨'},
            'methanol_market_price': {'min': 2900, 'max': 3500, 'unit': '元/吨'},
            'operational_cost_hourly': {'min': 10000, 'max': 15000, 'unit': '元/小时'}
        }

    def get_electricity_price(self, hour):
        """获取分时电价"""
        if 8 <= hour < 11 or 18 <= hour < 21:
            return self.economic_params['electricity_price']['peak']  # 峰时
        elif hour >= 23 or hour < 7:
            return self.economic_params['electricity_price']['valley']  # 谷时
        else:
            return self.economic_params['electricity_price']['normal']  # 平时

    def generate_single_record(self, timestamp):
        """生成单条运行记录"""
        hour = timestamp.hour
        day_factor = math.sin(2 * math.pi * timestamp.hour / 24) * 0.1
        seasonal_factor = math.sin(2 * math.pi * timestamp.timetuple().tm_yday / 365) * 0.05
        
        # 基础捕集率（受时间影响）
        base_capture_rate = 85 + random.random() * 10 + day_factor * 5 + seasonal_factor * 3
        capture_rate = max(self.params['co2_capture_rate']['min'], 
                          min(self.params['co2_capture_rate']['max'], base_capture_rate))
        
        # 烟道气参数
        flue_gas_flow = (self.params['flue_gas_flow_rate']['min'] + 
                        random.random() * (self.params['flue_gas_flow_rate']['max'] - 
                                         self.params['flue_gas_flow_rate']['min']))
        
        co2_in = (self.params['co2_concentration_in']['min'] + 
                 random.random() * (self.params['co2_concentration_in']['max'] - 
                                   self.params['co2_concentration_in']['min']))
        
        co2_out = co2_in * (1 - capture_rate / 100) + random.random() * 0.2
        
        # 溶剂和能耗参数
        solvent_flow = (self.params['solvent_flow_rate']['min'] + 
                       random.random() * (self.params['solvent_flow_rate']['max'] - 
                                         self.params['solvent_flow_rate']['min']))
        
        energy_consumption = (self.params['energy_consumption']['min'] + 
                            random.random() * (self.params['energy_consumption']['max'] - 
                                             self.params['energy_consumption']['min']))
        
        # 甲醇产量（与捕集率相关）
        methanol_base = self.params['methanol_yield']['min'] + (capture_rate - 75) / (98 - 75) * \
                       (self.params['methanol_yield']['max'] - self.params['methanol_yield']['min'])
        methanol_yield = methanol_base + random.random() * 3 - 1.5
        
        # 经济参数
        electricity_price = self.get_electricity_price(hour)
        solvent_price = (self.economic_params['solvent_price']['min'] + 
                        random.random() * (self.economic_params['solvent_price']['max'] - 
                                          self.economic_params['solvent_price']['min']))
        
        methanol_market_price = (self.economic_params['methanol_market_price']['min'] + 
                               random.random() * (self.economic_params['methanol_market_price']['max'] - 
                                                 self.economic_params['methanol_market_price']['min']))
        
        operational_cost = (self.economic_params['operational_cost_hourly']['min'] + 
                          random.random() * (self.economic_params['operational_cost_hourly']['max'] - 
                                            self.economic_params['operational_cost_hourly']['min']))
        
        # 计算收入和利润
        revenue = methanol_yield * methanol_market_price
        profit = revenue - operational_cost
        
        return {
            'timestamp': timestamp.isoformat(),
            'flue_gas_flow_rate': round(flue_gas_flow, 1),
            'co2_concentration_in': round(co2_in, 2),
            'co2_concentration_out': round(co2_out, 2),
            'co2_capture_rate': round(capture_rate, 2),
            'solvent_flow_rate': round(solvent_flow, 1),
            'energy_consumption': round(energy_consumption, 2),
            'methanol_yield': round(methanol_yield, 2),
            'electricity_price': electricity_price,
            'solvent_price': round(solvent_price, 2),
            'methanol_market_price': round(methanol_market_price, 2),
            'operational_cost': round(operational_cost, 2),
            'revenue': round(revenue, 2),
            'profit': round(profit, 2)
        }

    def generate_historical_data(self, hours=720):
        """生成历史数据（默认30天）"""
        data = []
        start_time = self.base_time - timedelta(hours=hours)
        
        print(f"生成历史数据：{hours}小时（{hours/24:.1f}天）")
        
        for i in range(hours + 1):
            timestamp = start_time + timedelta(hours=i)
            record = self.generate_single_record(timestamp)
            data.append(record)
            
            if (i + 1) % 100 == 0:
                print(f"进度: {i+1}/{hours+1} ({(i+1)/(hours+1)*100:.1f}%)")
        
        return data

    def generate_realtime_data(self):
        """生成实时数据"""
        return self.generate_single_record(self.base_time)

    def calculate_statistics(self, data):
        """计算数据统计信息"""
        if not data:
            return {}
        
        stats = {}
        numeric_fields = [
            'co2_capture_rate', 'energy_consumption', 'methanol_yield',
            'revenue', 'profit', 'flue_gas_flow_rate'
        ]
        
        for field in numeric_fields:
            values = [record[field] for record in data if field in record]
            if values:
                stats[field] = {
                    'min': min(values),
                    'max': max(values),
                    'avg': sum(values) / len(values),
                    'count': len(values)
                }
        
        return stats

    def save_data(self, data, output_dir, filename):
        """保存数据到文件"""
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"数据已保存到: {filepath}")
        return filepath

def main():
    parser = argparse.ArgumentParser(description='CCU技术运行数据生成器')
    parser.add_argument('--hours', type=int, default=720, help='生成数据的小时数（默认720小时=30天）')
    parser.add_argument('--output', type=str, default='./data', help='输出目录')
    parser.add_argument('--realtime-only', action='store_true', help='只生成实时数据')
    parser.add_argument('--with-stats', action='store_true', help='生成统计信息')
    
    args = parser.parse_args()
    
    generator = CCUDataGenerator()
    
    print("=" * 50)
    print("沪碳智脑 CCU技术数据生成器")
    print("=" * 50)
    
    try:
        if args.realtime_only:
            # 只生成实时数据
            realtime_data = generator.generate_realtime_data()
            generator.save_data(realtime_data, args.output, 'realtime_data.json')
            print(f"实时数据生成完成: {realtime_data['timestamp']}")
            
        else:
            # 生成历史数据
            historical_data = generator.generate_historical_data(args.hours)
            generator.save_data(historical_data, args.output, 'historical_data.json')
            
            # 生成实时数据（取最后一条记录）
            realtime_data = historical_data[-1] if historical_data else generator.generate_realtime_data()
            generator.save_data(realtime_data, args.output, 'realtime_data.json')
            
            print(f"历史数据生成完成: {len(historical_data)} 条记录")
            print(f"数据时间范围: {historical_data[0]['timestamp']} 至 {historical_data[-1]['timestamp']}")
            
            # 生成统计信息
            if args.with_stats:
                stats = generator.calculate_statistics(historical_data)
                generator.save_data(stats, args.output, 'statistics.json')
                print("统计信息生成完成")
        
        print("=" * 50)
        print("数据生成任务完成")
        
    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()