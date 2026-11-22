import { useRef, type PointerEvent } from "react";
import { TbRotateClockwise } from "react-icons/tb";
import { normalizeRotation, rotationAtPointer } from "../domain/shapeRotation";
import type { Point, Shape } from "../domain/types";

type Props = { shape: Shape; zoom: number; rotate: (degrees: number) => void };

export function ShapeRotationHandle({ shape, zoom, rotate }: Props) {
  const gesture = useRef<{ pointerId: number; pointerAngle: number; start: number } | null>(null);
  const rotation = normalizeRotation(shape.rotation);

  const pointerAngle = (event: PointerEvent<HTMLButtonElement>) => {
    const viewport = event.currentTarget.closest("[data-board-viewport]")?.getBoundingClientRect();
    if (!viewport) return null;

    const origin: Point = {
      x: viewport.left + (shape.x + shape.width / 2) * zoom,
      y: viewport.top + (shape.y + shape.height / 2) * zoom,
    };
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) < 4) return null;
    return rotationAtPointer(origin, { x: event.clientX, y: event.clientY });
  };

  const update = (event: PointerEvent<HTMLButtonElement>) => {
    const start = gesture.current;
    if (start?.pointerId !== event.pointerId) return;

    const angle = pointerAngle(event);
    if (angle === null) return;
    const delta = start.start + angle - start.pointerAngle;
    const next = normalizeRotation(event.shiftKey ? Math.round(delta / 15) * 15 : delta);
    if (next !== rotation) rotate(next);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40" style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="absolute bottom-full left-1/2 w-px bg-blue-600" style={{ height: 32 / zoom }}>
        <button
          type="button"
          aria-label="Rotate shape"
          title="Drag to rotate · Shift for 15° steps"
          data-rotation-handle
          className="pointer-events-auto absolute left-1/2 top-0 grid -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none place-items-center rounded-full border border-blue-600 bg-white text-blue-700 shadow-sm active:cursor-grabbing"
          style={{ width: 28 / zoom, height: 28 / zoom, fontSize: 16 / zoom }}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            const angle = pointerAngle(event);
            if (angle === null) return;
            event.stopPropagation();
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            gesture.current = { pointerId: event.pointerId, pointerAngle: angle, start: rotation };
          }}
          onPointerMove={update}
          onPointerUp={(event) => {
            update(event);
            gesture.current = null;
          }}
          onLostPointerCapture={() => { gesture.current = null; }}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            event.stopPropagation();
            const step = event.shiftKey ? 15 : 1;
            rotate(normalizeRotation(rotation + (event.key === "ArrowRight" ? step : -step)));
          }}
        >
          <TbRotateClockwise aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
