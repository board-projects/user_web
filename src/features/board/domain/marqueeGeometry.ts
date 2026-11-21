import type { Point } from "./types";

export type SelectionBox = { left: number; top: number; right: number; bottom: number };

export function boxBetween(start: Point, end: Point): SelectionBox {
  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    right: Math.max(start.x, end.x),
    bottom: Math.max(start.y, end.y),
  };
}

export function boxesIntersect(a: SelectionBox, b: SelectionBox) {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

export function segmentIntersectsBox(from: Point, to: Point, box: SelectionBox) {
  let enter = 0;
  let exit = 1;
  for (const [origin, delta, low, high] of [
    [from.x, to.x - from.x, box.left, box.right],
    [from.y, to.y - from.y, box.top, box.bottom],
  ]) {
    if (delta === 0) {
      if (origin < low || origin > high) return false;
      continue;
    }
    const a = (low - origin) / delta;
    const b = (high - origin) / delta;
    enter = Math.max(enter, Math.min(a, b));
    exit = Math.min(exit, Math.max(a, b));
    if (enter > exit) return false;
  }
  return true;
}
