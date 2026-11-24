import { SHEET_DOT_GRID } from "@/features/design/domain/sheetLayout";
import { pageContainsItem } from "./pageGeometry";
import type { PageItem, Point } from "./types";

type Size = { width: number; height: number };
type Frame = Point & Size;
export type ResizeSnap = { x?: number[]; y?: number[] };

type ResizeLimits = {
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  lockAspectRatio?: boolean | number;
};

const step = SHEET_DOT_GRID.step;
const firstDot = step / 2;
export const PAGE_RESIZE_SNAP_GAP = firstDot + 0.001;

function containingPage(frame: Frame, pages: readonly PageItem[], isExcluded?: (id: string) => boolean) {
  for (let index = pages.length - 1; index >= 0; index--) {
    const page = pages[index];
    if (!isExcluded?.(page.id) && pageContainsItem(page, frame)) return page;
  }
}

function snapAxis(value: number, origin: number, available: number) {
  const lastIndex = Math.floor((available - firstDot) / step);
  if (lastIndex < 0) return value;
  const nearest = Math.round((value - origin - firstDot) / step);
  return origin + firstDot + Math.max(0, Math.min(nearest, lastIndex)) * step;
}

export function snapToPageDots(position: Point, size: Size, pages: readonly PageItem[], excluded?: ReadonlySet<string>): Point {
  const page = containingPage({ ...position, ...size }, pages, (id) => excluded?.has(id) ?? false);
  if (!page?.dots) return position;

  return {
    x: snapAxis(position.x, page.x, page.width - size.width),
    y: snapAxis(position.y, page.y, page.height - size.height),
  };
}

function gridSizes(origin: number, span: number, fixedEdge: number, towardStart: boolean, min: number, max: number) {
  const sizes: number[] = [];
  for (let dot = origin + firstDot; dot <= origin + span; dot += step) {
    const size = towardStart ? fixedEdge - dot : dot - fixedEdge;
    if (size >= min && size <= max) sizes.push(size);
  }
  return sizes.length ? sizes : undefined;
}

function numericLimit(limit: number | string | undefined, fallback: number) {
  return typeof limit === "number" ? limit : fallback;
}

export function getPageResizeSnap(
  frame: Frame,
  direction: string,
  pages: readonly PageItem[],
  itemId: string | undefined,
  limits: ResizeLimits,
): ResizeSnap | undefined {
  const page = containingPage(frame, pages, (id) => id === itemId);
  if (!page?.dots) return;

  const handle = direction.toLowerCase();
  const left = handle.includes("left");
  const top = handle.includes("top");
  const horizontal = left || handle.includes("right");
  const vertical = top || handle.includes("bottom");
  const fixedX = left ? frame.x + frame.width : frame.x;
  const fixedY = top ? frame.y + frame.height : frame.y;
  const minWidth = numericLimit(limits.minWidth, 10);
  const minHeight = numericLimit(limits.minHeight, 10);
  const maxWidth = Math.min(numericLimit(limits.maxWidth, Infinity), left ? fixedX - page.x : page.x + page.width - fixedX);
  const maxHeight = Math.min(numericLimit(limits.maxHeight, Infinity), top ? fixedY - page.y : page.y + page.height - fixedY);

  if (limits.lockAspectRatio) {
    const ratio = typeof limits.lockAspectRatio === "number" ? limits.lockAspectRatio : frame.width / frame.height;
    if (vertical) {
      const y = gridSizes(page.y, page.height, fixedY, top, Math.max(minHeight, minWidth / ratio), Math.min(maxHeight, maxWidth / ratio));
      return { x: y?.map((height) => height * ratio), y };
    }
    const x = gridSizes(page.x, page.width, fixedX, left, Math.max(minWidth, minHeight * ratio), Math.min(maxWidth, maxHeight * ratio));
    return { x, y: x?.map((width) => width / ratio) };
  }

  return {
    x: horizontal ? gridSizes(page.x, page.width, fixedX, left, minWidth, maxWidth) : undefined,
    y: vertical ? gridSizes(page.y, page.height, fixedY, top, minHeight, maxHeight) : undefined,
  };
}
