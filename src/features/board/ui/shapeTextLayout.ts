import { polygonClip } from "../domain/shapeDefinitions";
import type { ShapeType } from "../domain/types";

const fullArea = { x: 0, y: 0, width: 1, height: 1 };

export const shapeTextArea = (shape?: ShapeType) => {
  switch (shape) {
    case "circle": return { x: 0.15, y: 0.25, width: 0.7, height: 0.5 };
    case "triangle": return { x: 0.26, y: 0.52, width: 0.48, height: 0.44 };
    case "trapezoid": return { x: 0.2, y: 0.12, width: 0.6, height: 0.8 };
    case "diamond": return { x: 0.26, y: 0.26, width: 0.48, height: 0.48 };
    default: return fullArea;
  }
};

export const shapeTextClip = (shape?: ShapeType) => shape === "star" ? polygonClip(shape) : undefined;
