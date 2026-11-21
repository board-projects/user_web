"use client";

import type { ComponentProps } from "react";
import { Rnd } from "react-rnd";
import { pageConnectable } from "../domain/connectableItems";
import { selectBoardItem, useBoardItemDrag } from "../hooks/useBoardItemDrag";
import { useBoardStore } from "../store/board.store";
import { selectionKey } from "../store/slices/selection.slice";
import { SheetRuler } from "@/features/design/ui/SheetRuler";
import { SHEET_LIMITS } from "@/features/design/domain/sheetLayout";
import { ConnectionPorts } from "./ConnectionPorts";
import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";

export function PageItemsLayer() {
  const pages = useBoardStore((state) => state.sheets);
  const zoom = useBoardStore((state) => state.zoom);
  const selection = useBoardStore((state) => state.selection);
  const marquee = useBoardStore((state) => state.marqueeSelection?.items);
  const connections = useBoardStore((state) => state.connections);
  const updatePage = useBoardStore((state) => state.updatePage);
  const dragItem = useBoardItemDrag();

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {pages.map((page) => {
        const item = { type: "page" as const, id: page.id };
        const key = selectionKey(item.type, item.id);
        const selected = selection?.type === item.type && selection.id === item.id;
        const connected = connections.some(({ sourceId, targetId }) => sourceId === page.id || targetId === page.id);
        const resize: ComponentProps<typeof Rnd>["onResize"] = (_, __, node, ___, position) =>
          updatePage(page.id, { ...position, width: node.offsetWidth, height: node.offsetHeight });

        return (
          <Rnd
            key={page.id}
            position={{ x: page.x, y: page.y }}
            size={{ width: page.width, height: page.height }}
            scale={zoom}
            minWidth={SHEET_LIMITS.min}
            minHeight={SHEET_LIMITS.min}
            maxWidth={SHEET_LIMITS.max}
            maxHeight={SHEET_LIMITS.max}
            enableResizing={selected}
            resizeHandleComponent={itemResizeHandles}
            resizeHandleClasses={{
              topLeft: "pointer-events-auto", topRight: "pointer-events-auto",
              bottomLeft: "pointer-events-auto", bottomRight: "pointer-events-auto",
            }}
            onResize={connected ? resize : undefined}
            onResizeStop={resize}
            dragHandleClassName="page-item-drag-handle"
            cancel="[data-connection-handle]"
            data-board-selection-key={key}
            data-board-page-frame
            data-board-connectable-id={page.id}
            data-interactive="true"
            className="pointer-events-none"
            {...dragItem(item, page, (position) => updatePage(page.id, position), connected)}
          >
            <div className="h-full w-full border border-cyan-300 shadow-sm" style={itemSelectionStyle(selected || !!marquee?.has(key))} />
            <button
              type="button"
              className="page-item-drag-handle pointer-events-auto absolute bottom-full left-0 max-w-full cursor-move touch-none overflow-hidden text-ellipsis whitespace-nowrap rounded-t-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-left text-xs font-semibold text-cyan-950"
              onClick={() => selectBoardItem(item)}
            >
              {page.title.trim() || "Untitled page"}
            </button>
            {selected && (
              <>
                <div className="absolute left-0 top-full">
                  <SheetRuler axis="horizontal" length={page.width} scale={1} unit={page.unit} />
                </div>
                <div className="absolute right-full top-0">
                  <SheetRuler axis="vertical" length={page.height} scale={1} unit={page.unit} />
                </div>
              </>
            )}
            <ConnectionPorts item={pageConnectable(page)} selected={selected} />
          </Rnd>
        );
      })}
    </div>
  );
}
