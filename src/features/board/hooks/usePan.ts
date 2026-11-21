"use client";

import { useEffect, type RefObject } from "react";
import { useBoardStore } from "../store/board.store";

export function usePan(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let spaceDown = false;
    let last: { id: number; x: number; y: number } | null = null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, button, [contenteditable]")) return;
      spaceDown = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") spaceDown = false;
    };
    const resetSpace = () => { spaceDown = false; };

    const onPointerDown = (event: PointerEvent) => {
      if (last) return;
      const { panMode } = useBoardStore.getState();
      const isPrimaryButton = (event.buttons & 1) === 1 || event.pointerType === "touch";
      const isMiddleButton = (event.buttons & 4) === 4;
      if (!isMiddleButton && !((spaceDown || panMode) && isPrimaryButton)) return;

      event.preventDefault();
      event.stopPropagation();
      container.setPointerCapture(event.pointerId);
      last = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (last?.id !== event.pointerId) return;

      const { panX, panY, setPan } = useBoardStore.getState();
      setPan(panX + event.clientX - last.x, panY + event.clientY - last.y);
      last = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };

    const endPan = (event: PointerEvent) => {
      if (last?.id === event.pointerId) last = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", resetSpace);
    container.addEventListener("pointerdown", onPointerDown, true);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("lostpointercapture", endPan);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", resetSpace);
      container.removeEventListener("pointerdown", onPointerDown, true);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("lostpointercapture", endPan);
    };
  }, [containerRef]);
}
