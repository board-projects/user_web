import { useRef, type PointerEvent } from "react";
import { moveTableDivider, tableDividers, type TableAxis } from "../domain/tables";

type Props = {
  axis: TableAxis;
  tracks: number[];
  zoom: number;
  update: (tracks: number[]) => void;
};

export function TableDividers({ axis, tracks, zoom, update }: Props) {
  const gesture = useRef<{ pointerId: number; origin: number; initial: number[]; last: number[]; zoom: number } | null>(null);
  const columns = axis === "columns";
  const coordinate = (event: PointerEvent) => columns ? event.clientX : event.clientY;

  return tableDividers(tracks).map((offset, index) => (
    <button
      key={index}
      type="button"
      aria-label={`Resize ${columns ? "column" : "row"} ${index + 1}`}
      data-table-divider
      className={`absolute touch-none focus-visible:bg-blue-300 hover:bg-blue-200/60 ${columns ? "inset-y-0 -translate-x-1/2 cursor-col-resize" : "inset-x-0 -translate-y-1/2 cursor-row-resize"}`}
      style={columns ? { left: offset, width: Math.min(20 / zoom, 20) } : { top: offset, height: Math.min(20 / zoom, 20) }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        gesture.current = { pointerId: event.pointerId, origin: coordinate(event), initial: tracks, last: tracks, zoom };
      }}
      onPointerMove={(event) => {
        const drag = gesture.current;
        if (drag?.pointerId !== event.pointerId) return;
        const next = moveTableDivider(drag.initial, index, (coordinate(event) - drag.origin) / drag.zoom);
        if (next[index] === drag.last[index]) return;
        drag.last = next;
        update(next);
      }}
      onLostPointerCapture={() => { gesture.current = null; }}
      onKeyDown={(event) => {
        const backward = columns ? "ArrowLeft" : "ArrowUp";
        const forward = columns ? "ArrowRight" : "ArrowDown";
        if (event.key !== backward && event.key !== forward) return;
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const next = moveTableDivider(tracks, index, event.key === forward ? step : -step);
        if (next !== tracks) update(next);
      }}
    />
  ));
}
