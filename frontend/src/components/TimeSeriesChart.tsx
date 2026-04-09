import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/format';
import type { TimeSeriesPoint, TimeRange } from '../types';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  onRangeChange: (range: TimeRange) => void;
  currentRange: TimeRange;
  isLoading?: boolean;
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '6m', label: '6M' },
  { value: 'ytd', label: 'YTD' },
  { value: '1y', label: '1Y' },
  { value: '2y', label: '2Y' },
  { value: '5y', label: '5Y' },
];

export default function TimeSeriesChart({
  data,
  onRangeChange,
  currentRange,
  isLoading,
}: TimeSeriesChartProps) {
  const [hoveredValue, setHoveredValue] = useState<{ date: string; value: number } | null>(null);

  const chartData = data.map(point => ({
    date: new Date(point.date).getTime(),
    value: point.value,
  }));

  const isPositive = chartData.length >= 2 
    ? chartData[chartData.length - 1].value >= chartData[0].value
    : true;
  const color = isPositive ? '#22c55e' : '#ef4444';

  const latestValue = chartData[chartData.length - 1]?.value || 0;
  const displayValue = hoveredValue || { 
    date: chartData[chartData.length - 1]?.date 
      ? format(new Date(chartData[chartData.length - 1].date), 'MMM d, yyyy')
      : '', 
    value: latestValue 
  };

  return (
    <div className="space-y-4">
      {/* Value Display */}
      <div className="text-center">
        <p className="text-3xl font-bold font-mono">{formatCurrency(displayValue.value)}</p>
        <p className="text-sm text-dark-400">{hoveredValue?.date || 'Current Value'}</p>
      </div>

      {/* Chart */}
      <div className="h-48 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 z-10">
            <div className="w-6 h-6 border-2 border-dark-600 border-t-accent-green rounded-full animate-spin" />
          </div>
        )}
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onMouseMove={(e) => {
                if (e.activePayload && e.activePayload[0]) {
                  const payload = e.activePayload[0].payload;
                  setHoveredValue({
                    date: format(new Date(payload.date), 'MMM d, yyyy'),
                    value: payload.value,
                  });
                }
              }}
              onMouseLeave={() => setHoveredValue(null)}
            >
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => format(new Date(ts), 'MMM')}
                tick={{ fill: '#565869', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(v) => formatCurrency(v, 'INR', true)}
                tick={{ fill: '#565869', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                content={() => null}
                cursor={{ stroke: '#40414f', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill="url(#valueGradient)"
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-dark-500">
            No data available for this range
          </div>
        )}
      </div>

      {/* Range Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-dark-800 rounded-lg p-1 gap-1">
          {RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onRangeChange(value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentRange === value
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
