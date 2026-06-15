import React from 'react';
export default function StatusBar({ metrics, lastUpdated }) {
  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 rounded-xl panel-glass text-xs font-mono">
      <div className="flex items-center gap-4">
        {/* System status */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 blink" />
          <span className="neon-text-green font-semibold tracking-wider">SYS_ONLINE</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="tracking-wider text-emerald-400">SUPABASE_CONNECTED</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="hidden md:block">
          last sync: <span className="text-foreground/80">{fmt(lastUpdated)}</span>
        </span>
        <span>
          robot@<span className="text-primary">{metrics?.robotX ?? '--'},{metrics?.robotY ?? '--'}</span>
        </span>
        <span className={`${(metrics?.battery ?? 100) < 20 ? 'neon-text-red' : 'text-foreground/60'}`}>
          BAT {(metrics?.battery ?? 0).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}