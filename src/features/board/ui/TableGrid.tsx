import { tableDividers } from "../domain/tables";
import type { TableItem } from "../domain/types";

export function TableGrid({ width, height, rows, columns }: Pick<TableItem, "width" | "height" | "rows" | "columns">) {
  const verticals = tableDividers(columns).map((x) => `M${x} 0V${height}`);
  const horizontals = tableDividers(rows).map((y) => `M0 ${y}H${width}`);

  return (
    <>
      <rect x={0} y={0} width={width} height={height} fill="white" stroke="#78716c" strokeWidth={2} />
      <path d={[...verticals, ...horizontals].join(" ")} fill="none" stroke="#a8a29e" />
    </>
  );
}
