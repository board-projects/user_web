import type { Point } from "./types";

type Viewport = { zoom: number; panX: number; panY: number };

export function transformViewport(view: Viewport, nextZoom: number, from: Point, to = from): Viewport {
  const zoom = Math.max(Math.min(view.zoom, 0.2), Math.min(4, nextZoom));
  return {
    zoom,
    panX: to.x - (from.x - view.panX) / view.zoom * zoom,
    panY: to.y - (from.y - view.panY) / view.zoom * zoom,
  };
}
