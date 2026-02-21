"use client";

import React, { useCallback, useRef, useState } from "react";
import { DrawLine, Point } from "../domain/types";
import { useBoardStore } from "@/features/board/store/board.store";

export function useCanvasDraw(args: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  boardAreaRef: React.RefObject<HTMLElement | null>;
  penColor: string;
  penSize: number;
  onLine: (line: DrawLine) => void;
}) {
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<Point | null>(null);

  const zoom = useBoardStore((s) => s.zoom);
  const panX = useBoardStore((s) => s.panX);
  const panY = useBoardStore((s) => s.panY);

  const isInteractiveTarget = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;

    // هر چیزی که draggable/resizable هست
    if (el.closest('[data-interactive="true"]')) return true;

    return !!el.closest('[data-ui="true"]');
  };

  const getWorldPos = useCallback(
    (e: React.PointerEvent): Point => {
      const el = args.boardAreaRef.current;
      if (!el) return { x: 0, y: 0 };

      const rect = el.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      return {
        x: (screenX - panX) / zoom,
        y: (screenY - panY) / zoom,
      };
    },
    [args.boardAreaRef, zoom, panX, panY],
  );

  const drawLine = useCallback(
    (line: DrawLine) => {
      const canvas = args.canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      ctx.save();
      ctx.setTransform(
        zoom * dpr,
        0,
        0,
        zoom * dpr,
        panX * dpr,
        panY * dpr,
      );

      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size / zoom; // ضخامت ثابت روی صفحه
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();

      ctx.restore();
    },
    [args.canvasRef, zoom, panX, panY],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // فقط دکمه چپ
      if ((e.buttons & 1) !== 1) return;

      // ✅ اگر روی shape/codeblock/ui کلیک شد، draw نکن (بذار Rnd کارشو بکنه)
      if (isInteractiveTarget(e.target)) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      setDrawing(true);
      lastPos.current = getWorldPos(e);
    },
    [getWorldPos],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drawing || !lastPos.current) return;
      if ((e.buttons & 1) !== 1) return;

      e.preventDefault();

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

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing) return;
    e.preventDefault();

    setDrawing(false);
    lastPos.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }, [drawing]);

  return { drawLine, onPointerDown, onPointerMove, onPointerUp };
}