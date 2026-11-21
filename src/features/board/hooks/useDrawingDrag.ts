import { useRef, type PointerEvent } from "react";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";

export function useDrawingDrag() {
  const pointer = useRef<(Point & { id: number }) | null>(null);

  const onPointerDown = (id: string, event: PointerEvent<SVGPathElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    const state = useBoardStore.getState();
    if (state.tool !== "select" || state.panMode) return;

    event.stopPropagation();
    event.preventDefault();
    state.selectDrawing(id);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const onPointerMove = (event: PointerEvent<SVGPathElement>) => {
    const start = pointer.current;
    if (start?.id !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const { zoom, moveMarquee } = useBoardStore.getState();
    moveMarquee({
      x: (event.clientX - start.x) / zoom,
      y: (event.clientY - start.y) / zoom,
    });
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const end = (event: PointerEvent<SVGPathElement>) => {
    if (pointer.current?.id === event.pointerId) pointer.current = null;
  };

  return { onPointerDown, onPointerMove, end };
}
