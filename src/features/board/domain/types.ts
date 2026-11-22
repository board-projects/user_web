import type { TextRun } from "./richText";
import type { TextFormat } from "./textFormat";

export type BoardId = string;

export type TableItem = Point & {
  textFormat?: TextFormat;
  id: string;
  rows: number[];
  columns: number[];
  itemLabel?: string;
  cells?: Record<string, string>;
  cellRuns?: Record<string, TextRun[]>;
  width: number;
  height: number;
};

export type Point = { x: number; y: number };

export type DrawLine = {
  textFormat?: TextFormat;
  id: string;
  strokeId?: string;
  label?: string;
  from: Point;
  to: Point;
  color: string;
  size: number;
};

export const SHAPE_TYPES = ["rect", "circle", "star", "trapezoid", "triangle", "diamond"] as const;
export type ShapeType = (typeof SHAPE_TYPES)[number];

export type Shape = {
  textFormat?: TextFormat;
  id: string;
  type: ShapeType;
  itemLabel?: string;
  textRuns?: TextRun[];
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export const SHAPE_PORTS = ["top", "right", "bottom", "left"] as const;
export type ShapePort = (typeof SHAPE_PORTS)[number];

export const CONNECTOR_ROUTES = ["straight", "smooth", "orthogonal", "wave", "zigzag"] as const;
export const CONNECTOR_PATTERNS = ["solid", "dash", "dot", "dash-dot"] as const;
export type ConnectorRoute = (typeof CONNECTOR_ROUTES)[number];
export type ConnectorPattern = (typeof CONNECTOR_PATTERNS)[number];

export type ShapeConnection = {
  textFormat?: TextFormat;
  id: string;
  sourceId: string;
  sourcePort: ShapePort;
  targetId: string;
  targetPort: ShapePort;
  color?: string;
  size?: number;
  dashed?: boolean;
  route?: ConnectorRoute;
  pattern?: ConnectorPattern;
  label?: string;
  arrow?: boolean;
};

export type CodeBlock = {
  itemLabel?: string;
  textFormat?: TextFormat;
  id: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ClozeTest = {
  textFormat?: TextFormat;
  id: string;
  type: "cloze_test";
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  title: string;
}

export const PAGE_UNITS = ["px", "mm", "cm", "in"] as const;
export type PageUnit = (typeof PAGE_UNITS)[number];

export type PageItem = Point & {
  id: string;
  title: string;
  width: number;
  height: number;
  dots: boolean;
  unit: PageUnit;
  backgroundColor?: string;
};
