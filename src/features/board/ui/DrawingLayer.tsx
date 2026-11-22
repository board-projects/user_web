"use client";

import { useMemo, useRef, type ComponentProps } from "react";
import { DrawingText } from "./DrawingText";
import { Rnd } from "react-rnd";
import { getDrawingFrame, groupDrawingLines, type DrawingFrame } from "../domain/drawings";
import { useDrawingDrag } from "../hooks/useDrawingDrag";
import { useBoardStore } from "../store/board.store";
import { itemResizeHandles, itemSelectionStyle } from "./itemSelection";

function DrawingResizeFrame({ frame, zoom }: { frame: DrawingFrame; zoom: number }) {
  const previous = useRef<DrawingFrame | null>(null);
  const resize: ComponentProps<typeof Rnd>["onResize"] = (_, __, element, ___, position) => {
    if (!previous.current) return;

    const next = { ...position, width: element.offsetWidth, height: element.offsetHeight };
    useBoardStore.getState().resizeDrawing(previous.current, next);
    previous.current = next;
  };

  return (
    <Rnd
      data-interactive="true"
      className="pointer-events-none z-[60]"
      scale={zoom}
      position={{ x: frame.x, y: frame.y }}
      size={{ width: frame.width, height: frame.height }}
      minWidth={12}
      minHeight={12}
      disableDragging
      enableResizing={{ topLeft: true, topRight: true, bottomLeft: true, bottomRight: true }}
      resizeHandleComponent={itemResizeHandles}
      resizeHandleClasses={{
        topLeft: "pointer-events-auto", topRight: "pointer-events-auto",
        bottomLeft: "pointer-events-auto", bottomRight: "pointer-events-auto",
      }}
      onResizeStart={() => { previous.current = frame; }}
      onResize={resize}
      onResizeStop={(...args) => { resize(...args); previous.current = null; }}
    >
      <div data-board-drawing-selection className="h-full w-full" style={itemSelectionStyle(true)} />
    </Rnd>
  );
}

export function DrawingLayer() {
  const lines = useBoardStore((state) => state.lines);
  const selection = useBoardStore((state) => state.marqueeSelection);
  const zoom = useBoardStore((state) => state.zoom);
  const interactive = useBoardStore((state) => state.tool === "select" && !state.panMode && !state.connectionDraft);
  const drawDrag = useDrawingDrag();
  const drawings = useMemo(() => groupDrawingLines(lines), [lines]);
  const frame = selection?.lines.size && !selection.items.size ? getDrawingFrame(selection.lines) : null;

  return (
    <>
      <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
        {Array.from(drawings, ([id, segments]) => (
          <path
            key={id}
            data-interactive="true"
            role="button"
            aria-label="Select drawing"
            aria-pressed={!!selection?.lines.has(segments[0])}
            tabIndex={interactive ? 0 : -1}
            d={segments.map(({ from, to }) => `M${from.x},${from.y} L${to.x},${to.y}`).join(" ")}
            fill="none"
            stroke="transparent"
            strokeWidth={segments.reduce((width, { size }) => Math.max(width, size), 16 / zoom)}
            strokeLinecap="round"
            style={{ pointerEvents: interactive ? "stroke" : "none", cursor: "move" }}
            onPointerDown={(event) => drawDrag.onPointerDown(id, event)}
            onPointerMove={drawDrag.onPointerMove}
            onLostPointerCapture={drawDrag.end}
            onKeyDown={(event) => {
              if (interactive && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                useBoardStore.getState().selectDrawing(id);
              }
            }}
          />
        ))}
        {Array.from(drawings, ([id, segments]) => <DrawingText key={id} lines={segments} />)}
      </svg>
      {frame && <DrawingResizeFrame frame={frame} zoom={zoom} />}
    </>
  );
}
