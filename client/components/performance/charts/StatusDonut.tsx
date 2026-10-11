'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DistributionBucket } from '@/services/performance.service';
import { statusMeta } from '@/lib/performanceFormat';
import { ChartCard } from './ChartCard';

interface StatusDonutProps {
  data: DistributionBucket[];
}

export function StatusDonut({ data }: StatusDonutProps) {
  const rows = data
    .filter((d) => d.count > 0)
    .map((d) => ({ ...d, label: statusMeta(d.key).label, color: statusMeta(d.key).color }));
  const isEmpty = rows.length === 0;

  return (
    <ChartCard title="Status mix" description="Tasks created in this period" isEmpty={isEmpty}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="count"
            nameKey="label"
            innerRadius={58}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {rows.map((r) => (
              <Cell key={r.key} fill={r.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
