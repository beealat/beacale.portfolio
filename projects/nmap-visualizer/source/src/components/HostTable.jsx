import { List } from 'react-window';
import { RISK_COLORS, RISK_LABELS } from '../lib/nmapParser';

function SortIcon({ dir }) {
  if (!dir) return null;
  return <span style={{ fontSize: '0.6rem' }}>{dir === 'asc' ? '\u2191' : '\u2193'}</span>;
}

function Row({ index, style, hosts, selectedId, onSelect }) {
  const h = hosts[index];
  const openPorts = h.ports.filter((p) => p.state === 'open');
  const shown = openPorts.slice(0, 4);
  const extra = openPorts.length - shown.length;

  return (
    <div
      style={style}
      className={`host-row${h.id === selectedId ? ' selected' : ''}`}
      onClick={() => onSelect(h.id)}
    >
      <div className="cell-ip">{h.ip}</div>
      <div className="cell-hostname col-hostname">{h.hostname || '—'}</div>
      <div className="cell-os col-os">{h.os}</div>
      <div>
        <span className={`status-pill${h.status === 'up' ? ' up' : ''}`}>{h.status}</span>
      </div>
      <div>
        <span className="risk-badge" style={{ '--badge-color': RISK_COLORS[h.riskLevel] }}>
          {RISK_LABELS[h.riskLevel]}
        </span>
      </div>
      <div className="port-chips">
        {shown.map((p) => <span className="port-chip" key={p.portId}>{p.portId}/{p.service}</span>)}
        {extra > 0 && <span className="port-chip-more">+{extra}</span>}
        {openPorts.length === 0 && <span className="port-chip-more">no open ports</span>}
      </div>
    </div>
  );
}

export default function HostTable({ hosts, selectedId, onSelect, sortBy, onSortChange }) {
  const colSort = (key) => (sortBy.startsWith(key) ? (sortBy.endsWith('asc') ? 'asc' : 'desc') : null);

  return (
    <div className="panel table-panel">
      <div className="host-table-head">
        <button onClick={() => onSortChange('ip-asc')}>IP Address <SortIcon dir={colSort('ip')} /></button>
        <span className="col-hostname">Hostname</span>
        <span className="col-os">Operating System</span>
        <span>Status</span>
        <button onClick={() => onSortChange(sortBy === 'risk-desc' ? 'risk-asc' : 'risk-desc')}>
          Risk <SortIcon dir={colSort('risk')} />
        </button>
        <button onClick={() => onSortChange('ports-desc')}>Open Ports <SortIcon dir={colSort('ports')} /></button>
      </div>

      {hosts.length === 0 ? (
        <div className="empty-state">No hosts match the current search and filters.</div>
      ) : (
        <List
          rowComponent={Row}
          rowCount={hosts.length}
          rowHeight={46}
          rowProps={{ hosts, selectedId, onSelect }}
          style={{ height: Math.min(46 * hosts.length, 460) }}
        />
      )}
    </div>
  );
}
