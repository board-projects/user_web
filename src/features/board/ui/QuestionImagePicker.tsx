"use client";

import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { questionImageUrl } from "../domain/questions";
import type { Point } from "../domain/types";

const center = { x: 0.5, y: 0.5 };

export function QuestionImagePicker({ url, alt, point, radius, onPick }: {
  url: string;
  alt: string;
  point?: Point;
  radius?: number;
  onPick?: (point: Point) => void;
}) {
  const [cursor, setCursor] = useState<Point>();
  const source = questionImageUrl(url);
  if (!source) return <p className="text-xs text-stone-500">No image available.</p>;
  const marker = cursor ?? point;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const choose = (event: MouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = event.detail ? {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    } : marker ?? center;
    setCursor(undefined);
    onPick?.(position);
  };
  const move = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offsets: Record<string, Point> = {
      ArrowLeft: { x: -0.02, y: 0 }, ArrowRight: { x: 0.02, y: 0 },
      ArrowUp: { x: 0, y: -0.02 }, ArrowDown: { x: 0, y: 0.02 },
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    event.stopPropagation();
    const { x, y } = marker ?? center;
    setCursor({ x: clamp(x + offset.x), y: clamp(y + offset.y) });
  };
  const image = (
    <>
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {marker && radius && <circle cx={marker.x} cy={marker.y} r={radius} fill="#60a5fa55" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
      </svg>
      {marker && <span className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-700 shadow" style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }} />}
    </>
  );
  const picture = (
    <picture className="block w-full">
      <img src={source} alt={alt} referrerPolicy="no-referrer" className="pointer-events-none block h-auto w-full" draggable={false} />
    </picture>
  );
  if (!onPick) return <div className="relative">{picture}{image}</div>;
  return (
    <button type="button" aria-label={alt ? `Select a point on image: ${alt}` : "Select a point on image"}
      onClick={choose} onKeyDown={move} className="relative block w-full cursor-crosshair rounded-sm focus-visible:ring-2 focus-visible:ring-blue-600">
      {picture}{image}
    </button>
  );
}
