"use client";

import React, { useEffect } from "react";
import { DrawLine } from "@/features/board/domain/types";

export function useCanvasRedraw(args: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  lines: DrawLine[];
  selectedLines?: ReadonlySet<DrawLine>;
  zoom: number;
  panX: number;
  panY: number;
}) {
  useEffect(() => {
    const canvas = args.canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // clear (در مختصات پیکسلی canvas)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // world -> screen transform (با dpr)
    ctx.setTransform(
      args.zoom * dpr,
      0,
      0,
      args.zoom * dpr,
      args.panX * dpr,
      args.panY * dpr,
    );

    for (const line of args.lines) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      if (args.selectedLines?.has(line)) {
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = (line.size + 4) / args.zoom;
        ctx.stroke();
      }
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size / args.zoom;
      ctx.stroke();
    }
  }, [args.canvasRef, args.lines, args.selectedLines, args.zoom, args.panX, args.panY]);
}