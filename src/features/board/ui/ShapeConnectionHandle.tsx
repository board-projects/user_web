"use client";

import type { PointerEvent } from "react";
import { useBoardStore } from "../store/board.store";

function getBoardPoint(event: PointerEvent<HTMLButtonElement>) {
  const viewport = event.currentTarget.closest("[data-board-viewport]");
  if (!viewport) return null;

  const rect = viewport.getBoundingClientRect();
  const zoom = useBoardStore.getState().zoom;
  return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom };
}

export function ShapeConnectionHandle({ shapeId }: { shapeId: string }) {
  const { startConnection, moveConnection, finishConnection, cancelConnecting } =
    useBoardStore.getState();

  return (
    <button
      type="button"
      data-connection-handle
      aria-label="Drag to connect to another shape"
      title="Drag to connect"
      className="absolute -right-6 top-1/2 z-10 h-4 w-4 -translate-y-1/2 touch-none rounded-full border-2 border-blue-600 bg-white shadow cursor-crosshair"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        const point = getBoardPoint(event);
        if (!point) return;

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        startConnection(shapeId, point);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const point = getBoardPoint(event);
        if (point) moveConnection(point);
      }}
      onPointerUp={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const targetId = target?.closest<HTMLElement>("[data-shape-id]")?.dataset.shapeId;
        finishConnection(targetId ?? null);
      }}
      onLostPointerCapture={cancelConnecting}
    />
  );
}
