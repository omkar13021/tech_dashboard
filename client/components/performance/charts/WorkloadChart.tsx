'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { WorkloadPoint } from '@/services/performance.service';
import { CHART_COLORS } from '@/lib/performanceFormat';
import { ChartCard } from './ChartCard';

interface WorkloadChartProps {
  data: WorkloadPoint[];
  /** Cap the number of bars (data arrives sorted desc by the backend). */
  limit?: number;
}

export function WorkloadChart({ data, limit = 10 }: WorkloadChartProps) {
  const rows = data.slice(0, limit);
  const isEmpty = rows.every((r) => r.activeTasks === 0);
  // Give the chart room to breathe per member, with a sensible floor.
  const height = Math.max(rows.length * 34 + 24, 200);

  return (
    <ChartCard
      title="Active workload"
      description="Open tasks per member (top contributors)"
      isEmpty={isEmpty || rows.length === 0}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.1)' }}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar
            dataKey="activeTasks"
            name="Active tasks"
            fill={CHART_COLORS.workload}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
