export type BoardId = string;

export type Point = { x: number; y: number };

export type DrawLine = {
  id: string;
  strokeId?: string;
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

export const CONNECTOR_ROUTES = ["straight", "smooth", "orthogonal", "wave", "zigzag"] as const;
export const CONNECTOR_PATTERNS = ["solid", "dash", "dot", "dash-dot"] as const;
export type ConnectorRoute = (typeof CONNECTOR_ROUTES)[number];
export type ConnectorPattern = (typeof CONNECTOR_PATTERNS)[number];

export type ShapeConnection = {
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
};
