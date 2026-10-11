'use client';

import { format, parseISO } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendPoint } from '@/services/performance.service';
import { CHART_COLORS } from '@/lib/performanceFormat';
import { ChartCard } from './ChartCard';

interface ThroughputChartProps {
  data: TrendPoint[];
}

function fmtDate(value: string): string {
  try {
    return format(parseISO(value), 'MMM d');
  } catch {
    return value;
  }
}

export function ThroughputChart({ data }: ThroughputChartProps) {
  const isEmpty = !data.length || data.every((d) => d.created === 0 && d.completed === 0);

  return (
    <ChartCard
      title="Throughput"
      description="Tasks created vs. completed over time"
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="perfCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.created} stopOpacity={0.25} />
              <stop offset="95%" stopColor={CHART_COLORS.created} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="perfCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.completed} stopOpacity={0.25} />
              <stop offset="95%" stopColor={CHART_COLORS.completed} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            minTickGap={20}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            labelFormatter={(l) => fmtDate(String(l))}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            name="Created"
            dataKey="created"
            stroke={CHART_COLORS.created}
            fill="url(#perfCreated)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            name="Completed"
            dataKey="completed"
            stroke={CHART_COLORS.completed}
            fill="url(#perfCompleted)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
