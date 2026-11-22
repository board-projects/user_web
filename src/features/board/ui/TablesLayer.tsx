import { useRef, useState, type ComponentProps } from "react";
import { Rnd } from "react-rnd";
import { tableConnectable } from "../domain/connectableItems";
import { TABLE_LIMITS } from "../domain/tables";
import type { TableItem } from "../domain/types";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { useBoardStore } from "../store/board.store";
import { selectionKey } from "../store/slices/selection.slice";
import { ConnectionPorts } from "./ConnectionPorts";
import { TableCellEditors } from "./TableCellEditors";
import { TableDividers } from "./TableDividers";
import { TableGrid } from "./TableGrid";
import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";

function TableFrame({ table }: { table: TableItem }) {
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const zoom = useBoardStore((state) => state.zoom);
  const canEdit = useBoardStore((state) => state.tool === "select" && !state.panMode);
  const item = { type: "table" as const, id: table.id };
  const key = selectionKey(item.type, item.id);
  const selected = useBoardStore((state) => state.selection?.type === "table" && state.selection.id === table.id);
  const inGroup = useBoardStore((state) => state.marqueeSelection?.items.has(key));
  const moveTable = useBoardStore((state) => state.moveTable);
  const resizeTable = useBoardStore((state) => state.resizeTable);
  const setCell = useBoardStore((state) => state.setTableCell);
  const setTracks = useBoardStore((state) => state.setTableTracks);
  const dragItem = useBoardItemDrag();
  const initialSize = useRef<TableItem | null>(null);

  const resize: ComponentProps<typeof Rnd>["onResize"] = (_, __, node, ___, position) => {
    resizeTable(table.id, { width: node.offsetWidth, height: node.offsetHeight }, position, initialSize.current ?? table);
  };

  return (
    <Rnd
      position={{ x: table.x, y: table.y }}
      size={{ width: table.width, height: table.height }}
      scale={zoom}
      minWidth={TABLE_LIMITS.minTrack * table.columns.length}
      minHeight={TABLE_LIMITS.minTrack * table.rows.length}
      maxWidth={TABLE_LIMITS.maxSize}
      maxHeight={TABLE_LIMITS.maxSize}
      disableDragging={!canEdit}
      enableResizing={selected && canEdit ? { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true } : false}
      resizeHandleComponent={itemResizeHandles}
      onResizeStart={() => { initialSize.current = table; }}
      onResize={resize}
      onResizeStop={(...args) => {
        resize(...args);
        initialSize.current = null;
      }}
      cancel="[data-connection-handle], [data-table-divider], [contenteditable]"
      data-board-selection-key={key}
      data-board-connectable-id={table.id}
      data-interactive="true"
      className="pointer-events-auto touch-none"
      {...dragItem(item, table, (position) => moveTable(table.id, position), true)}
    >
      <div
        className="h-full w-full cursor-move"
        style={itemSelectionStyle(selected || !!inGroup)}
        onClick={() => { if (canEdit) selectBoardItem(item); }}
      >
        <svg className="pointer-events-none block h-full w-full" viewBox={`0 0 ${table.width} ${table.height}`} role="img"
          aria-label={`Table with ${table.rows.length} rows and ${table.columns.length} columns`}>
          <TableGrid {...table} hiddenCell={canEdit ? activeCell ?? undefined : undefined} />
        </svg>
        {canEdit && <TableCellEditors table={table} keyboardEnabled={selected} active={activeCell} setActive={setActiveCell}
          save={(row, column, text, runs) => setCell(table.id, row, column, text, runs)} />}
      </div>
      {selected && canEdit && (
        <>
          <TableDividers axis="rows" tracks={table.rows} zoom={zoom} update={(tracks) => setTracks(table.id, "rows", tracks)} />
          <TableDividers axis="columns" tracks={table.columns} zoom={zoom} update={(tracks) => setTracks(table.id, "columns", tracks)} />
        </>
      )}
      <ConnectionPorts item={tableConnectable(table)} selected={selected} />
    </Rnd>
  );
}

export function TablesLayer() {
  const tables = useBoardStore((state) => state.tables);
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {tables.map((table) => <TableFrame key={table.id} table={table} />)}
    </div>
  );
}
