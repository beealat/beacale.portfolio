import { RISK_COLORS, RISK_LABELS } from '../lib/nmapParser';

export default function HostDrawer({ host, onClose }) {
  if (!host) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <div className="drawer-ip">{host.ip}</div>
            <div className="drawer-hostname">{host.hostname || 'No hostname resolved'}</div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-title">Overview</div>
          <div className="drawer-fact-grid">
            <div>
              <div className="fact-label">Status</div>
              <div className="fact-value">{host.status}</div>
            </div>
            <div>
              <div className="fact-label">Risk level</div>
              <div className="fact-value" style={{ color: RISK_COLORS[host.riskLevel] }}>
                {RISK_LABELS[host.riskLevel]} ({host.riskScore})
              </div>
            </div>
            <div>
              <div className="fact-label">Operating system</div>
              <div className="fact-value">{host.os}</div>
            </div>
            <div>
              <div className="fact-label">OS match confidence</div>
              <div className="fact-value">{host.osAccuracy ? `${host.osAccuracy}%` : '—'}</div>
            </div>
            <div>
              <div className="fact-label">MAC address</div>
              <div className="fact-value">{host.mac || '—'}</div>
            </div>
            <div>
              <div className="fact-label">Open ports</div>
              <div className="fact-value">{host.openPortCount}</div>
            </div>
          </div>
        </div>

        {host.riskFlags.length > 0 && (
          <div className="drawer-section">
            <div className="drawer-section-title">Risk factors</div>
            {host.riskFlags.map((f) => (
              <div className="flag-row" key={f.port}>
                <span className="flag-port">{f.port}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="drawer-section" style={{ borderBottom: 'none' }}>
          <div className="drawer-section-title">Ports & services</div>
          <table className="port-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>State</th>
                <th>Service</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {host.ports.length === 0 && (
                <tr><td colSpan={4} style={{ color: 'var(--text-faint)' }}>No ports reported</td></tr>
              )}
              {host.ports.map((p) => (
                <tr key={`${p.portId}-${p.protocol}`}>
                  <td className="port-num">{p.portId}/{p.protocol}</td>
                  <td className={p.state === 'open' ? 'state-open' : 'state-filtered'}>{p.state}</td>
                  <td>{p.service}{p.product ? ` (${p.product})` : ''}</td>
                  <td>{p.version || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
