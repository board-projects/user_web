import { SHEET_DOT_GRID } from "@/features/design/domain/sheetLayout";
import { useBoardStore } from "../store/board.store";
import { BoardViewport } from "./BoardViewport";

export function PageBackgrounds() {
  const pages = useBoardStore((state) => state.sheets);
  if (!pages.length) return null;

  return (
    <BoardViewport background>
      {pages.map((page) => (
        <div
          key={page.id}
          aria-hidden="true"
          className="absolute"
          style={{
            left: page.x,
            top: page.y,
            width: page.width,
            height: page.height,
            backgroundColor: page.backgroundColor ?? "#ffffff",
            backgroundImage: page.dots ? `radial-gradient(circle, ${SHEET_DOT_GRID.color} ${SHEET_DOT_GRID.radius}px, transparent 1px)` : undefined,
            backgroundSize: `${SHEET_DOT_GRID.step}px ${SHEET_DOT_GRID.step}px`,
          }}
        />
      ))}
    </BoardViewport>
  );
}
