export type BoardId = string;

export type Point = { x: number; y: number };

export type DrawLine = {
  from: Point;
  to: Point;
  color: string;
  size: number;
};

export type ShapeType = "rect" | "circle" | "star";

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export const SHAPE_PORTS = ["top", "right", "bottom", "left"] as const;
export type ShapePort = (typeof SHAPE_PORTS)[number];

export type ShapeConnection = {
  id: string;
  sourceId: string;
  sourcePort: ShapePort;
  targetId: string;
  targetPort: ShapePort;
  color?: string;
  size?: number;
  dashed?: boolean;
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