import React from 'react';

function AxisBar({ label, value, max = 60, color }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground tracking-widest uppercase">{label}-axis</span>
        <span style={{ color }}>{value.toString().padStart(2, '0')}</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: 'hsl(var(--border))' }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default function CoordinatePanel({ robotX, robotY, uptime }) {
  const uptimeFmt = () => {
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = uptime % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="panel-glass rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-4 rounded-full" style={{ background: 'hsl(var(--neon-green))', boxShadow: '0 0 6px hsl(var(--neon-green))' }} />
        <h3 className="font-heading text-xs font-semibold tracking-widest uppercase neon-text-green">
          Active Coordinates
        </h3>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 blink" />
          <span className="text-xs font-mono text-emerald-400">LIVE</span>
        </div>
      </div>

      {/* Big coordinate display */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-mono text-muted-foreground tracking-widest">X</span>
          <span className="text-4xl font-heading font-bold neon-text-cyan"
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {String(robotX).padStart(2, '0')}
          </span>
        </div>
        <div className="flex flex-col items-center pb-1">
          <span className="text-2xl font-mono text-muted-foreground/40">,</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-mono text-muted-foreground tracking-widest">Y</span>
          <span className="text-4xl font-heading font-bold neon-text-green"
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {String(robotY).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Axis bars */}
      <div className="flex flex-col gap-2.5">
        <AxisBar label="X" value={robotX} color="hsl(var(--neon-cyan))" />
        <AxisBar label="Y" value={robotY} color="hsl(var(--neon-green))" />
      </div>

      {/* Uptime */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Uptime</span>
        <span className="text-sm font-heading font-semibold text-foreground/80">{uptimeFmt()}</span>
      </div>
    </div>
  );
}