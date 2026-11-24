import { CLOZE_SIZE } from "./connectableItems";
import { shapeDefinitions } from "./shapeDefinitions";
import type { CodeBlock, PageItem, Shape, ShapeType } from "@/features/board/domain/types";

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

export function createClozeTest(page?: PageItem) {
  const inset = 12;
  const placement = page ? {
    x: page.x + inset,
    y: page.y + inset,
    width: Math.min(CLOZE_SIZE.width, page.width - inset * 2),
    height: Math.min(CLOZE_SIZE.height, page.height - inset * 2),
  } : { x: 100, y: 100 };
  return {
    id: crypto.randomUUID(),
    type: "cloze_test" as const,
    ...placement,
    content: "The capital of France is {{paris}}.",
    title: "capital name",
  };
}