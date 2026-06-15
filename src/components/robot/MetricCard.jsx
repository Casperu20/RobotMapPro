import React from 'react';

export default function MetricCard({ icon, label, value, unit, sub, accentClass, barValue, barColor, trend }) {
  return (
    <div className={`panel-glass rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden metric-glow`}
      style={{ borderColor: 'hsl(var(--panel-border))' }}
    >
      {/* Background accent glow */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 pointer-events-none"
        style={{ background: barColor || 'hsl(var(--primary))', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">{label}</span>
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-mono ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className={`text-2xl font-heading font-bold tracking-tight ${accentClass || 'neon-text-cyan'}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-mono text-muted-foreground mb-0.5">{unit}</span>}
      </div>

      {sub && <div className="text-xs font-mono text-muted-foreground/70">{sub}</div>}

      {barValue !== undefined && (
        <div className="mt-1">
          <div className="w-full h-1 rounded-full" style={{ background: 'hsl(var(--border))' }}>
            <div
              className="h-1 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(0, barValue))}%`,
                background: barColor || 'hsl(var(--primary))',
                boxShadow: `0 0 6px ${barColor || 'hsl(var(--primary))'}`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}