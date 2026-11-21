import { useRef, type PointerEvent } from "react";
import { getDrawingFrame } from "../domain/drawings";
import { snapToPageDots } from "../domain/pageSnap";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";

export function useDrawingDrag() {
  const pointer = useRef<{
    id: number;
    start: Point;
    frame: NonNullable<ReturnType<typeof getDrawingFrame>>;
    position: Point;
  } | null>(null);

  const onPointerDown = (id: string, event: PointerEvent<SVGPathElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    const state = useBoardStore.getState();
    if (state.tool !== "select" || state.panMode) return;

    event.stopPropagation();
    event.preventDefault();
    state.selectDrawing(id);
    const selection = useBoardStore.getState().marqueeSelection;
    const frame = selection && getDrawingFrame(selection.lines);
    if (!frame) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, frame, position: frame };
  };

  const onPointerMove = (event: PointerEvent<SVGPathElement>) => {
    const start = pointer.current;
    if (start?.id !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const { zoom, moveMarquee, sheets } = useBoardStore.getState();
    const position = snapToPageDots({
      x: start.frame.x + (event.clientX - start.start.x) / zoom,
      y: start.frame.y + (event.clientY - start.start.y) / zoom,
    }, start.frame, sheets);
    moveMarquee({ x: position.x - start.position.x, y: position.y - start.position.y });
    start.position = position;
  };

  const end = (event: PointerEvent<SVGPathElement>) => {
    if (pointer.current?.id === event.pointerId) pointer.current = null;
  };

  return { onPointerDown, onPointerMove, end };
}
