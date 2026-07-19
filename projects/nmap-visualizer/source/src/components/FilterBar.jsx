import { RISK_COLORS, RISK_LABELS } from '../lib/nmapParser';

const LEVELS = ['critical', 'high', 'medium', 'low'];

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

export default function FilterBar({ search, onSearch, activeLevels, onToggleLevel, sortBy, onSortChange, resultCount }) {
  return (
    <div className="filter-bar">
      <div className="search-input-wrap">
        <SearchIcon />
        <input
          className="search-input"
          placeholder="Search IP, hostname, port, or service…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="risk-chips">
        {LEVELS.map((level) => (
          <button
            key={level}
            className={`chip${activeLevels.has(level) ? ' active' : ''}`}
            style={{ '--chip-color': RISK_COLORS[level] }}
            onClick={() => onToggleLevel(level)}
          >
            <span className="legend-dot" style={{ background: RISK_COLORS[level] }} />
            {RISK_LABELS[level]}
          </button>
        ))}
      </div>

      <select className="sort-select" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="risk-desc">Sort: Risk (high → low)</option>
        <option value="risk-asc">Sort: Risk (low → high)</option>
        <option value="ports-desc">Sort: Open ports (most)</option>
        <option value="ip-asc">Sort: IP address</option>
      </select>

      <div className="panel-caption">{resultCount} match{resultCount === 1 ? '' : 'es'}</div>
    </div>
  );
}
