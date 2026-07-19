// Generates a realistic, sizeable synthetic scan payload so the dashboard
// can be demoed without a user-supplied file. Deterministic (seeded) so the
// same "sample scan" renders identically on every load.

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(88221);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const OS_PROFILES = [
  { os: 'Linux 5.15 (Ubuntu 22.04)', weight: 5, ports: [22, 80, 443] },
  { os: 'Linux 4.19 (Debian 10)', weight: 3, ports: [22, 80, 3306] },
  { os: 'Windows Server 2019', weight: 4, ports: [135, 139, 445, 3389] },
  { os: 'Windows Server 2012 R2', weight: 2, ports: [135, 139, 445, 1433, 3389] },
  { os: 'Windows 10 Enterprise', weight: 3, ports: [135, 139, 445] },
  { os: 'FreeBSD 13.1', weight: 1, ports: [22, 80, 21] },
  { os: 'Cisco IOS 15.x', weight: 1, ports: [22, 23, 161] },
  { os: 'macOS 13 Ventura', weight: 2, ports: [22, 5900] },
];

const SERVICE_MAP = {
  21: ['ftp', 'vsftpd', '3.0.3'],
  22: ['ssh', 'OpenSSH', '8.9p1'],
  23: ['telnet', 'Cisco telnetd', ''],
  25: ['smtp', 'Postfix smtpd', '3.6.4'],
  53: ['domain', 'ISC BIND', '9.18'],
  80: ['http', 'nginx', '1.24.0'],
  135: ['msrpc', 'Microsoft Windows RPC', ''],
  139: ['netbios-ssn', 'Microsoft Windows netbios-ssn', ''],
  161: ['snmp', 'net-snmp', '5.9'],
  443: ['https', 'nginx', '1.24.0'],
  445: ['microsoft-ds', 'Windows Server 2019 Microsoft-DS', ''],
  1433: ['ms-sql-s', 'Microsoft SQL Server', '2019'],
  3306: ['mysql', 'MySQL', '8.0.34'],
  3389: ['ms-wbt-server', 'Microsoft Terminal Services', ''],
  5900: ['vnc', 'Apple remote desktop', ''],
  6379: ['redis', 'Redis', '7.0.11'],
  8080: ['http-proxy', 'Apache Tomcat', '9.0.71'],
  9200: ['http', 'Elasticsearch REST API', '8.9.0'],
  27017: ['mongodb', 'MongoDB', '6.0.8'],
};

const DEPTS = ['corp', 'dmz', 'lab', 'ops', 'guest', 'db'];

function weightedPick(profiles) {
  const total = profiles.reduce((s, p) => s + p.weight, 0);
  let r = rand() * total;
  for (const p of profiles) {
    if (r < p.weight) return p;
    r -= p.weight;
  }
  return profiles[0];
}

export function generateSampleScan(hostCount = 42) {
  const hosts = [];
  for (let i = 0; i < hostCount; i++) {
    const profile = weightedPick(OS_PROFILES);
    const octet3 = 10 + (i % 4);
    const octet4 = 10 + i;
    const ip = `172.${octet3}.${pick(DEPTS) === 'db' ? 30 : 0}.${octet4}`;
    const status = rand() > 0.06 ? 'up' : 'down';

    const extraPortPool = [80, 443, 8080, 3306, 5900, 6379, 9200, 27017, 21, 25];
    const extraCount = rand() > 0.7 ? Math.floor(rand() * 3) : 0;
    const portSet = new Set(profile.ports);
    for (let j = 0; j < extraCount; j++) portSet.add(pick(extraPortPool));

    const ports = Array.from(portSet).sort((a, b) => a - b).map((portId) => {
      const [service, product, version] = SERVICE_MAP[portId] || ['unknown', '', ''];
      const state = rand() > 0.08 ? 'open' : 'filtered';
      return { portId, protocol: 'tcp', state, service, product, version };
    });

    hosts.push({
      ip,
      hostname: rand() > 0.3 ? `${pick(DEPTS)}-${String(i).padStart(3, '0')}.internal` : '',
      status,
      os: profile.os,
      osAccuracy: 80 + Math.floor(rand() * 19),
      ports,
    });
  }
  return JSON.stringify({
    startedAt: 'Mon Jul 20 2026 02:14:07',
    args: 'nmap -sS -sV -O -T4 172.10.0.0/22',
    hosts,
  });
}
