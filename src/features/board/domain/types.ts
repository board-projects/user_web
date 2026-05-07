export type BoardId = string;

export type Point = { x: number; y: number };

export type DrawLine = {
  from: Point;
  to: Point;
  color: string;
  size: number;
};

export type ShapeType = "rect" | "circle";

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type CodeBlock = {
  id: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ClozeTest = {
  id: string;
  type: "cloze_test";
  x: number;
  y: number;
  content: string;
  title: string;
}