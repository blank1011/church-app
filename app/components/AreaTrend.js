'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * Reusable area/trend chart used on the dashboard and report screens.
 * data: [{ label: string, value: number }]
 * color: 'accent' | 'danger' (defaults to accent)
 */
export default function AreaTrend({ data = [], height = 160, showAxes = true, color = 'accent', gradientId = 'trendFill' }) {
  const stroke = color === 'danger' ? 'var(--danger)' : 'var(--accent)'

  const formatPeso = v => `₱${Number(v).toLocaleString()}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxes && (
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
        )}
        {showAxes && (
          <YAxis
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v}
          />
        )}
        <Tooltip
          cursor={{ stroke: 'var(--line)', strokeWidth: 1 }}
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            fontSize: 12,
            color: 'var(--content)',
          }}
          labelStyle={{ color: 'var(--muted)' }}
          formatter={v => [formatPeso(v), 'Total']}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: stroke, stroke: 'var(--surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
