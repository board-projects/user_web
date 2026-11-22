import { polygonClip } from "../domain/shapeDefinitions";
import type { ShapeType } from "../domain/types";

const fullArea = { x: 0, y: 0, width: 1, height: 1 };

const circleSide = Math.SQRT1_2;
const circleInset = (1 - circleSide) / 2;

export const shapeTextArea = (shape?: ShapeType) => {
  switch (shape) {
    case "circle": return { x: circleInset, y: circleInset, width: circleSide, height: circleSide };
    case "triangle": return { x: 0.25, y: 0.5, width: 0.5, height: 0.5 };
    case "trapezoid": return { x: 0.22, y: 0, width: 0.56, height: 1 };
    case "diamond": return { x: 0.25, y: 0.25, width: 0.5, height: 0.5 };
    default: return fullArea;
  }
};

export const shapeTextClip = (shape?: ShapeType) => shape === "star" ? polygonClip(shape) : undefined;
