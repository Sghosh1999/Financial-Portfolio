import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function Sparkline({ 
  data, 
  color = '#22c55e',
  height = 32 
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ height }} className="flex items-center justify-center text-dark-600 text-xs">—</div>;
  }

  const chartData = data.map((value, index) => ({ value, index }));
  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div style={{ height, width: 80 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color === 'auto' ? lineColor : color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
