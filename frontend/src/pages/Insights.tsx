import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../api';
import type { InsightsSummary, DashboardSummary, MonthlySavings } from '../types';
import { formatCurrency, formatPercent } from '../utils/format';
import InsightCard from '../components/InsightCard';
import { useAuth } from '../context/AuthContext';
import { exportPortfolioToFile } from '../utils/portfolioExport';
import { Download, Loader2 } from 'lucide-react';

export default function Insights() {
  const { user } = useAuth();
  const [data, setData] = useState<InsightsSummary | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsData, dashboard] = await Promise.all([
          api.insights.get(),
          api.dashboard.get(),
        ]);
        setData(insightsData);
        setDashboardData(dashboard);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-dark-600 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dark-500">
        Failed to load insights
      </div>
    );
  }

  const formatMonthChange = () => {
    const sign = data.month_change >= 0 ? '+' : '';
    return `${sign}${formatCurrency(data.month_change, 'INR', true)}`;
  };

  const handleExport = async () => {
    if (!user?.email) return;
    setExporting(true);
    try {
      await exportPortfolioToFile(user.email, user.name);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const allocationData = dashboardData?.allocation.map(item => ({
    name: item.name,
    value: item.value,
    color: item.color,
    percent: dashboardData.total_assets > 0 
      ? ((item.value / dashboardData.total_assets) * 100).toFixed(1)
      : '0',
  })) || [];

  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, outerRadius, percent, name, value 
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    percent: number;
    name: string;
    value: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#d9d9e3"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs"
      >
        <tspan x={x} dy="-0.5em" className="font-medium">{name}</tspan>
        <tspan x={x} dy="1.2em" className="text-dark-400">
          {formatCurrency(value, 'INR', true)} ({(percent * 100).toFixed(1)}%)
        </tspan>
      </text>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Insights</h1>
            <p className="text-sm text-dark-400">Your financial health at a glance</p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || !user?.email}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-600 text-sm font-medium text-dark-200 disabled:opacity-50 transition-colors shrink-0"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Export portfolio
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Primary Insights Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InsightCard
            title="Total Net Worth"
            value={formatCurrency(data.net_worth, 'INR', true)}
            icon={<Wallet size={20} />}
            color="green"
            index={0}
          />
          <InsightCard
            title="This Month"
            value={formatMonthChange()}
            subtitle={data.month_change_percent !== null ? formatPercent(data.month_change_percent) : undefined}
            icon={<TrendingUp size={20} />}
            color={data.month_change >= 0 ? 'green' : 'red'}
            index={1}
          />
          <InsightCard
            title="Avg. Monthly Savings"
            value={formatCurrency(data.avg_monthly_savings, 'INR', true)}
            icon={<PiggyBank size={20} />}
            color="blue"
            index={2}
          />
          <InsightCard
            title="All-Time High"
            value={formatCurrency(data.all_time_high, 'INR', true)}
            subtitle={data.all_time_high_date ? new Date(data.all_time_high_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Current'}
            icon={<Trophy size={20} />}
            color="yellow"
            index={3}
          />
        </div>

        {/* Allocation Pie Chart with Annotations */}
        {allocationData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-light rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent-green/20">
                <PiggyBank size={18} className="text-accent-green" />
              </div>
              <div>
                <p className="font-medium">Asset Allocation</p>
                <p className="text-xs text-dark-400">Distribution by category</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={true}
                    label={renderCustomizedLabel}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="glass px-3 py-2 rounded-lg shadow-xl">
                            <p className="text-sm font-medium" style={{ color: item.color }}>
                              {item.name}
                            </p>
                            <p className="text-sm text-dark-300">
                              {formatCurrency(item.value)} ({item.percent}%)
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
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {allocationData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-dark-300">
                    {item.name}: <span className="font-medium text-dark-100">{formatCurrency(item.value, 'INR', true)}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Monthly savings + growth rate (composed) */}
        {data.monthly_savings && data.monthly_savings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-light rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent-blue/20">
                <BarChart3 size={18} className="text-accent-blue" />
              </div>
              <div>
                <p className="font-medium">Monthly savings & growth rate</p>
                <p className="text-xs text-dark-400">
                  Bars: net worth change vs prior month · Line: % change vs prior month-end net worth
                </p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data.monthly_savings}
                  margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.35} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#8e8ea0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#8e8ea0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCurrency(v, 'INR', true)}
                    width={64}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#a78bfa', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v.toFixed(1)}%`}
                    width={48}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const row = payload[0].payload as MonthlySavings;
                        const sav = row.savings;
                        const rate = row.savings_rate_percent;
                        const nw = row.net_worth_end;
                        return (
                          <div className="glass px-3 py-2 rounded-lg shadow-xl max-w-xs">
                            <p className="text-sm font-medium text-dark-200 mb-1">{label}</p>
                            <p className={`text-sm font-semibold ${sav >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                              Δ NW: {sav >= 0 ? '+' : ''}{formatCurrency(sav)}
                            </p>
                            {rate != null && (
                              <p className="text-sm text-accent-purple mt-1">
                                Growth rate: {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
                              </p>
                            )}
                            {nw != null && (
                              <p className="text-xs text-dark-400 mt-1">
                                Month-end net worth: {formatCurrency(nw, 'INR', true)}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => (
                      <span className="text-dark-400">{value}</span>
                    )}
                  />
                  <Bar yAxisId="left" dataKey="savings" name="Monthly savings" radius={[4, 4, 0, 0]}>
                    {data.monthly_savings.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.savings >= 0 ? '#22c55e' : '#ef4444'}
                        fillOpacity={0.75}
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="savings_rate_percent"
                    name="Growth rate %"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#a78bfa' }}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        {/* Net worth trajectory (month-end snapshots) */}
        {data.monthly_savings?.some(m => m.net_worth_end != null) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-light rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent-green/20">
                <TrendingUp size={18} className="text-accent-green" />
              </div>
              <div>
                <p className="font-medium">Net worth trajectory</p>
                <p className="text-xs text-dark-400">Estimated month-end net worth (same window as above)</p>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data.monthly_savings.filter(m => m.net_worth_end != null)}
                  margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="nwInsightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.35} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#8e8ea0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#8e8ea0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                    width={56}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload?.length) {
                        const v = payload[0].value as number;
                        return (
                          <div className="glass px-3 py-2 rounded-lg shadow-xl">
                            <p className="text-sm text-dark-200">{label}</p>
                            <p className="text-sm font-semibold text-accent-green">{formatCurrency(v)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="net_worth_end"
                    name="Net worth"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#nwInsightGrad)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        {/* Quarterly Savings Bar Chart */}
        {data.quarterly_savings && data.quarterly_savings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-light rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-accent-purple/20">
                <Calendar size={18} className="text-accent-purple" />
              </div>
              <div>
                <p className="font-medium">Quarterly Savings</p>
                <p className="text-xs text-dark-400">Net worth change per quarter</p>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.quarterly_savings} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis 
                    dataKey="quarter" 
                    tick={{ fill: '#8e8ea0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#8e8ea0', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCurrency(v, 'INR', true)}
                    width={60}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const value = payload[0].value as number;
                        return (
                          <div className="glass px-3 py-2 rounded-lg shadow-xl">
                            <p className="text-sm font-medium text-dark-200">{label}</p>
                            <p className={`text-sm font-semibold ${value >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                              {value >= 0 ? '+' : ''}{formatCurrency(value)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
                    {data.quarterly_savings.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.savings >= 0 ? '#8b5cf6' : '#ef4444'}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        {/* Secondary Insights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold mb-4">More Insights</h2>

          {/* Movers */}
          <div className="grid grid-cols-2 gap-4">
            {data.biggest_gainer && (
              <div className="glass-light rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-accent-green/20">
                    <ArrowUpRight size={16} className="text-accent-green" />
                  </div>
                  <span className="text-xs text-dark-400">Biggest Gainer</span>
                </div>
                <p className="font-medium truncate">{data.biggest_gainer.name}</p>
                <p className="text-sm text-accent-green">
                  {formatPercent(data.biggest_gainer.change_percent)}
                </p>
              </div>
            )}

            {data.biggest_loser && (
              <div className="glass-light rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-accent-red/20">
                    <ArrowDownRight size={16} className="text-accent-red" />
                  </div>
                  <span className="text-xs text-dark-400">Biggest Decline</span>
                </div>
                <p className="font-medium truncate">{data.biggest_loser.name}</p>
                <p className="text-sm text-accent-red">
                  {formatPercent(data.biggest_loser.change_percent)}
                </p>
              </div>
            )}
          </div>

          {/* Liability Ratio */}
          {data.liability_ratio !== null && (
            <div className="glass-light rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent-purple/20">
                    <Scale size={18} className="text-accent-purple" />
                  </div>
                  <div>
                    <p className="font-medium">Liability-to-Asset Ratio</p>
                    <p className="text-xs text-dark-400">Lower is generally better</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-mono">
                  {(data.liability_ratio ?? 0).toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(data.liability_ratio ?? 0, 100)}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    (data.liability_ratio ?? 0) < 30
                      ? 'bg-accent-green'
                      : (data.liability_ratio ?? 0) < 60
                      ? 'bg-accent-yellow'
                      : 'bg-accent-red'
                  }`}
                />
              </div>

              <div className="flex justify-between mt-2 text-xs text-dark-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Financial Health Tips */}
          <div className="glass-light rounded-xl p-5">
            <h3 className="font-medium mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-dark-300">
              <li className="flex items-start gap-2">
                <span className="text-accent-green">•</span>
                {data.month_change >= 0
                  ? "Great progress this month! Keep up the momentum."
                  : "Your net worth dipped this month. Review your expenses."}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-blue">•</span>
                {data.liability_ratio != null && data.liability_ratio < 30
                  ? "Your liability ratio is healthy. Consider investing more."
                  : "Focus on reducing liabilities to improve your financial health."}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-yellow">•</span>
                Update your asset values regularly for accurate tracking.
              </li>
            </ul>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
