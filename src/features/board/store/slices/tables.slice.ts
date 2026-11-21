import type { StateCreator } from "zustand";
import { appendTableTrack, resizeTableTracks, tableSize, type TableAxis } from "../../domain/tables";
import type { Point, TableItem } from "../../domain/types";
import type { BoardState } from "../board.store";

export type TablesSlice = {
  tables: TableItem[];
  addTable: (table: TableItem) => void;
  moveTable: (id: string, position: Point) => void;
  resizeTable: (id: string, size: Partial<Pick<TableItem, "width" | "height">>, position?: Point, initial?: Pick<TableItem, "rows" | "columns">) => void;
  setTableTracks: (id: string, axis: TableAxis, tracks: number[]) => void;
  addTableTrack: (id: string, axis: TableAxis) => void;
};

export const createTablesSlice: StateCreator<BoardState, [], [], TablesSlice> = (set) => {
  const update = (id: string, change: (table: TableItem) => TableItem) =>
    set((state) => ({ tables: state.tables.map((table) => table.id === id ? change(table) : table) }));

  const withTracks = (table: TableItem, axis: TableAxis, tracks: number[]) => {
    const next = { ...table, [axis]: tracks };
    return { ...next, ...tableSize(next.rows, next.columns) };
  };

  return {
    tables: [],
    addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
    moveTable: (id, position) => update(id, (table) => ({ ...table, ...position })),
    resizeTable: (id, { width, height }, position, initial) => update(id, (table) => {
      const rows = height === undefined ? table.rows : resizeTableTracks(initial?.rows ?? table.rows, height);
      const columns = width === undefined ? table.columns : resizeTableTracks(initial?.columns ?? table.columns, width);
      return { ...table, ...position, rows, columns, ...tableSize(rows, columns) };
    }),
    setTableTracks: (id, axis, tracks) => update(id, (table) => withTracks(table, axis, tracks)),
    addTableTrack: (id, axis) => update(id, (table) => withTracks(table, axis, appendTableTrack(table[axis], axis))),
  };
};
