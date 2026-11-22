import type { TextRun } from "./richText";
import type { TableItem } from "./types";

export const CELL_TEXT_LIMIT = 120;

export const tableCellKey = (row: number, column: number) => `${row}:${column}`;

export function withTableCell(table: TableItem, row: number, column: number, text: string, runs?: TextRun[]): TableItem {
  if (!Number.isInteger(row) || !Number.isInteger(column) ||
      row < 0 || column < 0 || row >= table.rows.length || column >= table.columns.length) return table;

  const key = tableCellKey(row, column);
  const value = text.slice(0, CELL_TEXT_LIMIT);
  if ((table.cells?.[key] ?? "") === value && runs === undefined) return table;

  const cells = { ...table.cells };
  if (value) cells[key] = value;
  else delete cells[key];
  const cellRuns = { ...table.cellRuns };
  if (value && runs?.length) cellRuns[key] = runs;
  else delete cellRuns[key];
  return { ...table, cells, cellRuns };
}
