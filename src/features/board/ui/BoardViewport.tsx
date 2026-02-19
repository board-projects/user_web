"use client";

import React from "react";
import { useBoardStore } from "@/features/board/store/board.store";

export function BoardViewport({ children }: { children: React.ReactNode }) {
    const zoom = useBoardStore((s) => s.zoom);
    const panX = useBoardStore((s) => s.panX);
    const panY = useBoardStore((s) => s.panY);

    return (
        <div
            className="absolute inset-0"
            style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: "0 0",
            }}
        >
            {children}
        </div>
    );
}