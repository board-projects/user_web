import { CodeBlock, Shape } from "@/features/board/domain/types";

export const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

export const createRect = () =>
  ({
    id: crypto.randomUUID(),
    type: "rect",
    x: 150,
    y: 150,
    width: 200,
    height: 120,
    color: randomColor(),
  }) satisfies Shape;

export const createCircle = () =>
  ({
    id: crypto.randomUUID(),
    type: "circle",
    x: 100,
    y: 100,
    width: 120,
    height: 120,
    color: randomColor(),
  }) satisfies Shape;

export const createCodeBlock = (): CodeBlock => ({
  id: crypto.randomUUID(),
  code: "",
  x: 50,
  y: 50,
  width: 400,
  height: 200,
});

export const createClozeTest = () => ({
  id: crypto.randomUUID(),
  type: "cloze_test" as const,
  x: 100,
  y: 100,
  content: "The capital of France is {{paris}}.",
  title: "capital name",
});