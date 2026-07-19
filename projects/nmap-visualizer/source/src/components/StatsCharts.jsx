import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie,
} from 'recharts';
import { RISK_COLORS, RISK_LABELS } from '../lib/nmapParser';

const tooltipStyle = {
  background: '#0e1815',
  border: '1px solid #1e322b',
  borderRadius: 8,
  fontSize: 12,
  fontFamily: 'IBM Plex Mono, monospace',
  color: '#e7f3ee',
};

function topPorts(hosts, n = 7) {
  const counts = new Map();
  hosts.forEach((h) => h.ports.forEach((p) => {
    if (p.state !== 'open') return;
    const key = `${p.portId}/${p.service}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }));
  return Array.from(counts.entries())
    .map(([key, count]) => {
      const [port, service] = key.split('/');
      return { port, service, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

function riskBreakdown(hosts) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  hosts.forEach((h) => { counts[h.riskLevel] += 1; });
  return Object.entries(counts).map(([level, value]) => ({ level, value, color: RISK_COLORS[level] }));
}

export default function StatsCharts({ hosts }) {
  const portData = useMemo(() => topPorts(hosts), [hosts]);
  const riskData = useMemo(() => riskBreakdown(hosts), [hosts]);
  const totalForPie = riskData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="charts-col">
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Top open ports</div>
          <div className="panel-caption">by frequency</div>
        </div>
        <div className="chart-body" style={{ height: 190 }}>
          {portData.length === 0 ? (
            <div className="empty-state">No open ports match the current filters</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portData} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="port"
                  width={56}
                  tick={{ fill: '#8ba59b', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(94,234,212,0.06)' }}
                  contentStyle={tooltipStyle}
                  formatter={(value, _name, item) => [`${value} host${value === 1 ? '' : 's'}`, item.payload.service]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                  {portData.map((_, i) => <Cell key={i} fill="#5eead4" fillOpacity={1 - i * 0.09} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Risk distribution</div>
          <div className="panel-caption">{totalForPie} hosts</div>
        </div>
        <div className="chart-body" style={{ height: 190, display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="55%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="level"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={3}
                stroke="none"
              >
                {riskData.map((d) => <Cell key={d.level} fill={d.color} fillOpacity={d.value === 0 ? 0.15 : 1} />)}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, _name, item) => [`${value} hosts`, RISK_LABELS[item.payload.level]]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {riskData.map((d) => (
              <div key={d.level} style={{ fontSize: '0.72rem', color: '#8ba59b', display: 'flex', alignItems: 'center' }}>
                <span className="legend-dot" style={{ background: d.color }} />
                {RISK_LABELS[d.level]} — {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
