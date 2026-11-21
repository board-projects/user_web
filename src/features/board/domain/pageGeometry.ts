import type { PageItem, Point } from "./types";

type Bounds = Point & { width: number; height: number };

export function pageContainsPoint(page: PageItem, point: Point) {
  return point.x >= page.x && point.y >= page.y &&
    point.x <= page.x + page.width && point.y <= page.y + page.height;
}

export function pageContainsItem(page: PageItem, bounds: Bounds) {
  return pageContainsPoint(page, bounds) &&
    pageContainsPoint(page, { x: bounds.x + bounds.width, y: bounds.y + bounds.height });
}
