// Parses Nmap XML (-oX) output and a simplified Nmap-derived JSON shape into
// a normalized host list the dashboard can render, filter, and sort.

const RISK_PORTS = {
  21: { weight: 3, label: 'FTP — often cleartext auth' },
  23: { weight: 4, label: 'Telnet — unencrypted remote shell' },
  25: { weight: 1, label: 'SMTP' },
  135: { weight: 2, label: 'MSRPC' },
  139: { weight: 3, label: 'NetBIOS' },
  445: { weight: 4, label: 'SMB — common lateral-movement vector' },
  1433: { weight: 3, label: 'MSSQL exposed' },
  1521: { weight: 3, label: 'Oracle DB exposed' },
  3306: { weight: 3, label: 'MySQL exposed' },
  3389: { weight: 4, label: 'RDP exposed' },
  5432: { weight: 3, label: 'PostgreSQL exposed' },
  5900: { weight: 3, label: 'VNC exposed' },
  6379: { weight: 3, label: 'Redis — frequently unauthenticated' },
  9200: { weight: 2, label: 'Elasticsearch exposed' },
  27017: { weight: 3, label: 'MongoDB exposed' },
};

function scoreHost(openPorts) {
  let score = 0;
  const flags = [];
  for (const p of openPorts) {
    const rp = RISK_PORTS[p.portId];
    if (rp) {
      score += rp.weight;
      flags.push({ port: p.portId, label: rp.label });
    } else {
      score += 0.5;
    }
  }
  score += Math.max(0, openPorts.length - 5) * 0.4;
  return { score, flags };
}

function classify(score) {
  if (score >= 8) return 'critical';
  if (score >= 4.5) return 'high';
  if (score >= 1.5) return 'medium';
  return 'low';
}

function buildHost(raw) {
  const openPorts = raw.ports.filter((p) => p.state === 'open');
  const { score, flags } = scoreHost(openPorts);
  return {
    ...raw,
    openPortCount: openPorts.length,
    riskScore: Math.round(score * 10) / 10,
    riskLevel: raw.status === 'up' ? classify(score) : 'low',
    riskFlags: flags,
  };
}

export function parseNmapXML(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) throw new Error('That file isn\u2019t valid XML.');

  const hostNodes = Array.from(doc.getElementsByTagName('host'));
  if (hostNodes.length === 0) throw new Error('No <host> entries found in this scan file.');

  const scanInfo = doc.querySelector('scaninfo');
  const runInfo = doc.querySelector('nmaprun');

  const hosts = hostNodes.map((hostEl, idx) => {
    const statusEl = hostEl.querySelector('status');
    const status = statusEl ? statusEl.getAttribute('state') : 'unknown';

    const addrEls = Array.from(hostEl.querySelectorAll('address'));
    const ipv4 = addrEls.find((a) => a.getAttribute('addrtype') === 'ipv4');
    const mac = addrEls.find((a) => a.getAttribute('addrtype') === 'mac');
    const ip = ipv4 ? ipv4.getAttribute('addr') : (addrEls[0] ? addrEls[0].getAttribute('addr') : `host-${idx}`);

    const hostnameEls = Array.from(hostEl.querySelectorAll('hostnames > hostname'));
    const hostname = hostnameEls.length ? hostnameEls.map((h) => h.getAttribute('name')).join(', ') : '';

    const portEls = Array.from(hostEl.querySelectorAll('ports > port'));
    const ports = portEls.map((portEl) => {
      const stateEl = portEl.querySelector('state');
      const serviceEl = portEl.querySelector('service');
      return {
        portId: parseInt(portEl.getAttribute('portid'), 10),
        protocol: portEl.getAttribute('protocol') || 'tcp',
        state: stateEl ? stateEl.getAttribute('state') : 'unknown',
        service: serviceEl ? (serviceEl.getAttribute('name') || 'unknown') : 'unknown',
        product: serviceEl ? (serviceEl.getAttribute('product') || '') : '',
        version: serviceEl ? (serviceEl.getAttribute('version') || '') : '',
      };
    }).filter((p) => !Number.isNaN(p.portId));

    const osMatches = Array.from(hostEl.querySelectorAll('os > osmatch'));
    const bestOs = osMatches[0];
    const os = bestOs ? bestOs.getAttribute('name') : 'Unknown';
    const osAccuracy = bestOs ? parseInt(bestOs.getAttribute('accuracy'), 10) : 0;

    return buildHost({
      id: ip || `host-${idx}`,
      ip,
      mac: mac ? mac.getAttribute('addr') : '',
      hostname,
      status,
      os,
      osAccuracy,
      ports,
    });
  });

  return {
    meta: {
      scanType: scanInfo ? scanInfo.getAttribute('type') : 'unknown',
      protocol: scanInfo ? scanInfo.getAttribute('protocol') : 'unknown',
      startedAt: runInfo ? runInfo.getAttribute('startstr') : '',
      args: runInfo ? runInfo.getAttribute('args') : '',
    },
    hosts,
  };
}

// Accepts a simplified JSON shape:
// { hosts: [{ ip, hostname, status, os, osAccuracy, ports: [{portId, protocol, state, service, product, version}] }] }
export function parseNmapJSON(jsonString) {
  const data = JSON.parse(jsonString);
  const rawHosts = Array.isArray(data) ? data : data.hosts;
  if (!Array.isArray(rawHosts)) throw new Error('Expected a "hosts" array in the JSON file.');

  const hosts = rawHosts.map((h, idx) => buildHost({
    id: h.ip || h.id || `host-${idx}`,
    ip: h.ip || h.address || `host-${idx}`,
    mac: h.mac || '',
    hostname: h.hostname || h.hostnames || '',
    status: h.status || (h.state === 'up' ? 'up' : h.state) || 'up',
    os: h.os || h.osName || 'Unknown',
    osAccuracy: h.osAccuracy || h.accuracy || 0,
    ports: (h.ports || []).map((p) => ({
      portId: Number(p.portId ?? p.port),
      protocol: p.protocol || 'tcp',
      state: p.state || 'open',
      service: p.service || p.name || 'unknown',
      product: p.product || '',
      version: p.version || '',
    })).filter((p) => !Number.isNaN(p.portId)),
  }));

  return {
    meta: { scanType: 'imported', protocol: 'mixed', startedAt: data.startedAt || '', args: data.args || '' },
    hosts,
  };
}

export function parseNmapFile(filename, content) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.json')) return parseNmapJSON(content);
  if (lower.endsWith('.xml') || content.trim().startsWith('<')) return parseNmapXML(content);
  // last resort: try JSON, then XML
  try {
    return parseNmapJSON(content);
  } catch {
    return parseNmapXML(content);
  }
}

export const RISK_COLORS = {
  critical: '#ef4444',
  high: '#f5a623',
  medium: '#5eead4',
  low: '#4b6a63',
};

export const RISK_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
