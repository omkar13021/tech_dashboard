'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DistributionBucket } from '@/services/performance.service';
import { priorityMeta, PRIORITY_META } from '@/lib/performanceFormat';
import { ChartCard } from './ChartCard';

interface PriorityBarProps {
  data: DistributionBucket[];
}

const ORDER = Object.keys(PRIORITY_META);

export function PriorityBar({ data }: PriorityBarProps) {
  const map = new Map(data.map((d) => [d.key, d.count]));
  const rows = ORDER.map((key) => ({
    key,
    label: priorityMeta(key).label,
    color: priorityMeta(key).color,
    count: map.get(key) ?? 0,
  }));
  const isEmpty = rows.every((r) => r.count === 0);

  return (
    <ChartCard title="Priority breakdown" description="Tasks created in this period" isEmpty={isEmpty}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.1)' }}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {rows.map((r) => (
              <Cell key={r.key} fill={r.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
