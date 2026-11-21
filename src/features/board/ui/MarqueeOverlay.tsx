import type { SelectionBox } from "../domain/marqueeGeometry";

export function MarqueeOverlay({ box }: { box: SelectionBox | null }) {
  if (!box) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-[60] border border-blue-500 bg-blue-400/15"
      style={{ left: box.left, top: box.top, width: box.right - box.left, height: box.bottom - box.top }}
    />
  );
}
