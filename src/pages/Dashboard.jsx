import React, { useState, useEffect, useRef } from 'react';
import GridMap from '@/components/robot/GridMap';
import MetricCard from '@/components/robot/MetricCard';
import CoordinatePanel from '@/components/robot/CoordinatePanel';
import GridStats from '@/components/robot/GridStats';
import StatusBar from '@/components/robot/StatusBar';
import {
  fetchGridData,
  fetchLatestMetrics,
  subscribeToMetrics,
  subscribeToGridUpdates,
  GRID_SIZE,
} from '@/lib/robotDataService';

export default function Dashboard() {
  const [cells, setCells] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [heatMode, setHeatMode] = useState('temperature');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadingGrid, setLoadingGrid] = useState(true);
  const prevMetrics = useRef(null);

  // ── Initial grid load ──────────────────────────────────────────
  useEffect(() => {
    fetchGridData()
      .then(data => { setCells(data); })
      .catch(err => console.error('Grid fetch error:', err))
      .finally(() => setLoadingGrid(false));
  }, []);

  // ── Metrics load ───────────────────────────────────────────────
  useEffect(() => {
    fetchLatestMetrics()
      .then(m => {
        prevMetrics.current = null;
        setMetrics(m);
        setLastUpdated(m.timestamp || new Date().toISOString());
      })
      .catch(err => console.error('Metrics fetch error:', err));
  }, []);

  // ── Real-time Supabase subscriptions ───────────────────────────
  useEffect(() => {
    let unsub = () => {};
    subscribeToMetrics((newMetrics) => {
      prevMetrics.current = metrics;
      setMetrics(newMetrics);
      setLastUpdated(newMetrics.timestamp);
    }).then(fn => { unsub = fn; }).catch(err => console.error('Metrics sub error:', err));
    return () => unsub();
  }, []);

  useEffect(() => {
    let unsub = () => {};
    subscribeToGridUpdates((payload) => {
      const { eventType, new: newCell } = payload;
      setCells(prev => {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const idx = prev.findIndex(c => c.row === newCell.row && c.col === newCell.col);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = newCell;
            return next;
          }
          return [...prev, newCell];
        }
        return prev;
      });
    }).then(fn => { unsub = fn; }).catch(err => console.error('Grid sub error:', err));
    return () => unsub();
  }, []);

  const robotX = metrics?.robotX ?? 30;
  const robotY = metrics?.robotY ?? 30;

  // ── Derived trends from prev metrics ──────────────────────────
  const tempTrend = metrics && prevMetrics.current
    ? metrics.temperature - prevMetrics.current.temperature : 0;
  const humidTrend = metrics && prevMetrics.current
    ? metrics.humidity - prevMetrics.current.humidity : 0;
  const battTrend = metrics && prevMetrics.current
    ? metrics.battery - prevMetrics.current.battery : 0;

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--neon-cyan) / 0.4)', boxShadow: '0 0 12px hsl(var(--neon-cyan) / 0.2)' }} />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="3" fill="hsl(var(--neon-cyan))" />
              <circle cx="9" cy="9" r="6" stroke="hsl(var(--neon-cyan))" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <line x1="9" y1="2" x2="9" y2="0" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5" opacity="0.7" />
              <line x1="9" y1="16" x2="9" y2="18" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5" opacity="0.7" />
              <line x1="2" y1="9" x2="0" y2="9" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5" opacity="0.7" />
              <line x1="16" y1="9" x2="18" y2="9" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5" opacity="0.7" />
            </svg>
          </div>
          <div>
            <div className="font-heading text-sm font-bold tracking-widest uppercase neon-text-cyan">ROVER_OS</div>
            <div className="font-mono text-xs text-muted-foreground tracking-wider">Autonomous Tracking System</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <span>GRID</span>
            <span className="text-foreground/60">{GRID_SIZE}×{GRID_SIZE}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-muted-foreground">
            <span>CELLS</span>
            <span className="text-foreground/60">{(GRID_SIZE * GRID_SIZE).toLocaleString()}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 blink" />
            <span className="neon-text-green font-semibold">ACTIVE</span>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col gap-4 p-4 md:p-5 overflow-auto">
        {/* Status bar */}
        <StatusBar metrics={metrics} lastUpdated={lastUpdated} />

        {/* Body: grid + right sidebar */}
        <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0">

          {/* ── Grid map panel ─────────────────────────────────── */}
          <div className="flex-1 panel-glass rounded-2xl p-4 min-h-0 flex flex-col"
            style={{ minHeight: '420px' }}
          >
            {loadingGrid ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.4)' }} />
                  <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-accent animate-spin" style={{ animationDirection: 'reverse', boxShadow: '0 0 8px hsl(var(--accent) / 0.4)' }} />
                </div>
                <div className="font-mono text-sm text-muted-foreground tracking-widest">LOADING MAP DATA…</div>
              </div>
            ) : (
              <GridMap
                cells={cells}
                robotX={robotX}
                robotY={robotY}
                heatMode={heatMode}
                onHeatModeChange={setHeatMode}
              />
            )}
          </div>

          {/* ── Right sidebar ───────────────────────────────────── */}
          <div className="xl:w-72 2xl:w-80 flex flex-col gap-4">

            {/* Coordinates */}
            <CoordinatePanel
              robotX={robotX}
              robotY={robotY}
              uptime={metrics?.uptime ?? 0}
            />

            {/* Metric cards */}
            <div className="grid grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
              <MetricCard
                icon="🌡"
                label="Temperature"
                value={metrics?.temperature?.toFixed(1) ?? '—'}
                unit="°C"
                accentClass="text-orange-400"
                barValue={metrics ? ((metrics.temperature - 15) / 30) * 100 : 0}
                barColor="#f97316"
                trend={tempTrend}
                sub="Ambient sensor"
              />
              <MetricCard
                icon="💧"
                label="Humidity"
                value={metrics?.humidity?.toFixed(1) ?? '—'}
                unit="%"
                accentClass="text-sky-400"
                barValue={metrics?.humidity ?? 0}
                barColor="#38bdf8"
                trend={humidTrend}
                sub="Relative humidity"
              />
              <MetricCard
                icon="🔋"
                label="Battery"
                value={metrics?.battery?.toFixed(0) ?? '—'}
                unit="%"
                accentClass={(metrics?.battery ?? 100) < 20 ? 'neon-text-red' : 'neon-text-green'}
                barValue={metrics?.battery ?? 0}
                barColor={(metrics?.battery ?? 100) < 20 ? '#ef4444' : '#22c55e'}
                trend={battTrend}
                sub={metrics?.battery < 20 ? '⚠ Low charge' : 'Nominal'}
              />
              <MetricCard
                icon="📡"
                label="Signal"
                value={metrics?.signal?.toFixed(0) ?? '—'}
                unit="%"
                accentClass="neon-text-cyan"
                barValue={metrics?.signal ?? 0}
                barColor="hsl(var(--neon-cyan))"
                sub="Uplink strength"
              />
              <MetricCard
                icon="⚡"
                label="Speed"
                value={metrics?.speed?.toFixed(2) ?? '—'}
                unit="m/s"
                accentClass="text-violet-400"
                barValue={metrics ? (metrics.speed / 1.5) * 100 : 0}
                barColor="#a78bfa"
                sub="Current velocity"
              />
            </div>

            {/* Grid stats */}
            <GridStats cells={cells} />
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 px-4 md:px-6 py-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground/50">
        <span>ROVER_OS v2.4.1 — Autonomous Tracking Platform</span>
        <span className="hidden sm:block">⚡ Live Supabase Feed</span>
      </footer>
    </div>
  );
}