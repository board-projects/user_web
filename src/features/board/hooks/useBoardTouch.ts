import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { transformViewport } from "../domain/viewportTransform";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";

export function useBoardTouch(viewport: RefObject<HTMLElement | null>, interrupt: () => void) {
  const interruptRef = useRef(interrupt);
  useLayoutEffect(() => { interruptRef.current = interrupt; });

  useEffect(() => {
    const board = viewport.current;
    if (!board) return;

    const touches = new Map<number, Point>();
    let claimed = false;

    const measure = () => {
      const iterator = touches.values();
      const first = iterator.next().value;
      const second = iterator.next().value;
      if (!first || !second) return null;

      const bounds = board.getBoundingClientRect();
      return {
        center: { x: (first.x + second.x) / 2 - bounds.left, y: (first.y + second.y) / 2 - bounds.top },
        distance: Math.max(1, Math.hypot(first.x - second.x, first.y - second.y)),
      };
    };

    const captureStart = () => {
      const measurement = measure();
      if (!measurement) return null;
      const { zoom, panX, panY } = useBoardStore.getState();
      return { ...measurement, view: { zoom, panX, panY } };
    };

    let start: ReturnType<typeof captureStart> = null;
    const stopGestureEvent = (event: Event) => {
      if (event.cancelable) event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touches.size < 2 && !claimed) return;

      if (!claimed) {
        claimed = true;
        interruptRef.current();
        for (const id of touches.keys()) board.setPointerCapture(id);
      } else {
        board.setPointerCapture(event.pointerId);
      }
      if (touches.size === 2) start = captureStart();
      stopGestureEvent(event);
    };

    const onMove = (event: PointerEvent) => {
      if (!touches.has(event.pointerId)) return;
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (!claimed) return;

      stopGestureEvent(event);
      const measurement = measure();
      if (!start || !measurement) return;
      const zoom = start.view.zoom * measurement.distance / start.distance;
      useBoardStore.setState(transformViewport(start.view, zoom, start.center, measurement.center));
    };

    const onEnd = (event: PointerEvent) => {
      if (!touches.has(event.pointerId)) return;
      if (claimed) stopGestureEvent(event);

      const [first, second] = touches.keys();
      touches.delete(event.pointerId);
      if (first === event.pointerId || second === event.pointerId) start = captureStart();
      if (!touches.size) claimed = false;
    };

    const blockItemTouchDrag = (event: TouchEvent) => {
      if (claimed || event.touches.length > 1) stopGestureEvent(event);
    };

    board.addEventListener("pointerdown", onDown, true);
    board.addEventListener("pointermove", onMove, true);
    board.addEventListener("pointerup", onEnd, true);
    board.addEventListener("pointercancel", onEnd, true);
    board.addEventListener("touchstart", blockItemTouchDrag, { capture: true, passive: false });
    board.addEventListener("touchmove", blockItemTouchDrag, { capture: true, passive: false });
    return () => {
      board.removeEventListener("pointerdown", onDown, true);
      board.removeEventListener("pointermove", onMove, true);
      board.removeEventListener("pointerup", onEnd, true);
      board.removeEventListener("pointercancel", onEnd, true);
      board.removeEventListener("touchstart", blockItemTouchDrag, true);
      board.removeEventListener("touchmove", blockItemTouchDrag, true);
    };
  }, [viewport]);
}
