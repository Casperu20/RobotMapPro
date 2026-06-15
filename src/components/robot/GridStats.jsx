import React from 'react';

export default function GridStats({ cells }) {
  // 1. Calculate Map Coverage (Safely preventing divide-by-zero)
  const total = cells.length || 1;
  const visited = cells.filter(c => c.visited).length;
  const unknown = cells.filter(c => c.state === '?').length;
  const free = cells.filter(c => c.state === '.').length;
  const obstacle = cells.filter(c => c.state === '#').length;

  // 2. Filter out all 'null' or 'undefined' sensor readings from the math
  const validTemps = cells.filter(c => typeof c.temperature === 'number' && !isNaN(c.temperature));
  const validHumids = cells.filter(c => typeof c.humidity === 'number' && !isNaN(c.humidity));

  // 3. Calculate safe aggregates
  const avgTemp = validTemps.length 
    ? (validTemps.reduce((sum, c) => sum + c.temperature, 0) / validTemps.length).toFixed(1) 
    : '—';
    
  const minTemp = validTemps.length 
    ? Math.min(...validTemps.map(c => c.temperature)).toFixed(1) 
    : '—';
    
  const maxTemp = validTemps.length 
    ? Math.max(...validTemps.map(c => c.temperature)).toFixed(1) 
    : '—';
    
  const avgHumid = validHumids.length 
    ? (validHumids.reduce((sum, c) => sum + c.humidity, 0) / validHumids.length).toFixed(1) 
    : '—';

  return (
    <div className="panel-glass rounded-2xl p-4 flex flex-col gap-4">
      <h3 className="font-heading text-sm font-bold text-muted-foreground tracking-widest uppercase">Grid Stats</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Sensor Math Column */}
        <div className="flex flex-col gap-2 border-r border-border/50 pr-4">
          <StatRow label="Avg Temp" value={avgTemp} unit="°C" />
          <StatRow label="Avg Humid" value={avgHumid} unit="%" />
          <StatRow label="Min Temp" value={minTemp} unit="°C" />
          <StatRow label="Max Temp" value={maxTemp} unit="°C" />
        </div>

        {/* Cell Counts Column */}
        <div className="flex flex-col gap-2 pl-2">
          <StatRow label="Visited" value={visited} sub={`${((visited / total) * 100).toFixed(1)}%`} />
          <StatRow label="Unknown" value={unknown} sub={`${((unknown / total) * 100).toFixed(1)}%`} />
          <StatRow label="Free" value={free} sub={`${((free / total) * 100).toFixed(1)}%`} />
          <StatRow label="Obstacle" value={obstacle} sub={`${((obstacle / total) * 100).toFixed(1)}%`} />
        </div>
      </div>
    </div>
  );
}

// Reusable mini-component for the layout rows
function StatRow({ label, value, unit = '', sub = '' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="font-mono text-foreground font-medium">{value}{unit}</span>
        {sub && <span className="text-xs text-muted-foreground ml-2 font-mono opacity-60">{sub}</span>}
      </div>
    </div>
  );
}