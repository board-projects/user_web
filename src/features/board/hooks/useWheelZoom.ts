"use client";

import { RefObject, useEffect } from "react";
import { useBoardStore } from "@/features/board/store/board.store";

export function useWheelZoom(containerRef: RefObject<HTMLElement>) {
    const zoom = useBoardStore((s) => s.zoom);
    const zoomAt = useBoardStore((s) => s.zoomAt);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();

            const rect = el.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;

            const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
            zoomAt(zoom * factor, sx, sy);
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel as any);
    }, [containerRef, zoom, zoomAt]);
}
