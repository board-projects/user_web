import { QUESTION_SIZE } from "./multipleChoice";
import { shapeDefinitions } from "./shapeDefinitions";
import type { CodeBlock, Point, Shape, ShapeType } from "@/features/board/domain/types";

export const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

export function createShape(type: ShapeType): Shape {
  const { width, height } = shapeDefinitions[type];
  const offset = type === "rect" ? 150 : 100;
  return { id: crypto.randomUUID(), type, x: offset, y: offset, width, height, color: randomColor() };
}

export const createCodeBlock = (): CodeBlock => ({
  id: crypto.randomUUID(),
  code: "",
  x: 50,
  y: 50,
  width: 400,
  height: 200,
});

export function createClozeTest(position: Point) {
  return {
    ...position,
    ...QUESTION_SIZE,
    id: crypto.randomUUID(),
    type: "cloze_test" as const,
    content: "The capital of France is {{paris}}.",
    title: "",
  };
}
