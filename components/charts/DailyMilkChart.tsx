"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { DailyMilkData } from "@/lib/types";

interface DailyMilkChartProps {
  data: DailyMilkData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 mb-1">Day {label}</p>
      <p className="text-blue-600">{payload[0]?.value} glasses</p>
      {payload[1] && <p className="text-green-600">Rs {payload[1]?.value?.toLocaleString("en-IN")}</p>}
    </div>
  );
}

export default function DailyMilkChart({ data }: DailyMilkChartProps) {
  const chartData = data.map((d) => ({
    date: d.date.split("-")[2],
    Glasses: d.total_glasses,
    Amount: d.total_amount,
  }));

  const avgGlasses =
    chartData.length > 0
      ? chartData.reduce((s, d) => s + d.Glasses, 0) / chartData.length
      : 0;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {avgGlasses > 0 && (
          <ReferenceLine y={Math.round(avgGlasses)} stroke="#d97706" strokeDasharray="4 4"
            label={{ value: `Avg: ${Math.round(avgGlasses)}`, fontSize: 10, fill: "#d97706" }} />
        )}
        <Line type="monotone" dataKey="Glasses" stroke="#166534" strokeWidth={2}
          dot={{ fill: "#166534", r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
