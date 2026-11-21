"use client";

import { useRef } from "react";
import { FaArrowsAlt } from "react-icons/fa";
import type { Point } from "../domain/types";
import { useBoardStore } from "../store/board.store";

export function MarqueeMoveHandle() {
  const selection = useBoardStore((state) => state.marqueeSelection);
  const zoom = useBoardStore((state) => state.zoom);
  const last = useRef<Point | null>(null);
  if (!selection || !selection.lines.size) return null;

  return (
    <button
      type="button"
      title="Drag selected items"
      aria-label="Drag selected items"
      data-interactive="true"
      data-board-drawing-selection
      className="absolute z-[60] grid h-9 w-9 touch-none cursor-move place-items-center rounded-lg bg-blue-700 text-white shadow"
      style={{
        left: selection.anchor.x,
        top: selection.anchor.y,
        transform: `scale(${1 / zoom})`,
        transformOrigin: "top left",
      }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        last.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerMove={(event) => {
        if (!last.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const state = useBoardStore.getState();
        state.moveMarquee({
          x: (event.clientX - last.current.x) / state.zoom,
          y: (event.clientY - last.current.y) / state.zoom,
        });
        last.current = { x: event.clientX, y: event.clientY };
      }}
      onLostPointerCapture={() => { last.current = null; }}
    >
      <FaArrowsAlt aria-hidden="true" />
    </button>
  );
}
