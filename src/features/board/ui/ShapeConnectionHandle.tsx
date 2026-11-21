"use client";

import type { PointerEvent } from "react";
import { getNearestShapePort, getShapePortPoint } from "../domain/shapeGeometry";
import { SHAPE_PORTS, type Shape, type ShapePort } from "../domain/types";
import { useBoardStore } from "../store/board.store";

function getBoardPoint(event: PointerEvent<HTMLButtonElement>) {
  const viewport = event.currentTarget.closest("[data-board-viewport]");
  if (!viewport) return null;

  const rect = viewport.getBoundingClientRect();
  const zoom = useBoardStore.getState().zoom;
  return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom };
}

export function ShapeConnectionHandle({ shape, port }: { shape: Shape; port: ShapePort }) {
  const snapped = useBoardStore((state) => {
    const target = state.connectionDraft?.snapTarget;
    return target?.id === shape.id && target.port === port;
  });
  const position = getShapePortPoint(shape, port);
  const { startConnection, moveConnection, finishConnection, cancelConnecting } =
    useBoardStore.getState();

  return (
    <button
      type="button"
      data-connection-handle={port}
      aria-label={`Drag to connect from the ${port} side`}
      title={`Connect from ${port}`}
      className={`absolute z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-blue-600 shadow cursor-crosshair ${snapped ? "bg-blue-600 ring-4 ring-blue-200" : "bg-white"}`}
      style={{ left: position.x - shape.x, top: position.y - shape.y }}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        const point = getBoardPoint(event);
        if (!point) return;

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        startConnection(shape.id, port, position);
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
        const targetShape = useBoardStore.getState().shapes.find(({ id }) => id === targetId);
        const point = getBoardPoint(event);
        if (!targetShape || !point) {
          finishConnection(point, null);
          return;
        }

        const handle = target?.closest<HTMLElement>("[data-connection-handle]");
        const targetPort = SHAPE_PORTS.find((side) => handle?.dataset.connectionHandle === side)
          ?? getNearestShapePort(targetShape, point);
        finishConnection(point, { id: targetShape.id, port: targetPort });
      }}
      onLostPointerCapture={cancelConnecting}
    />
  );
}
