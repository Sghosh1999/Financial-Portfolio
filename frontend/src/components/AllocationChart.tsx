import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useState } from 'react';
import { formatCurrency } from '../utils/format';
import type { AllocationItem } from '../types';

interface AllocationChartProps {
  data: AllocationItem[];
  totalAssets: number;
}

export default function AllocationChart({ data, totalAssets }: AllocationChartProps) {
  const [showPercent, setShowPercent] = useState(false);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-dark-500">
        <p>No allocation data available</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    percent: totalAssets > 0 ? (item.value / totalAssets) * 100 : 0,
  }));

  return (
    <div className="relative">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass px-3 py-2 rounded-lg shadow-xl">
                      <p className="text-sm font-medium" style={{ color: data.color }}>
                        {data.name}
                      </p>
                      <p className="text-sm text-dark-300">
                        {formatCurrency(data.value)} ({data.percent.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {chartData.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-dark-400">
              {item.name}{' '}
              <span className="text-dark-200 font-medium">
                {showPercent
                  ? `${item.percent.toFixed(1)}%`
                  : formatCurrency(item.value, 'INR', true)}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex justify-center mt-4">
        <div className="inline-flex bg-dark-800 rounded-full p-1">
          <button
            onClick={() => setShowPercent(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              !showPercent
                ? 'bg-dark-700 text-white'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            ₹
          </button>
          <button
            onClick={() => setShowPercent(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              showPercent
                ? 'bg-dark-700 text-white'
                : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            %
          </button>
        </div>
      </div>
    </div>
  );
}
