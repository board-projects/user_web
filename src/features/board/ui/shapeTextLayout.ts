import { STAR_CLIP_PATH } from "../domain/shapeGeometry";
import type { ShapeType } from "../domain/types";

type BoundaryPoint = readonly [number, number];

const circleEdge: BoundaryPoint[] = Array.from({ length: 21 }, (_, index) => {
  const y = index * 5;
  return [100 - Math.sqrt(10000 - (y * 2 - 100) ** 2), y];
});

const circleFloat = (right: boolean) => {
  const edge = circleEdge.map(([x, y]) => `${right ? 100 - x : x}% ${y}%`);
  const outer = right ? "100%" : "0%";
  return `polygon(${outer} 0%, ${edge.join(", ")}, ${outer} 100%)`;
};

export const circleTextFloats = [
  { float: "left", width: "50%", height: "100%", shapeOutside: circleFloat(false) },
  { float: "right", width: "50%", height: "100%", shapeOutside: circleFloat(true) },
] as const;

export const shapeTextClip = (shape?: ShapeType) =>
  shape === "circle" ? "ellipse(50% 50%)" : shape === "star" ? STAR_CLIP_PATH : undefined;
