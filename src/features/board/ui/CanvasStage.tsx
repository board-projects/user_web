"use client";

import React, { useEffect } from "react";
import { useWindowSize } from "@/features/board/hooks/useWindowSize";

export function CanvasStage(props: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewportWidth?: number;
  viewportHeight?: number;
}) {
  const windowSize = useWindowSize();
  const width = props.viewportWidth ?? windowSize.width;
  const height = props.viewportHeight ?? windowSize.height;

  useEffect(() => {
    const canvas = props.canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 4096 / Math.max(1, width, height));

    // سایز واقعی (bitmap)
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    // سایز نمایشی (CSS)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, [width, height, props.canvasRef]);

  return (
    <canvas
      ref={props.canvasRef}
      className="absolute inset-0 z-0"
      style={{
        pointerEvents: "none",
      }}
    />
  );
}