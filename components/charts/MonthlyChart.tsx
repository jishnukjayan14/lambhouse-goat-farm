'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getShortMonthName } from '@/lib/utils';
import type { MonthlyRevenue } from '@/lib/types';

interface MonthlyChartProps {
  data: MonthlyRevenue[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium">
            {String.fromCharCode(8377)}{entry.value.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.map((d) => ({
    name: `${getShortMonthName(d.month)} ${String(d.year).slice(-2)}`,
    Revenue: Math.round(d.total_revenue),
    Expenses: Math.round(d.total_expenses),
    Profit: Math.round(d.net_profit),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${String.fromCharCode(8377)}${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
        <Bar dataKey="Revenue" fill="#166534" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="Profit" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
