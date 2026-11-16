"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { GOAT_BREEDS, PIE_COLORS } from "@/lib/constants";
import type { GoatBreed } from "@/lib/types";

interface BreedCount { breed: GoatBreed; count: number; }
interface BreedPieChartProps { data: BreedCount[]; }

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }>; }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{payload[0]?.name}</p>
      <p className="text-gray-600">{payload[0]?.value} goats</p>
    </div>
  );
}

export default function BreedPieChart({ data }: BreedPieChartProps) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    name: GOAT_BREEDS[d.breed]?.label || d.breed,
    value: d.count,
    breed: d.breed,
  }));

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No goats recorded yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={CustomLabel}>
          {chartData.map((entry, index) => (
            <Cell key={entry.breed} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(value) => <span style={{ fontSize: 11, color: "#374151" }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
