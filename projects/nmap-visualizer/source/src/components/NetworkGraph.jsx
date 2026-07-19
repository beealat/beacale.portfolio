import { useEffect, useRef } from 'react';
import { Network, DataSet } from 'vis-network/standalone/esm/vis-network.mjs';
import { RISK_COLORS, RISK_LABELS } from '../lib/nmapParser';

const RISK_ORDER = ['critical', 'high', 'medium', 'low'];

export default function NetworkGraph({ hosts, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const hubNodes = RISK_ORDER.map((level) => ({
      id: `hub-${level}`,
      label: RISK_LABELS[level],
      shape: 'dot',
      size: 6,
      color: { background: RISK_COLORS[level], border: RISK_COLORS[level] },
      font: { color: RISK_COLORS[level], size: 11, face: 'IBM Plex Mono', vadjust: -14 },
      fixed: false,
      physics: true,
      mass: 6,
    }));

    const hostNodes = hosts.map((h) => ({
      id: h.id,
      label: h.ip,
      shape: 'dot',
      size: Math.min(28, 9 + h.openPortCount * 2),
      color: {
        background: h.status === 'up' ? RISK_COLORS[h.riskLevel] : '#25352f',
        border: h.status === 'up' ? RISK_COLORS[h.riskLevel] : '#3a4a44',
        highlight: { background: RISK_COLORS[h.riskLevel], border: '#e7f3ee' },
      },
      opacity: h.status === 'up' ? 1 : 0.45,
      font: { color: '#8ba59b', size: 10, face: 'IBM Plex Mono', vadjust: 16 },
      borderWidth: h.id === selectedId ? 3 : 1,
    }));

    const edges = hosts.map((h) => ({
      from: `hub-${h.riskLevel}`,
      to: h.id,
      color: { color: 'rgba(94,234,212,0.08)', highlight: 'rgba(94,234,212,0.4)' },
      length: 90 + h.openPortCount * 4,
      smooth: false,
    }));

    const nodesDataset = new DataSet([...hubNodes, ...hostNodes]);
    nodesRef.current = nodesDataset;
    const edgesDataset = new DataSet(edges);

    const network = new Network(
      containerRef.current,
      { nodes: nodesDataset, edges: edgesDataset },
      {
        autoResize: true,
        interaction: { hover: true, tooltipDelay: 120, zoomView: true, dragView: true },
        physics: {
          solver: 'forceAtlas2Based',
          forceAtlas2Based: { gravitationalConstant: -55, springLength: 90, springConstant: 0.06, avoidOverlap: 0.6 },
          stabilization: { iterations: 120 },
        },
        nodes: { shadow: false, borderWidth: 1 },
        edges: { width: 1 },
      }
    );

    network.on('click', (params) => {
      if (params.nodes.length && !String(params.nodes[0]).startsWith('hub-')) {
        onSelect(params.nodes[0]);
      }
    });

    networkRef.current = network;
    return () => network.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hosts]);

  useEffect(() => {
    if (!nodesRef.current) return;
    hosts.forEach((h) => {
      try {
        nodesRef.current.update({ id: h.id, borderWidth: h.id === selectedId ? 3 : 1 });
      } catch { /* node not present */ }
    });
  }, [selectedId, hosts]);

  return (
    <div className="graph-wrap">
      <div className="radar-sweep" />
      <div className="graph-canvas" ref={containerRef} />
    </div>
  );
}
