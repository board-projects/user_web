import type { Point, TableItem } from "./types";

export const TABLE_LIMITS = { tracks: 30, minTrack: 24, maxSize: 4000 } as const;
export const TABLE_DEFAULTS = { rows: 3, columns: 3 } as const;
export type TableAxis = "rows" | "columns";

const trackSize: Record<TableAxis, number> = { rows: 40, columns: 112 };

export function tableSize(rows: readonly number[], columns: readonly number[]) {
  const total = (tracks: readonly number[]) => tracks.reduce((sum, size) => sum + size, 0);
  return { width: total(columns), height: total(rows) };
}

export function createTable(position: Point, rowCount: number, columnCount: number): TableItem {
  const tracks = (count: number, size: number) =>
    Array.from({ length: Math.min(TABLE_LIMITS.tracks, Math.max(1, Math.round(count))) }, () => size);
  const rows = tracks(rowCount, trackSize.rows);
  const columns = tracks(columnCount, trackSize.columns);
  return { id: crypto.randomUUID(), ...position, rows, columns, ...tableSize(rows, columns) };
}

export function resizeTableTracks(tracks: number[], size: number): number[] {
  const { minTrack, maxSize } = TABLE_LIMITS;
  const minimum = tracks.length * minTrack;
  const target = Math.max(minimum, Math.min(maxSize, Math.round(size)));
  const current = tracks.reduce((sum, track) => sum + track, 0);
  if (target === current) return tracks;

  let offset = 0;
  return tracks.map((track) => {
    const weight = current === minimum ? 1 / tracks.length : (track - minTrack) / (current - minimum);
    const next = offset + weight * (target - minimum);
    const size = minTrack + Math.round(next) - Math.round(offset);
    offset = next;
    return size;
  });
}

export function appendTableTrack(tracks: number[], axis: TableAxis): number[] {
  if (tracks.length >= TABLE_LIMITS.tracks) return tracks;
  const total = tracks.reduce((sum, track) => sum + track, 0);
  return [...resizeTableTracks(tracks, Math.min(total, TABLE_LIMITS.maxSize - trackSize[axis])), trackSize[axis]];
}

export function moveTableDivider(tracks: number[], index: number, delta: number): number[] {
  const before = tracks[index];
  const after = tracks[index + 1];
  if (before === undefined || after === undefined) return tracks;
  const change = Math.max(TABLE_LIMITS.minTrack - before, Math.min(after - TABLE_LIMITS.minTrack, Math.round(delta)));
  if (!change) return tracks;
  const next = [...tracks];
  next[index] += change;
  next[index + 1] -= change;
  return next;
}

export function tableDividers(tracks: readonly number[]): number[] {
  let offset = 0;
  return tracks.slice(0, -1).map((size) => (offset += size));
}
