import { supabase } from './supabaseClient';

// ─── Grid constants ─────────────────────────────────────────────
export const GRID_SIZE = 61;

// Cell state types (Keeping these for your UI rendering)
export const CELL_UNKNOWN   = '?';
export const CELL_OBSTACLE  = '#';
export const CELL_FREE      = '.';
export const CELL_VISITED   = '';

// ─── Supabase fetchers ────────────────────────────────────────────

// 1. Fetch entire initial layout directly from grid_cells (WITH PADDING)
export async function fetchGridData() {
  const { data, error } = await supabase
    .from('grid_cells')
    .select('*');

  if (error) {
    console.error("Error fetching grid data:", error);
    return [];
  }

  // Create a dictionary of existing cells for fast lookup
  const dbCellMap = {};
  (data || []).forEach(cell => {
    dbCellMap[`${cell.x},${cell.y}`] = cell;
  });

  // Build a complete 61x61 array so the CSS Grid layout stays perfectly rigid
  const fullGrid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const dbCell = dbCellMap[`${x},${y}`];
      
      if (dbCell) {
        // If the robot has data for this coordinate, use it
        fullGrid.push({
          ...dbCell,
          row: dbCell.y,
          col: dbCell.x,
          state: dbCell.state === 'obstacle' ? CELL_OBSTACLE : (dbCell.state === 'free' ? CELL_FREE : CELL_UNKNOWN),
          temperature: dbCell.temperature,
          humidity: dbCell.humidity
        });
      } else {
        // If the robot hasn't been here yet, render an empty 'Unknown' space
        fullGrid.push({
          row: y,
          col: x,
          state: CELL_UNKNOWN
        });
      }
    }
  }
  
  return fullGrid;
}

// 2. Fetch Latest Metrics card values from grid_cells (USING LIVE COLUMNS)
export async function fetchLatestMetrics() {
  const { data, error } = await supabase
    .from('grid_cells')
    .select('*')
    .not('temperature', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return {
      robotX: 30, robotY: 30, temperature: 0, humidity: 0, battery: 100, signal: 100, speed: 0, timestamp: new Date().toISOString()
    };
  }

  return {
    robotX: data.x,
    robotY: data.y,
    temperature: data.temperature ?? 0,
    humidity: data.humidity ?? 0,
    battery: data.battery ?? 100,  // <-- Uses real column now
    signal: data.signal ?? 90,     // <-- Uses real column now
    speed: data.speed ?? 0,        // <-- Uses real column now
    timestamp: data.updated_at
  };
}

// 3. Live Metrics Card Feed Subscription (USING LIVE COLUMNS)
export async function subscribeToMetrics(callback) {
  const channel = supabase
    .channel('live-metrics')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'grid_cells' }, (payload) => {
      const updated = payload.new;
      if (updated) {
        callback({
          robotX: updated.x,
          robotY: updated.y,
          temperature: updated.temperature ?? 0,
          humidity: updated.humidity ?? 0,
          battery: updated.battery ?? 100,  // <-- Uses real column now
          signal: updated.signal ?? 90,     // <-- Uses real column now
          speed: updated.speed ?? 0,        // <-- Uses real column now
          timestamp: updated.updated_at
        });
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// 3. Live Metrics Card Feed Subscription
export async function subscribeToMetrics(callback) {
  const channel = supabase
    .channel('live-metrics')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'grid_cells' }, (payload) => {
      const updated = payload.new;
      if (updated) {
        callback({
          robotX: updated.x,
          robotY: updated.y,
          temperature: updated.temperature ?? 0,
          humidity: updated.humidity ?? 0,
          battery: 80,
          signal: 100,
          speed: 0.4,
          timestamp: updated.updated_at
        });
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// 4. Live Map Tiles Sync Subscription
export async function subscribeToGridUpdates(callback) {
  const channel = supabase
    .channel('live-grid-tiles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'grid_cells' }, (payload) => {
      const updated = payload.new;
      if (updated) {
        // Remap incoming real-time updates to match UI elements
        callback({
          eventType: payload.eventType,
          new: {
            ...updated,
            row: updated.y,
            col: updated.x,
            state: updated.state === 'obstacle' ? CELL_OBSTACLE : (updated.state === 'free' ? CELL_FREE : CELL_UNKNOWN)
          }
        });
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}