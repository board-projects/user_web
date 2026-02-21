"use client";

import React, { useEffect } from "react";
import { useWindowSize } from "@/features/board/hooks/useWindowSize";
import { useBoardStore } from "@/features/board/store/board.store";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function GridCanvas(props: { className?: string }) {
  const { width, height } = useWindowSize();

  const zoom = useBoardStore((s) => s.zoom);
  const panX = useBoardStore((s) => s.panX);
  const panY = useBoardStore((s) => s.panY);

  // اندازه‌ی گرید در مختصات world (نه screen)
  const baseWorldStep = 80; // مثلا 80 واحد world

  // برای داشتن major line
  const majorEvery = 5;

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // پاک کردن
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // فاصله‌ی گرید روی صفحه (screen pixels)
    const stepPx = baseWorldStep * zoom;

    // اگر خیلی ریز شد، گرید رو کم‌جزئیات کن (LOD)
    // (تا وقتی zoom out زیاد شد صفحه پر از خط نشه)
    const effectiveStepPx = clamp(stepPx, 18, 220);
    const scaleFix = effectiveStepPx / stepPx; // نسبت اصلاح

    // این یعنی worldStep رو طوری تغییر میدیم که فاصله‌ی خطوط روی screen قابل قبول بمونه
    const worldStep = baseWorldStep * scaleFix;

    // تبدیل world->screen با dpr
    ctx.setTransform(zoom * dpr, 0, 0, zoom * dpr, panX * dpr, panY * dpr);

    // محدوده‌ی visible در world
    const worldLeft = (-panX) / zoom;
    const worldTop = (-panY) / zoom;
    const worldRight = worldLeft + width / zoom;
    const worldBottom = worldTop + height / zoom;

    // شروع خطوط (هم‌تراز با worldStep)
    const startX = Math.floor(worldLeft / worldStep) * worldStep;
    const startY = Math.floor(worldTop / worldStep) * worldStep;

    ctx.lineWidth = 1 / zoom; // ضخامت ثابت روی صفحه

    // minor lines
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();

    for (let x = startX; x <= worldRight; x += worldStep) {
      ctx.moveTo(x, worldTop);
      ctx.lineTo(x, worldBottom);
    }
    for (let y = startY; y <= worldBottom; y += worldStep) {
      ctx.moveTo(worldLeft, y);
      ctx.lineTo(worldRight, y);
    }
    ctx.stroke();

    // major lines
    ctx.strokeStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();

    const majorStep = worldStep * majorEvery;

    const startMajorX = Math.floor(worldLeft / majorStep) * majorStep;
    const startMajorY = Math.floor(worldTop / majorStep) * majorStep;

    for (let x = startMajorX; x <= worldRight; x += majorStep) {
      ctx.moveTo(x, worldTop);
      ctx.lineTo(x, worldBottom);
    }
    for (let y = startMajorY; y <= worldBottom; y += majorStep) {
      ctx.moveTo(worldLeft, y);
      ctx.lineTo(worldRight, y);
    }
    ctx.stroke();
  }, [width, height, zoom, panX, panY]);

  return (
    <canvas
      ref={canvasRef}
      className={props.className}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}