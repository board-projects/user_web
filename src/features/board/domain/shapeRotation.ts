import type { Point } from "./types";

export function normalizeRotation(degrees?: number): number {
  if (typeof degrees !== "number" || !Number.isFinite(degrees)) return 0;
  return ((Math.round(degrees) % 360) + 360) % 360;
}

export function rotateVector(point: Point, rotation?: number): Point {
  const degrees = normalizeRotation(rotation);
  if (!degrees) return point;

  const radians = degrees * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
}

export function rotationAtPointer(origin: Point, pointer: Point) {
  return Math.atan2(pointer.y - origin.y, pointer.x - origin.x) * 180 / Math.PI;
}
