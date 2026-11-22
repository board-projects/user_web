import { useRef, useState, type MouseEvent } from "react";
import { CELL_TEXT_LIMIT, tableCellKey } from "../domain/itemText";
import type { TableItem } from "../domain/types";
import { InlineItemTextEditor } from "./InlineItemTextEditor";

export function TableCellEditors({ table, save, keyboardEnabled }: {
  table: TableItem;
  save: (row: number, column: number, text: string) => void;
  keyboardEnabled: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const open = (event: MouseEvent, key: string) => {
    event.stopPropagation();
    setActive(key);
  };

  return (
    <div className="absolute inset-0 grid"
      style={{ gridTemplateRows: table.rows.map((size) => `${size}px`).join(" "), gridTemplateColumns: table.columns.map((size) => `${size}px`).join(" ") }}>
      {table.rows.map((_, row) => table.columns.map((_, column) => {
        const key = tableCellKey(row, column);
        const value = table.cells?.[key] ?? "";
        const label = `Row ${row + 1}, column ${column + 1}`;
        if (active === key) {
          return <InlineItemTextEditor key={key} label={label} value={value} maxLength={CELL_TEXT_LIMIT}
            commit={(text) => save(row, column, text)} close={() => setActive(null)} />;
        }
        return (
          <button key={key} type="button" aria-label={value ? `${label}: ${value}` : label}
            tabIndex={keyboardEnabled ? 0 : -1}
            className="h-full w-full cursor-move focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            onPointerDown={(event) => {
              if (event.pointerType === "touch" && event.isPrimary) {
                touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
              }
            }}
            onPointerUp={(event) => {
              const start = touch.current;
              if (start?.id !== event.pointerId) return;
              touch.current = null;
              if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8) open(event, key);
            }}
            onPointerCancel={() => { touch.current = null; }}
            onDoubleClick={(event) => open(event, key)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setActive(key);
            }} />
        );
      }))}
    </div>
  );
}
