import { tableCellKey } from "../domain/itemText";
import { ItemText } from "./ItemText";
import { tableDividers } from "../domain/tables";
import type { TableItem } from "../domain/types";

export function TableGrid({ width, height, rows, columns, cells }: Pick<TableItem, "width" | "height" | "rows" | "columns" | "cells">) {
  const verticals = tableDividers(columns).map((x) => `M${x} 0V${height}`);
  const horizontals = tableDividers(rows).map((y) => `M0 ${y}H${width}`);

  const rowStarts = [0, ...tableDividers(rows)];
  const columnStarts = [0, ...tableDividers(columns)];

  return (
    <>
      <rect x={0} y={0} width={width} height={height} fill="white" stroke="#78716c" strokeWidth={2} />
      <path d={[...verticals, ...horizontals].join(" ")} fill="none" stroke="#a8a29e" />
      {cells && rows.map((height, row) => columns.map((width, column) => {
        const key = tableCellKey(row, column);
        return <ItemText key={key} x={columnStarts[column]} y={rowStarts[row]} width={width} height={height} text={cells[key]} />;
      }))}
    </>
  );
}
