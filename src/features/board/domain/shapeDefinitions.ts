import type { ShapeType } from "./types";

type ShapeDefinition = {
  label: string;
  width: number;
  height: number;
  lockedAspect?: boolean;
  points?: readonly (readonly [number, number])[];
};

export const shapeDefinitions: Record<ShapeType, ShapeDefinition> = {
  rect: { label: "Rectangle", width: 200, height: 120 },
  circle: { label: "Circle", width: 120, height: 120, lockedAspect: true },
  star: {
    label: "Star", width: 120, height: 120, lockedAspect: true,
    points: [[50, 0], [62, 36], [100, 38], [70, 61], [81, 100], [50, 76], [19, 100], [30, 61], [0, 38], [38, 36]],
  },
  trapezoid: {
    label: "Trapezoid", width: 180, height: 120,
    points: [[22, 0], [78, 0], [100, 100], [0, 100]],
  },
  triangle: {
    label: "Triangle", width: 160, height: 140,
    points: [[50, 0], [100, 100], [0, 100]],
  },
  diamond: {
    label: "Diamond", width: 160, height: 120,
    points: [[50, 0], [100, 50], [50, 100], [0, 50]],
  },
};

export function polygonClip(type: ShapeType) {
  const points = shapeDefinitions[type].points;
  if (!points) return undefined;

  return `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
}
