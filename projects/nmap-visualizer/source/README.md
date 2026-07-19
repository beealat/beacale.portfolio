# Nmap Visualizer & Log Analyzer

A frontend dashboard that parses raw Nmap scan output (XML or JSON) entirely
in the browser and turns it into an interactive executive dashboard: a
force-directed network map, risk-distribution charts, live search/filter/sort,
and a virtualized host table for large scans.

## Stack
- React 19 + Vite
- `vis-network` for the interactive host map
- `recharts` for the port-frequency and risk-distribution charts
- `react-window` for virtualized table rendering (handles large scans without re-render lag)

## Run locally
```
npm install
npm run dev
```

## Build
```
npm run build
```
Outputs a static `dist/` folder (`index.html` + `assets/`) that can be hosted
anywhere, including embedded via iframe as in this portfolio.

## Try it
Click **"Load sample scan"** on first load to see the dashboard populated with
a synthetic ~40-host subnet scan, or drop in your own `nmap -oX scan.xml`
output.
