import { segmentIntersectsBox, type SelectionBox } from "./marqueeGeometry";
import type { ConnectableItem } from "./connectableItems";
import { getShapePortPoint, PORT_DIRECTION } from "./shapeGeometry";
import type { Point, ShapeConnection } from "./types";

const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const interpolate = (a: Point, b: Point, t: number): Point =>
  ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const extend = (point: Point, vector: Point, length: number): Point =>
  ({ x: point.x + vector.x * length, y: point.y + vector.y * length });

export function getConnectorPoints(connection: ShapeConnection, source: ConnectableItem, target: ConnectableItem): Point[] {
  const from = getShapePortPoint(source, connection.sourcePort);
  const to = getShapePortPoint(target, connection.targetPort);
  const length = distance(from, to);
  if (!length) return [from, to];

  const start = PORT_DIRECTION[connection.sourcePort];
  const end = PORT_DIRECTION[connection.targetPort];

  switch (connection.route) {
    case "smooth": {
      const reach = Math.min(180, Math.max(20, length * 0.45));
      const a = extend(from, start, reach);
      const b = extend(to, end, reach);
      return Array.from({ length: 33 }, (_, i) => {
        const t = i / 32;
        const first = interpolate(interpolate(from, a, t), interpolate(a, b, t), t);
        const second = interpolate(interpolate(a, b, t), interpolate(b, to, t), t);
        return interpolate(first, second, t);
      });
    }
    case "orthogonal": {
      const reach = Math.min(28, length / 4);
      const a = extend(from, start, reach);
      const b = extend(to, end, reach);
      const middle = interpolate(a, b, 0.5);
      if (start.x && end.x) return [from, a, { x: middle.x, y: a.y }, { x: middle.x, y: b.y }, b, to];
      if (!start.x && !end.x) return [from, a, { x: a.x, y: middle.y }, { x: b.x, y: middle.y }, b, to];
      return [from, a, start.x ? { x: b.x, y: a.y } : { x: a.x, y: b.y }, b, to];
    }
    case "wave":
    case "zigzag": {
      const normal = { x: (from.y - to.y) / length, y: (to.x - from.x) / length };
      const cycles = Math.max(1, Math.min(8, Math.round(length / 72)));
      const amplitude = Math.min(12, length / 8);
      const segments = cycles * (connection.route === "wave" ? 16 : 4);
      return [from, ...Array.from({ length: segments - 1 }, (_, i) => {
        const t = (i + 1) / segments;
        return extend(interpolate(from, to, t), normal, Math.sin(t * cycles * 2 * Math.PI) * amplitude);
      }), to];
    }
    default: return [from, to];
  }
}

export const connectorPath = (points: readonly Point[]) =>
  points.map(({ x, y }, index) => `${index ? "L" : "M"}${x},${y}`).join(" ");

export function connectorMidpoint(points: readonly Point[]): Point {
  const lengths = points.slice(1).map((point, index) => distance(points[index], point));
  let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;
  for (let i = 0; i < lengths.length; i++) {
    if (lengths[i] && remaining <= lengths[i]) return interpolate(points[i], points[i + 1], remaining / lengths[i]);
    remaining -= lengths[i];
  }
  return points[0];
}

export function connectorArrow(points: readonly Point[], size: number) {
  const tip = points[points.length - 1];
  const previous = points.slice(0, -1).reverse().find((point) => distance(point, tip) > 0);
  if (!previous) return undefined;

  const length = distance(previous, tip);
  const direction = { x: (tip.x - previous.x) / length, y: (tip.y - previous.y) / length };
  const base = extend(tip, direction, -size);
  const normal = { x: -direction.y, y: direction.x };
  return [tip, extend(base, normal, size * 0.45), extend(base, normal, -size * 0.45)]
    .map(({ x, y }) => `${x},${y}`).join(" ");
}

export const connectorIntersectsBox = (points: readonly Point[], box: SelectionBox) =>
  points.slice(1).some((point, index) => segmentIntersectsBox(points[index], point, box));

export function connectorDashArray(connection: ShapeConnection) {
  switch (connection.pattern ?? (connection.dashed ? "dash" : "solid")) {
    case "dash": return "8 6";
    case "dot": return "1 6";
    case "dash-dot": return "8 5 1 5";
  }
}
