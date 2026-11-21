import type { DrawLine, Point } from "./types";

export const drawingId = (line: DrawLine) => line.strokeId ?? line.id;
export type DrawingFrame = Point & { width: number; height: number };
const FRAME_PADDING = 6;

export function groupDrawingLines(lines: Iterable<DrawLine>) {
  const groups = new Map<string, DrawLine[]>();
  for (const line of lines) {
    const id = drawingId(line);
    const group = groups.get(id);
    if (group) group.push(line);
    else groups.set(id, [line]);
  }
  return groups;
}

export function getDrawingFrame(lines: Iterable<DrawLine>): DrawingFrame | null {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const { from, to } of lines) {
    left = Math.min(left, from.x, to.x);
    right = Math.max(right, from.x, to.x);
    top = Math.min(top, from.y, to.y);
    bottom = Math.max(bottom, from.y, to.y);
  }
  if (!Number.isFinite(left)) return null;

  // Leave room for the line itself and for grips on horizontal or vertical drawings.
  const padding = FRAME_PADDING;
  return { x: left - padding, y: top - padding, width: right - left + padding * 2, height: bottom - top + padding * 2 };
}

export function scaleDrawingLine(line: DrawLine, from: DrawingFrame, to: DrawingFrame): DrawLine {
  const padding = FRAME_PADDING;
  const projectAxis = (value: number, start: number, length: number, next: number, nextLength: number) => {
    const innerLength = length - padding * 2;
    const ratio = innerLength > 0 ? (value - start - padding) / innerLength : 0.5;
    return next + padding + ratio * (nextLength - padding * 2);
  };
  const project = (point: Point) => ({
    x: projectAxis(point.x, from.x, from.width, to.x, to.width),
    y: projectAxis(point.y, from.y, from.height, to.y, to.height),
  });
  return { ...line, from: project(line.from), to: project(line.to) };
}

export function translateDrawingLine(line: DrawLine, delta: Point): DrawLine {
  const move = (point: Point) => ({ x: point.x + delta.x, y: point.y + delta.y });
  return { ...line, from: move(line.from), to: move(line.to) };
}
