import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { transformViewport } from "../domain/viewportTransform";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";

const PINCH_THRESHOLD = 10;
const DISTANCE_DEADBAND = 2;

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
    let zoomDistance: number | null = null;
    let frame = 0;

    const rebase = () => {
      start = captureStart();
      zoomDistance = null;
    };

    const updateViewport = () => {
      frame = 0;
      const current = measure();
      if (!start || !current) return;

      if (zoomDistance === null) {
        const view = transformViewport(start.view, start.view.zoom, start.center, current.center);
        const threshold = Math.max(PINCH_THRESHOLD, start.distance * 0.07);
        const delta = current.distance - start.distance;
        if (Math.abs(delta) < threshold) {
          useBoardStore.setState(view);
          return;
        }

        const distance = Math.max(1, start.distance + Math.sign(delta) * threshold);
        start = { ...current, distance, view };
        zoomDistance = current.distance;
      }

      if (Math.abs(current.distance - zoomDistance) >= DISTANCE_DEADBAND) {
        zoomDistance = current.distance;
      }
      const zoom = start.view.zoom * zoomDistance / start.distance;
      useBoardStore.setState(transformViewport(start.view, zoom, start.center, current.center));
    };
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
      if (touches.size === 2) rebase();
      stopGestureEvent(event);
    };

    const onMove = (event: PointerEvent) => {
      if (!touches.has(event.pointerId)) return;
      touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (!claimed) return;

      stopGestureEvent(event);
      if (!frame && start) frame = requestAnimationFrame(updateViewport);
    };

    const onEnd = (event: PointerEvent) => {
      if (!touches.has(event.pointerId)) return;
      if (claimed) stopGestureEvent(event);

      const [first, second] = touches.keys();
      if (frame && (first === event.pointerId || second === event.pointerId)) {
        cancelAnimationFrame(frame);
        if (event.type === "pointerup") updateViewport();
        else frame = 0;
      }
      touches.delete(event.pointerId);
      if (first === event.pointerId || second === event.pointerId) rebase();
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
      cancelAnimationFrame(frame);
      board.removeEventListener("pointerdown", onDown, true);
      board.removeEventListener("pointermove", onMove, true);
      board.removeEventListener("pointerup", onEnd, true);
      board.removeEventListener("pointercancel", onEnd, true);
      board.removeEventListener("touchstart", blockItemTouchDrag, true);
      board.removeEventListener("touchmove", blockItemTouchDrag, true);
    };
  }, [viewport]);
}
