"use client";

import React, { useCallback, useRef, useState } from "react";
import { DrawLine, Point } from "../domain/types";
import { useBoardStore } from "@/features/board/store/board.store";

export function useCanvasDraw(args: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  penColor: string;
  penSize: number;
  onLine: (line: DrawLine) => void;
}) {
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<Point | null>(null);

  const zoom = useBoardStore((s) => s.zoom);
  const panX = useBoardStore((s) => s.panX);
  const panY = useBoardStore((s) => s.panY);

  const getWorldPos = useCallback(
    (e: React.MouseEvent): Point => {
      const el = args.containerRef.current;
      if (!el) return { x: 0, y: 0 };

      const rect = el.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      return {
        x: (screenX - panX) / zoom,
        y: (screenY - panY) / zoom,
      };
    },
    [args.containerRef, zoom, panX, panY],
  );

  const drawLine = useCallback(
    (line: DrawLine) => {
      const canvas = args.canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    },
    [args.canvasRef],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDrawing(true);
      lastPos.current = getWorldPos(e);
    },
    [getWorldPos],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawing || !lastPos.current) return;

      const newPos = getWorldPos(e);

      const line: DrawLine = {
        from: lastPos.current,
        to: newPos,
        color: args.penColor,
        size: args.penSize,
      };

      drawLine(line);
      args.onLine(line);

      lastPos.current = newPos;
    },
    [drawing, getWorldPos, drawLine, args],
  );

  const onMouseUp = useCallback(() => {
    setDrawing(false);
    lastPos.current = null;
  }, []);

  return { drawLine, onMouseDown, onMouseMove, onMouseUp };
}
