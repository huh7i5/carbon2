#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的CCU技术指标预测模型
使用移动平均和线性回归进行短期预测
"""

import json
import sys
import argparse
from datetime import datetime, timedelta
import math
from typing import List, Dict, Tuple

class SimpleCCUPredictor:
    def __init__(self):
        self.model_name = "Simple Linear Regression"
        self.version = "1.0.0"
        
    def load_data(self, data_path: str) -> List[Dict]:
        """加载历史数据"""
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"成功加载 {len(data)} 条历史记录")
            return data
        except FileNotFoundError:
            print(f"错误: 数据文件不存在 {data_path}")
            return []
        except json.JSONDecodeError:
            print(f"错误: 数据文件格式错误 {data_path}")
            return []
    
    def extract_time_series(self, data: List[Dict], field: str) -> Tuple[List[datetime], List[float]]:
        """提取时间序列数据"""
        timestamps = []
        values = []
        
        for record in data:
            try:
                timestamp = datetime.fromisoformat(record['timestamp'].replace('Z', '+00:00'))
                value = float(record[field])
                timestamps.append(timestamp)
                values.append(value)
            except (KeyError, ValueError) as e:
                continue
                
        return timestamps, values
    
    def moving_average_prediction(self, values: List[float], window: int = 24) -> Tuple[float, float]:
        """移动平均预测"""
        if len(values) < window:
            window = max(1, len(values))
        
        recent_values = values[-window:]
        predicted_value = sum(recent_values) / len(recent_values)
        
        # 计算预测置信度（基于方差）
        mean_val = sum(recent_values) / len(recent_values)
        variance = sum((x - mean_val) ** 2 for x in recent_values) / len(recent_values) if len(recent_values) > 1 else 0
        confidence = max(0.6, 1.0 - variance / (predicted_value ** 2) if predicted_value != 0 else 0.8)
        
        return predicted_value, min(0.99, confidence)
    
    def linear_trend_prediction(self, values: List[float], steps: int = 1) -> Tuple[List[float], List[float]]:
        """线性趋势预测"""
        if len(values) < 2:
            base_value = values[0] if values else 0
            return [base_value] * steps, [0.7] * steps
        
        # 使用最后48个数据点（2天）计算趋势
        recent_window = min(48, len(values))
        recent_values = values[-recent_window:]
        
        # 计算线性回归
        x = list(range(len(recent_values)))
        y = recent_values
        
        # 简单的最小二乘法
        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(xi * xi for xi in x)
        
        # 计算斜率和截距
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        intercept = (sum_y - slope * sum_x) / n
        
        # 预测未来值
        predictions = []
        confidences = []
        
        for i in range(1, steps + 1):
            next_x = len(recent_values) + i - 1
            predicted_value = slope * next_x + intercept
            
            # 计算置信度（随时间递减）
            base_confidence = 0.95
            time_decay = 0.02 * i  # 每小时置信度降低2%
            confidence = max(0.6, base_confidence - time_decay)
            
            predictions.append(predicted_value)
            confidences.append(confidence)
        
        return predictions, confidences
    
    def predict_metric(self, data: List[Dict], metric: str, horizon: int = 24) -> Dict:
        """预测指定指标"""
        timestamps, values = self.extract_time_series(data, metric)
        
        if not values:
            return {
                "error": f"无法提取指标 {metric} 的数据"
            }
        
        # 获取基准时间
        base_time = timestamps[-1] if timestamps else datetime.now()
        
        # 生成预测
        predictions, confidences = self.linear_trend_prediction(values, horizon)
        
        # 构建预测结果
        prediction_records = []
        for i, (pred_value, confidence) in enumerate(zip(predictions, confidences)):
            pred_time = base_time + timedelta(hours=i + 1)
            prediction_records.append({
                "timestamp": pred_time.isoformat(),
                "predicted_value": round(pred_value, 2),
                "confidence": round(confidence, 3),
                "metric": metric
            })
        
        # 计算整体统计
        recent_avg = sum(values[-24:]) / min(24, len(values)) if values else 0
        prediction_avg = sum(predictions) / len(predictions) if predictions else 0
        trend = "上升" if prediction_avg > recent_avg else "下降" if prediction_avg < recent_avg else "稳定"
        
        return {
            "model": self.model_name,
            "metric": metric,
            "horizon_hours": horizon,
            "base_time": base_time.isoformat(),
            "predictions": prediction_records,
            "summary": {
                "recent_average": round(recent_avg, 2),
                "predicted_average": round(prediction_avg, 2),
                "trend": trend,
                "min_confidence": round(min(confidences), 3),
                "max_confidence": round(max(confidences), 3)
            }
        }
    
    def multi_metric_prediction(self, data: List[Dict], metrics: List[str], horizon: int = 24) -> Dict:
        """多指标预测"""
        results = {}
        
        for metric in metrics:
            print(f"预测指标: {metric}")
            result = self.predict_metric(data, metric, horizon)
            results[metric] = result
        
        return {
            "model_info": {
                "name": self.model_name,
                "version": self.version,
                "timestamp": datetime.now().isoformat()
            },
            "prediction_results": results
        }

def main():
    parser = argparse.ArgumentParser(description='CCU技术指标预测器')
    parser.add_argument('--data', type=str, required=True, help='历史数据文件路径')
    parser.add_argument('--output', type=str, default='./predictions.json', help='预测结果输出文件')
    parser.add_argument('--metrics', type=str, default='co2_capture_rate,methanol_yield,energy_consumption', 
                       help='要预测的指标列表（逗号分隔）')
    parser.add_argument('--horizon', type=int, default=24, help='预测时长（小时）')
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("CCU技术指标预测器")
    print("=" * 50)
    
    try:
        predictor = SimpleCCUPredictor()
        
        # 加载数据
        data = predictor.load_data(args.data)
        if not data:
            sys.exit(1)
        
        # 解析要预测的指标
        metrics = [m.strip() for m in args.metrics.split(',')]
        print(f"预测指标: {', '.join(metrics)}")
        print(f"预测时长: {args.horizon} 小时")
        
        # 执行预测
        prediction_results = predictor.multi_metric_prediction(data, metrics, args.horizon)
        
        # 保存结果
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(prediction_results, f, ensure_ascii=False, indent=2)
        
        print(f"预测结果已保存到: {args.output}")
        
        # 显示摘要
        print("\n预测摘要:")
        for metric, result in prediction_results['prediction_results'].items():
            if 'error' not in result:
                summary = result['summary']
                print(f"  {metric}:")
                print(f"    近期平均: {summary['recent_average']}")
                print(f"    预测平均: {summary['predicted_average']}")
                print(f"    趋势: {summary['trend']}")
                print(f"    置信度范围: {summary['min_confidence']:.1%} - {summary['max_confidence']:.1%}")
        
    except Exception as e:
        print(f"预测失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()