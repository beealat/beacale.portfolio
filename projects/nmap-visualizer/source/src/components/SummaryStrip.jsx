export default function SummaryStrip({ stats }) {
  const items = [
    { label: 'Hosts scanned', value: stats.total, accent: 'teal' },
    { label: 'Hosts up', value: stats.up, sub: `${stats.down} down / filtered` },
    { label: 'Open ports', value: stats.openPorts, sub: `across ${stats.total} hosts` },
    { label: 'Critical risk', value: stats.critical, accent: 'critical' },
    { label: 'High risk', value: stats.high, accent: 'high' },
    { label: 'Distinct OS', value: stats.osCount },
  ];

  return (
    <div className="summary-strip">
      {items.map((it) => (
        <div
          className="stat-card"
          key={it.label}
          style={it.accent === 'critical' ? { '--stat-accent': 'var(--red)' } : it.accent === 'high' ? { '--stat-accent': 'var(--amber)' } : it.accent === 'teal' ? { '--stat-accent': 'var(--teal)' } : undefined}
        >
          <div className="stat-label">{it.label}</div>
          <div className={`stat-value ${it.accent ? `accent-${it.accent}` : ''}`}>{it.value}</div>
          {it.sub && <div className="stat-sub">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}
