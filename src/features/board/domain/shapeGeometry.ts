import { SHAPE_PORTS, type Point, type Shape, type ShapePort } from "./types";

const STAR_POINTS = [
  [50, 0], [62, 36], [100, 38], [70, 61], [81, 100],
  [50, 76], [19, 100], [30, 61], [0, 38], [38, 36],
] as const;

export const STAR_CLIP_PATH =
  `polygon(${STAR_POINTS.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;

const center = (shape: Shape): Point => ({
  x: shape.x + shape.width / 2,
  y: shape.y + shape.height / 2,
});

function getShapeBoundaryPoint(shape: Shape, toward: Point): Point {
  const midpoint = center(shape);
  const dx = (toward.x - midpoint.x) / (shape.width / 2);
  const dy = (toward.y - midpoint.y) / (shape.height / 2);
  if ((!dx && !dy) || !Number.isFinite(dx) || !Number.isFinite(dy)) return midpoint;

  let distance = 1 / Math.max(Math.abs(dx), Math.abs(dy));
  if (shape.type === "circle") {
    distance = 1 / Math.hypot(dx, dy);
  } else if (shape.type === "star") {
    // Intersect the center ray with each edge of the same polygon used for rendering.
    for (let i = 0; i < STAR_POINTS.length; i++) {
      const [x, y] = STAR_POINTS[i];
      const [nextX, nextY] = STAR_POINTS[(i + 1) % STAR_POINTS.length];
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

const PORT_DIRECTION: Record<ShapePort, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export function getShapePortPoint(shape: Shape, port: ShapePort): Point {
  const midpoint = center(shape);
  const direction = PORT_DIRECTION[port];
  return getShapeBoundaryPoint(shape, {
    x: midpoint.x + direction.x * shape.width,
    y: midpoint.y + direction.y * shape.height,
  });
}

export function getNearestShapePort(shape: Shape, point: Point): ShapePort {
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
