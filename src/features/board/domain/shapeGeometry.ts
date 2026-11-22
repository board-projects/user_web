import { SHAPE_PORTS, type Point, type ShapePort } from "./types";
import type { ConnectableItem } from "./connectableItems";
import { shapeDefinitions } from "./shapeDefinitions";

const center = (shape: ConnectableItem): Point => ({
  x: shape.x + shape.width / 2,
  y: shape.y + shape.height / 2,
});

function getShapeBoundaryPoint(shape: ConnectableItem, toward: Point): Point {
  const midpoint = center(shape);
  const dx = (toward.x - midpoint.x) / (shape.width / 2);
  const dy = (toward.y - midpoint.y) / (shape.height / 2);
  if ((!dx && !dy) || !Number.isFinite(dx) || !Number.isFinite(dy)) return midpoint;

  const points = shapeDefinitions[shape.type].points;
  let distance = 1 / Math.max(Math.abs(dx), Math.abs(dy));
  if (shape.type === "circle") {
    distance = 1 / Math.hypot(dx, dy);
  } else if (points) {
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      const [nextX, nextY] = points[(i + 1) % points.length];
      const ax = x / 50 - 1;
      const ay = y / 50 - 1;
      const edgeX = (nextX - x) / 50;
      const edgeY = (nextY - y) / 50;
      const cross = dx * edgeY - dy * edgeX;
      if (cross === 0) continue;

      const t = (ax * edgeY - ay * edgeX) / cross;
      const u = (ax * dy - ay * dx) / cross;
      if (t >= 0 && u >= 0 && u <= 1) distance = Math.min(distance, t);
    }
  }

  return {
    x: midpoint.x + (toward.x - midpoint.x) * distance,
    y: midpoint.y + (toward.y - midpoint.y) * distance,
  };
}

export const PORT_DIRECTION: Record<ShapePort, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export function getShapePortPoint(shape: ConnectableItem, port: ShapePort): Point {
  const midpoint = center(shape);
  const direction = PORT_DIRECTION[port];
  return getShapeBoundaryPoint(shape, {
    x: midpoint.x + direction.x * shape.width,
    y: midpoint.y + direction.y * shape.height,
  });
}

export function getNearestShapePort(shape: ConnectableItem, point: Point): ShapePort {
  let nearest: ShapePort = "top";
  let shortest = Infinity;
  for (const port of SHAPE_PORTS) {
    const position = getShapePortPoint(shape, port);
    const distance = (position.x - point.x) ** 2 + (position.y - point.y) ** 2;
    if (distance < shortest) {
      nearest = port;
      shortest = distance;
    }
  }
  return nearest;
}

export type ShapePortTarget = { id: string; port: ShapePort };

export function findNearbyShapePort(
  shapes: readonly ConnectableItem[],
  sourceId: string,
  pointer: Point,
  radius: number,
): ShapePortTarget | null {
  let nearest: ShapePortTarget | null = null;
  let shortest = radius ** 2;

  for (const shape of shapes) {
    if (shape.id === sourceId) continue;

    const port = getNearestShapePort(shape, pointer);
    const point = getShapePortPoint(shape, port);
    const distance = (point.x - pointer.x) ** 2 + (point.y - pointer.y) ** 2;
    if (distance > shortest || (nearest && distance === shortest)) continue;

    nearest = { id: shape.id, port };
    shortest = distance;
  }

  return nearest;
}
