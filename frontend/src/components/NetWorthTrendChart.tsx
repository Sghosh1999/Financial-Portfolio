import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../api';
import { formatCurrency } from '../utils/format';
import type { TimeRange, NetWorthHistoryPoint } from '../types';

interface NetWorthTrendChartProps {
  compact?: boolean;
}

export default function NetWorthTrendChart({ compact = false }: NetWorthTrendChartProps) {
  const [data, setData] = useState<NetWorthHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>('1y');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.networthHistory.get(range);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch net worth history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [range]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-48' : 'h-72'}`}>
        <div className="w-6 h-6 border-2 border-dark-600 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'h-48' : 'h-72'} text-dark-500`}>
        <p>No trend data available</p>
        <p className="text-sm mt-1">Add entries to see your net worth trend</p>
      </div>
    );
  }

  const chartData = data.map(point => ({
    ...point,
    date: point.date,
    displayDate: format(parseISO(point.date), 'MMM dd'),
  }));

  const firstValue = chartData[0]?.net_worth || 0;
  const lastValue = chartData[chartData.length - 1]?.net_worth || 0;
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  const minValue = Math.min(...chartData.map(d => d.net_worth));
  const maxValue = Math.max(...chartData.map(d => d.net_worth));
  const avgValue = chartData.reduce((sum, d) => sum + d.net_worth, 0) / chartData.length;

  const ranges: { label: string; value: TimeRange }[] = [
    { label: '6M', value: '6m' },
    { label: 'YTD', value: 'ytd' },
    { label: '1Y', value: '1y' },
    { label: '2Y', value: '2y' },
    { label: 'All', value: 'all' },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="glass px-4 py-3 rounded-xl shadow-xl border border-dark-700/50">
          <p className="text-xs text-dark-400 mb-1">
            {format(parseISO(point.date), 'MMM dd, yyyy')}
          </p>
          <p className="text-lg font-bold text-white">
            {formatCurrency(point.net_worth)}
          </p>
          <div className="flex gap-4 mt-2 text-xs">
            <div>
              <span className="text-dark-400">Assets: </span>
              <span className="text-accent-green">{formatCurrency(point.assets, 'INR', true)}</span>
            </div>
            <div>
              <span className="text-dark-400">Liabilities: </span>
              <span className="text-accent-red">{formatCurrency(point.liabilities, 'INR', true)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-dark-400">Net Worth Trend</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
            <span className="text-xs text-dark-500">
              ({isPositive ? '+' : ''}{formatCurrency(change, 'INR', true)})
            </span>
          </div>
        </div>

        {/* Range selector */}
        <div className="flex bg-dark-800 rounded-lg p-1">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                range === r.value
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className={compact ? 'h-48' : 'h-64'}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="50%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0.1}
                />
                <stop
                  offset="100%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={isPositive ? '#059669' : '#dc2626'} />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
              width={55}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgValue}
              stroke="#6b7280"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="net_worth"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: isPositive ? '#10b981' : '#ef4444',
                stroke: '#1f2937',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      {!compact && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-dark-700/50">
          <div className="text-center">
            <p className="text-xs text-dark-500 mb-1">Highest</p>
            <p className="text-sm font-semibold text-accent-green">
              {formatCurrency(maxValue, 'INR', true)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-500 mb-1">Average</p>
            <p className="text-sm font-semibold text-dark-300">
              {formatCurrency(avgValue, 'INR', true)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-500 mb-1">Lowest</p>
            <p className="text-sm font-semibold text-accent-red">
              {formatCurrency(minValue, 'INR', true)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
