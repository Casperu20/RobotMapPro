import React, { useMemo, useState, useCallback } from 'react';
import { CELL_UNKNOWN, CELL_OBSTACLE, CELL_FREE, CELL_VISITED, GRID_SIZE } from '@/lib/robotDataService';

// ─── Color helpers ────────────────────────────────────────────────
function temperatureColor(temp, humidity, heatMode) {
  if (heatMode === 'temperature') {
    // Cool blue → warm amber → hot red  (range ~18–40°C)
    const t = Math.max(0, Math.min(1, (temp - 18) / 22));
    if (t < 0.33) {
      const s = t / 0.33;
      return `rgb(${Math.round(30 + s * 30)}, ${Math.round(80 + s * 60)}, ${Math.round(180 - s * 30)})`;
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      return `rgb(${Math.round(60 + s * 130)}, ${Math.round(140 + s * 60)}, ${Math.round(150 - s * 130)})`;
    } else {
      const s = (t - 0.66) / 0.34;
      return `rgb(${Math.round(190 + s * 55)}, ${Math.round(200 - s * 150)}, ${Math.round(20 - s * 10)})`;
    }
  } else {
    // Humidity: dry tan → moist teal → saturated deep blue (range ~30–90%)
    const h = Math.max(0, Math.min(1, (humidity - 30) / 60));
    if (h < 0.4) {
      const s = h / 0.4;
      return `rgb(${Math.round(140 - s * 60)}, ${Math.round(100 + s * 80)}, ${Math.round(60 + s * 80)})`;
    } else {
      const s = (h - 0.4) / 0.6;
      return `rgb(${Math.round(80 - s * 50)}, ${Math.round(180 - s * 60)}, ${Math.round(140 + s * 80)})`;
    }
  }
}

function getCellStyle(cell, heatMode, isRobot, isHovered) {
  if (isRobot) {
    return {
      backgroundColor: '#00ffff',
      boxShadow: '0 0 6px 2px rgba(0,255,255,0.9)',
      zIndex: 10,
    };
  }
  if (isHovered && cell.state !== CELL_OBSTACLE) {
    return { outline: '1px solid rgba(0,255,255,0.7)', zIndex: 5 };
  }
  switch (cell.state) {
    case CELL_UNKNOWN:
      return { backgroundColor: 'hsl(220, 22%, 17%)' };
    case CELL_OBSTACLE:
      return { backgroundColor: '#7f1a1a', boxShadow: 'inset 0 0 3px rgba(255,40,40,0.3)' };
    case CELL_FREE:
      return { backgroundColor: 'hsl(200, 65%, 22%)' };
    case CELL_VISITED: {
      const color = temperatureColor(cell.temperature ?? 22, cell.humidity ?? 55, heatMode);
      return { backgroundColor: color };
    }
    default:
      return { backgroundColor: 'hsl(220, 22%, 17%)' };
  }
}

// ─── Single Cell ─────────────────────────────────────────────────
const GridCell = React.memo(({ cell, heatMode, isRobot, onHover, hoveredCell }) => {
  const isHovered = hoveredCell && hoveredCell.row === cell.row && hoveredCell.col === cell.col;
  const style = getCellStyle(cell, heatMode, isRobot, isHovered);
  return (
    <div
      className={`${isRobot ? 'grid-cell-robot' : ''}`}
      style={{ width: '100%', aspectRatio: '1', ...style, transition: 'background-color 0.4s ease' }}
      onMouseEnter={() => onHover(cell)}
      onMouseLeave={() => onHover(null)}
    />
  );
});
GridCell.displayName = 'GridCell';

// ─── Legend ──────────────────────────────────────────────────────
function MapLegend({ heatMode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(220, 22%, 17%)', border: '1px solid hsl(220,25%,28%)' }} />
        <span>Unknown <span className="text-muted-foreground/60">(?)</span></span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#7f1a1a' }} />
        <span>Obstacle <span className="text-muted-foreground/60">(#)</span></span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(200, 65%, 22%)' }} />
        <span>Free <span className="text-muted-foreground/60">(.)</span></span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-3 rounded-sm" style={{
          background: heatMode === 'temperature'
            ? 'linear-gradient(to right, rgb(30,120,180), rgb(100,170,80), rgb(245,150,20), rgb(245,50,10))'
            : 'linear-gradient(to right, rgb(140,130,60), rgb(80,180,140), rgb(30,120,220))'
        }} />
        <span>Visited <span className="text-muted-foreground/60">(heat)</span></span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#00ffff', boxShadow: '0 0 4px rgba(0,255,255,0.9)' }} />
        <span>Robot</span>
      </div>
    </div>
  );
}

// ─── Main Grid Map ────────────────────────────────────────────────
export default function GridMap({ cells, robotX, robotY, heatMode, onHeatModeChange }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const cellMap = useMemo(() => {
    const map = {};
    cells.forEach(c => { map[`${c.row},${c.col}`] = c; });
    return map;
  }, [cells]);

  const handleHover = useCallback((cell) => {
    setHoveredCell(cell);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-full" style={{ boxShadow: '0 0 6px hsl(var(--primary))' }} />
          <h2 className="font-heading text-sm font-semibold tracking-widest uppercase neon-text-cyan">
            Environment Map
          </h2>
          <span className="font-mono text-xs text-muted-foreground ml-1">61 × 61</span>
        </div>

        {/* Heat mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'hsl(220, 40%, 11%)' }}>
          {['temperature', 'humidity'].map(mode => (
            <button
              key={mode}
              onClick={() => onHeatModeChange(mode)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all duration-200 ${
                heatMode === mode
                  ? 'text-background font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={heatMode === mode ? {
                background: mode === 'temperature' ? '#c84b11' : '#0e6ba8',
                boxShadow: mode === 'temperature' ? '0 0 8px rgba(200,75,17,0.5)' : '0 0 8px rgba(14,107,168,0.5)'
              } : {}}
            >
              {mode === 'temperature' ? '🌡 Temp' : '💧 Humidity'}
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip row */}
      <div className="flex-shrink-0 h-5">
        {hoveredCell ? (
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-muted-foreground">
              <span className="text-primary">pos</span> ({hoveredCell.col}, {hoveredCell.row})
            </span>
            <span className={`
              ${hoveredCell.state === CELL_OBSTACLE ? 'neon-text-red' : ''}
              ${hoveredCell.state === CELL_FREE ? 'text-sky-400' : ''}
              ${hoveredCell.state === CELL_UNKNOWN ? 'text-muted-foreground' : ''}
              ${hoveredCell.state === CELL_VISITED ? 'neon-text-green' : ''}
            `}>
              {hoveredCell.state === CELL_OBSTACLE ? '# Obstacle' :
               hoveredCell.state === CELL_FREE ? '. Free space' :
               hoveredCell.state === CELL_UNKNOWN ? '? Unknown' : '✓ Visited'}
            </span>
            {hoveredCell.state === CELL_VISITED && (
              <>
                <span className="text-orange-400">
                  🌡 {hoveredCell.temperature?.toFixed(1)}°C
                </span>
                <span className="text-sky-400">
                  💧 {hoveredCell.humidity?.toFixed(1)}%
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs font-mono text-muted-foreground/50">Hover a cell for details</div>
        )}
      </div>

      {/* The grid */}
      <div className="flex-1 min-h-0 relative">
        <div
          className="w-full h-full overflow-auto rounded-lg"
          style={{ background: 'hsl(222, 47%, 4%)' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gap: '1px',
              padding: '4px',
              minWidth: '320px',
              aspectRatio: '1',
            }}
          >
            {cells.map((cell) => {
              const isRobot = cell.row === robotY && cell.col === robotX;
              return (
                <GridCell
                  key={`${cell.row}-${cell.col}`}
                  cell={cell}
                  heatMode={heatMode}
                  isRobot={isRobot}
                  onHover={handleHover}
                  hoveredCell={hoveredCell}
                />
              );
            })}
          </div>
        </div>
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanline rounded-lg pointer-events-none" />
      </div>

      {/* Legend */}
      <div className="flex-shrink-0">
        <MapLegend heatMode={heatMode} />
      </div>
    </div>
  );
}