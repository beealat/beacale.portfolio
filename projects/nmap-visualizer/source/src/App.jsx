import { useState, useMemo, useCallback } from 'react';
import UploadStage from './components/UploadStage';
import SummaryStrip from './components/SummaryStrip';
import NetworkGraph from './components/NetworkGraph';
import StatsCharts from './components/StatsCharts';
import FilterBar from './components/FilterBar';
import HostTable from './components/HostTable';
import HostDrawer from './components/HostDrawer';
import { parseNmapFile } from './lib/nmapParser';
import { generateSampleScan } from './lib/sampleData';

const ALL_LEVELS = new Set(['critical', 'high', 'medium', 'low']);

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <path d="M12 12 L12 3" strokeLinecap="round" />
    </svg>
  );
}

const ipToNum = (ip) => ip.split('.').reduce((acc, oct) => acc * 256 + (parseInt(oct, 10) || 0), 0);
const RISK_RANK = { critical: 3, high: 2, medium: 1, low: 0 };

export default function App() {
  const [scan, setScan] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState('');
  const [activeLevels, setActiveLevels] = useState(ALL_LEVELS);
  const [sortBy, setSortBy] = useState('risk-desc');
  const [selectedId, setSelectedId] = useState(null);

  const loadFromText = useCallback((name, text) => {
    try {
      const parsed = parseNmapFile(name, text);
      setScan(parsed);
      setFileName(name);
      setError('');
      setSearch('');
      setActiveLevels(ALL_LEVELS);
      setSelectedId(null);
    } catch (e) {
      setError(e.message || 'Could not parse that file.');
    } finally {
      setBusy(false);
    }
  }, []);

  const handleFile = useCallback((file) => {
    setBusy(true);
    setError('');
    const reader = new FileReader();
    reader.onload = () => loadFromText(file.name, String(reader.result));
    reader.onerror = () => { setError('Could not read that file.'); setBusy(false); };
    reader.readAsText(file);
  }, [loadFromText]);

  const handleSample = useCallback(() => {
    setBusy(true);
    setTimeout(() => loadFromText('sample-subnet-scan.json', generateSampleScan()), 250);
  }, [loadFromText]);

  const toggleLevel = useCallback((level) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level); else next.add(level);
      return next.size === 0 ? new Set(ALL_LEVELS) : next;
    });
  }, []);

  const stats = useMemo(() => {
    if (!scan) return null;
    const hosts = scan.hosts;
    const up = hosts.filter((h) => h.status === 'up').length;
    const openPorts = hosts.reduce((s, h) => s + h.openPortCount, 0);
    const critical = hosts.filter((h) => h.riskLevel === 'critical').length;
    const high = hosts.filter((h) => h.riskLevel === 'high').length;
    const osCount = new Set(hosts.map((h) => h.os)).size;
    return { total: hosts.length, up, down: hosts.length - up, openPorts, critical, high, osCount };
  }, [scan]);

  const filteredHosts = useMemo(() => {
    if (!scan) return [];
    const q = search.trim().toLowerCase();
    let list = scan.hosts.filter((h) => {
      if (!activeLevels.has(h.riskLevel)) return false;
      if (!q) return true;
      if (h.ip.toLowerCase().includes(q)) return true;
      if (h.hostname.toLowerCase().includes(q)) return true;
      if (h.os.toLowerCase().includes(q)) return true;
      return h.ports.some((p) => String(p.portId).includes(q) || p.service.toLowerCase().includes(q));
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'risk-asc':
          return RISK_RANK[a.riskLevel] - RISK_RANK[b.riskLevel] || a.riskScore - b.riskScore;
        case 'ports-desc':
          return b.openPortCount - a.openPortCount;
        case 'ip-asc':
          return ipToNum(a.ip) - ipToNum(b.ip);
        case 'risk-desc':
        default:
          return RISK_RANK[b.riskLevel] - RISK_RANK[a.riskLevel] || b.riskScore - a.riskScore;
      }
    });

    return list;
  }, [scan, search, activeLevels, sortBy]);

  const selectedHost = useMemo(
    () => (selectedId ? scan?.hosts.find((h) => h.id === selectedId) || null : null),
    [scan, selectedId]
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark"><BrandMark /></div>
          <div>
            <div className="brand-title">Nmap Visualizer</div>
            <div className="brand-sub">Scan analysis dashboard</div>
          </div>
        </div>

        {scan && (
          <div className="topbar-meta">
            <div className="meta-item">
              <span className="meta-label">Source</span>
              <span className="meta-value"><span className="live-dot" />{fileName}</span>
            </div>
            {scan.meta.args && (
              <div className="meta-item">
                <span className="meta-label">Command</span>
                <span className="meta-value">{scan.meta.args}</span>
              </div>
            )}
            {scan.meta.startedAt && (
              <div className="meta-item">
                <span className="meta-label">Scanned</span>
                <span className="meta-value">{scan.meta.startedAt}</span>
              </div>
            )}
            <button className="reset-btn" onClick={() => setScan(null)}>Load different scan</button>
          </div>
        )}
      </header>

      {!scan ? (
        <UploadStage onFile={handleFile} onLoadSample={handleSample} error={error} busy={busy} />
      ) : (
        <>
          <SummaryStrip stats={stats} />

          <div className="main-grid">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title"><span className="live-dot" />Network map</div>
                <div className="panel-caption">{filteredHosts.length} of {stats.total} hosts shown</div>
              </div>
              <NetworkGraph hosts={filteredHosts} selectedId={selectedId} onSelect={setSelectedId} />
              <div className="graph-legend">
                <span><span className="legend-dot" style={{ background: '#f2545b' }} />Critical</span>
                <span><span className="legend-dot" style={{ background: '#f5b942' }} />High</span>
                <span><span className="legend-dot" style={{ background: '#5eead4' }} />Medium</span>
                <span><span className="legend-dot" style={{ background: '#4b6a63' }} />Low</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-faint)' }}>Node size ∝ open ports · click a node for details</span>
              </div>
            </div>

            <StatsCharts hosts={filteredHosts} />
          </div>

          <div className="panel table-panel">
            <FilterBar
              search={search}
              onSearch={setSearch}
              activeLevels={activeLevels}
              onToggleLevel={toggleLevel}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={filteredHosts.length}
            />
          </div>

          <HostTable
            hosts={filteredHosts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="perf-note">
            <span className="live-dot" />
            Rows are virtualized and selectors memoized — smooth with large scans, not just the demo dataset.
          </div>
        </>
      )}

      <HostDrawer host={selectedHost} onClose={() => setSelectedId(null)} />
    </div>
  );
}
