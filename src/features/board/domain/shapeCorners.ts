import { shapeDefinitions } from "./shapeDefinitions";
import type { Point, ShapeType } from "./types";

const rectangle = [[0, 0], [100, 0], [100, 100], [0, 100]] as const;
export const MAX_CORNER_ROUNDING = 100;

export function normalizeCornerRounding(value?: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(MAX_CORNER_ROUNDING, Math.round(value))) : 0;
}

const interpolate = (a: Point, b: Point, fraction: number): Point => ({
  x: a.x + (b.x - a.x) * fraction,
  y: a.y + (b.y - a.y) * fraction,
});

function roundedCorners(type: ShapeType, rounding?: number) {
  const fraction = normalizeCornerRounding(rounding) / MAX_CORNER_ROUNDING * 0.45;
  if (type === "circle" || !fraction) return [];

  const vertices = (shapeDefinitions[type].points ?? rectangle).map(([x, y]) => ({ x, y }));
  return vertices.map((vertex, index) => ({
    vertex,
    start: interpolate(vertex, vertices[(index + vertices.length - 1) % vertices.length], fraction),
    end: interpolate(vertex, vertices[(index + 1) % vertices.length], fraction),
  }));
}

export function roundedShapePath(type: ShapeType, rounding?: number) {
  const corners = roundedCorners(type, rounding);
  if (!corners.length) return undefined;

  return corners.map(({ vertex, start, end }, index) =>
    `${index ? "L" : "M"}${start.x} ${start.y} Q${vertex.x} ${vertex.y} ${end.x} ${end.y}`,
  ).join(" ") + " Z";
}

export function shapeBoundaryVertices(type: ShapeType, rounding?: number) {
  const corners = roundedCorners(type, rounding);
  if (!corners.length) return shapeDefinitions[type].points;

  return corners.flatMap(({ vertex, start, end }) => Array.from({ length: 13 }, (_, index) => {
    const t = index / 12;
    const point = interpolate(interpolate(start, vertex, t), interpolate(vertex, end, t), t);
    return [point.x, point.y] as const;
  }));
}
