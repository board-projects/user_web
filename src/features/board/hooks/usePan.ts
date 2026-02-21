"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { useBoardStore } from "@/features/board/store/board.store";

export function usePan(containerRef: RefObject<HTMLElement | null>) {
  const setPan = useBoardStore((s) => s.setPan);

  const panX = useBoardStore((s) => s.panX);
  const panY = useBoardStore((s) => s.panY);

  const [isPanning, setIsPanning] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Space key state (مثل Miro)
  const spaceDown = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const shouldPan = (e: PointerEvent) => {
    // Space + left drag
    if (spaceDown.current && (e.buttons & 1) === 1) return true;

    // Middle mouse drag
    if ((e.buttons & 4) === 4) return true;

    // (اختیاری) Right mouse drag:
    // if ((e.buttons & 2) === 2) return true;

    return false;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!shouldPan(e)) return;

      e.preventDefault();
      (e.target as Element | null)?.setPointerCapture?.(e.pointerId);

      setIsPanning(true);
      last.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning || !last.current) return;

      e.preventDefault();

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;

      setPan(panX + dx, panY + dy);

      last.current = { x: e.clientX, y: e.clientY };
    };

    const endPan = (e: PointerEvent) => {
      if (!isPanning) return;
      e.preventDefault();

      setIsPanning(false);
      last.current = null;

      try {
        (e.target as Element | null)?.releasePointerCapture?.(e.pointerId);
      } catch {
        // intentionally empty: releasePointerCapture may throw if not captured
      }
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: false });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", endPan, { passive: false });
    el.addEventListener("pointercancel", endPan, { passive: false });
    el.addEventListener("pointerleave", endPan, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown as any);
      el.removeEventListener("pointermove", onPointerMove as any);
      el.removeEventListener("pointerup", endPan as any);
      el.removeEventListener("pointercancel", endPan as any);
      el.removeEventListener("pointerleave", endPan as any);
    };
  }, [containerRef, isPanning, panX, panY, setPan]);

  return { isPanning };
}