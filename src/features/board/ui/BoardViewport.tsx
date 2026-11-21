"use client";

import React from "react";
import { useBoardStore } from "@/features/board/store/board.store";

export function BoardViewport({ children, background = false }: { children: React.ReactNode; background?: boolean }) {
  const zoom = useBoardStore((s) => s.zoom);
  const panX = useBoardStore((s) => s.panX);
  const panY = useBoardStore((s) => s.panY);

  return (
    <div
      data-board-viewport={background ? undefined : ""}
      className={background ? "pointer-events-none absolute inset-0 z-0" : "absolute inset-0 z-20"}
      style={{
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  );
}