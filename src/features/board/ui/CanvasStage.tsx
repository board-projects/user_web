"use client";

import React from "react";

export const WORLD_WIDTH = 5000;
export const WORLD_HEIGHT = 5000;

export function CanvasStage(props: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}) {
  return (
    <canvas
      ref={props.canvasRef}
      width={WORLD_WIDTH}
      height={WORLD_HEIGHT}
      style={{
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        cursor: "crosshair",
      }}
      onMouseDown={props.onMouseDown}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
      onMouseLeave={props.onMouseUp}
    />
  );
}
