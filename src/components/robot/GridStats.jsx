import React, { useMemo } from 'react';
import { CELL_UNKNOWN, CELL_OBSTACLE, CELL_FREE, CELL_VISITED } from '@/lib/robotDataService';

export default function GridStats({ cells }) {
  const stats = useMemo(() => {
    let unknown = 0, obstacle = 0, free = 0, visited = 0;
    let totalTemp = 0, totalHumid = 0, visitedCount = 0;
    let minTemp = Infinity, maxTemp = -Infinity;

    cells.forEach(c => {
      if (c.state === CELL_UNKNOWN) unknown++;
      else if (c.state === CELL_OBSTACLE) obstacle++;
      else if (c.state === CELL_FREE) free++;
      else if (c.state === CELL_VISITED) {
        visited++;
        if (c.temperature != null) {
          totalTemp += c.temperature;
          totalHumid += c.humidity ?? 0;
          visitedCount++;
          if (c.temperature < minTemp) minTemp = c.temperature;
          if (c.temperature > maxTemp) maxTemp = c.temperature;
        }
      }
    });

    const total = cells.length || 1;
    return {
      unknown, obstacle, free, visited,
      unknownPct: ((unknown / total) * 100).toFixed(1),
      obstaclePct: ((obstacle / total) * 100).toFixed(1),
      freePct: ((free / total) * 100).toFixed(1),
      visitedPct: ((visited / total) * 100).toFixed(1),
      avgTemp: visitedCount > 0 ? (totalTemp / visitedCount).toFixed(1) : '—',
      avgHumid: visitedCount > 0 ? (totalHumid / visitedCount).toFixed(1) : '—',
      minTemp: minTemp === Infinity ? '—' : minTemp.toFixed(1),
      maxTemp: maxTemp === -Infinity ? '—' : maxTemp.toFixed(1),
    };
  }, [cells]);

  const rows = [
    { label: 'Visited', value: stats.visited, pct: stats.visitedPct, color: '#22c55e' },
    { label: 'Unknown', value: stats.unknown, pct: stats.unknownPct, color: 'hsl(220, 22%, 38%)' },
    { label: 'Free', value: stats.free, pct: stats.freePct, color: '#38bdf8' },
    { label: 'Obstacle', value: stats.obstacle, pct: stats.obstaclePct, color: '#c53030' },
  ];

  return (
    <div className="panel-glass rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-4 rounded-full" style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
        <h3 className="font-heading text-xs font-semibold tracking-widest uppercase" style={{ color: '#a78bfa' }}>
          Grid Stats
        </h3>
      </div>

      {/* Coverage bar */}
      <div>
        <div className="flex gap-0 h-2 rounded-full overflow-hidden">
          {rows.map(r => (
            <div
              key={r.label}
              style={{ width: `${r.pct}%`, background: r.color }}
              title={`${r.label}: ${r.pct}%`}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-1.5">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: r.color }} />
              <span className="text-muted-foreground">{r.label}</span>
            </div>
            <div className="flex items-center gap-2 tabular-nums">
              <span className="text-foreground/80">{r.value.toLocaleString()}</span>
              <span className="text-muted-foreground/60 w-10 text-right">{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Heat averages */}
      <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono text-muted-foreground/60 tracking-wider">Avg Temp</span>
          <span className="text-sm font-heading font-semibold text-orange-400">{stats.avgTemp}°C</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono text-muted-foreground/60 tracking-wider">Avg Humid</span>
          <span className="text-sm font-heading font-semibold text-sky-400">{stats.avgHumid}%</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono text-muted-foreground/60 tracking-wider">Min Temp</span>
          <span className="text-sm font-heading font-semibold text-blue-400">{stats.minTemp}°C</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono text-muted-foreground/60 tracking-wider">Max Temp</span>
          <span className="text-sm font-heading font-semibold text-red-400">{stats.maxTemp}°C</span>
        </div>
      </div>
    </div>
  );
}