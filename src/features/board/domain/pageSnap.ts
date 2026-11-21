import { SHEET_DOT_GRID } from "@/features/design/domain/sheetLayout";
import { pageContainsItem } from "./pageGeometry";
import type { PageItem, Point } from "./types";

type Size = { width: number; height: number };

export function snapToPageDots(position: Point, size: Size, pages: readonly PageItem[], excluded?: ReadonlySet<string>): Point {
  // Later backgrounds are painted above earlier ones.
  for (let index = pages.length - 1; index >= 0; index--) {
    const page = pages[index];
    if (excluded?.has(page.id) || !pageContainsItem(page, { ...position, width: size.width, height: size.height })) continue;
    if (!page.dots) break;

    const step = SHEET_DOT_GRID.step;
    const firstDot = step / 2;
    const snapAxis = (value: number, origin: number, available: number) => {
      const lastIndex = Math.floor((available - firstDot) / step);
      if (lastIndex < 0) return value;
      const nearest = Math.round((value - origin - firstDot) / step);
      return origin + firstDot + Math.max(0, Math.min(nearest, lastIndex)) * step;
    };
    return {
      x: snapAxis(position.x, page.x, page.width - size.width),
      y: snapAxis(position.y, page.y, page.height - size.height),
    };
  }

  return position;
}
